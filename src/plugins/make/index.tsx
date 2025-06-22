"use client";

import React, { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { messagesAtom, authAtom } from "@/lib/store/atoms";
import { matrixClient } from "@/lib/matrix/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MakeWebhookClient, triggerMakeWebhook } from "./utils/webhook";
import { parseTaskAndDescription, MessagePatternParser, DEFAULT_PARSERS } from "./utils/parsers";
import { SERVICE_TEMPLATES, getTemplateByService } from "./utils/templates";
import { MakeSettings, MakeWebhook, MessageParser, WebhookPayload, MakePluginState } from "./schema";

// Default settings for the Make plugin
const DEFAULT_SETTINGS: MakeSettings = {
  globalEnabled: true,
  defaultBotReply: true,
  botReplyPrefix: "🤖 Make Automation: ",
  errorNotifications: true,
  webhookTimeout: 5000,
  retryAttempts: 3,
  retryDelay: 1000,
  logWebhookCalls: true,
};

// Plugin state management (in a real implementation, this would be persistent)
let pluginState: MakePluginState = {
  webhooks: [],
  parsers: DEFAULT_PARSERS,
  settings: DEFAULT_SETTINGS,
  templates: SERVICE_TEMPLATES,
};

export default function MakePlugin() {
  const [auth] = useAtom(authAtom);
  const [messages] = useAtom(messagesAtom);
  const [webhookClient, setWebhookClient] = useState<MakeWebhookClient | null>(null);
  const [messageParser, setMessageParser] = useState<MessagePatternParser | null>(null);
  const [isEnabled, setIsEnabled] = useState(pluginState.settings.globalEnabled);
  const [activeWebhooks, setActiveWebhooks] = useState<MakeWebhook[]>(pluginState.webhooks);

  // Initialize the plugin
  useEffect(() => {
    const client = new MakeWebhookClient(pluginState.settings);
    const parser = new MessagePatternParser(pluginState.parsers);

    setWebhookClient(client);
    setMessageParser(parser);

    // Set up Matrix event listeners
    setupMatrixListeners(client, parser);

    return () => {
      // Cleanup listeners if needed
    };
  }, []);

  /**
   * Set up Matrix event listeners based on existing implementation
   */
  function setupMatrixListeners(client: MakeWebhookClient, parser: MessagePatternParser) {
    const matrixClientInstance = matrixClient.getClient();
    if (!matrixClientInstance) return;

    // Listen for new messages (from existing implementation)
    matrixClientInstance.on("Room.timeline", async (event: any, room: any, toStartOfTimeline: boolean) => {
      if (toStartOfTimeline) return; // Don't process paginated results
      if (!isEnabled) return;

      const eventTime = event.getTs();
      const scriptStart = Date.now() - 60000; // 1 minute buffer

      if (scriptStart > eventTime) {
        return; // Don't run for old messages
      }

      if (event.getType() === "m.room.message") {
        await handleMatrixMessage(event, room, client, parser);
      }
    });
  }

  /**
   * Handle incoming Matrix messages (adapted from existing implementation)
   */
  async function handleMatrixMessage(event: any, room: any, client: MakeWebhookClient, parser: MessagePatternParser) {
    const content = event.getContent();
    const msgBody = content?.body;
    const sender = event.getSender();
    const roomId = room.roomId;

    if (typeof msgBody !== "string" || msgBody.length === 0) return;

    // Ignore bot replies to prevent loops
    if (msgBody.startsWith(pluginState.settings.botReplyPrefix)) {
      return;
    }

    // Check for Trello task format (existing implementation compatibility)
    const { taskName, taskDescription } = parseTaskAndDescription(msgBody);

    if (taskName && taskDescription) {
      await handleTrelloTask(taskName, taskDescription, roomId, sender, event.getId());
      return;
    }

    // Check for other patterns
    const parseResults = parser.parseMessage(msgBody);

    for (const result of parseResults) {
      const webhook = findWebhookForParser(result.parser, roomId);
      if (webhook) {
        await triggerWebhookFromParsing(webhook, result.extractedData, roomId, sender, event.getId(), msgBody, client);
      }
    }
  }

  /**
   * Handle Trello task creation (from existing implementation)
   */
  async function handleTrelloTask(
    taskName: string,
    taskDescription: string,
    roomId: string,
    sender: string,
    messageId: string
  ) {
    console.log(`Parsed Task: "${taskName}", Description: "${taskDescription}" from ${sender}`);

    try {
      // Use legacy function for backward compatibility
      await triggerMakeWebhook(taskName, taskDescription);

      // Send bot reply
      if (pluginState.settings.defaultBotReply) {
        const replyMessage = `${pluginState.settings.botReplyPrefix}Task Created in Trello`;
        await matrixClient.sendMessage(roomId, replyMessage);
      }
    } catch (error) {
      console.error("Error triggering webhook or sending reply for parsed task. Sender was:", sender);

      if (pluginState.settings.errorNotifications) {
        const errorMessage = `${pluginState.settings.botReplyPrefix}Failed to create Trello task`;
        await matrixClient.sendMessage(roomId, errorMessage);
      }
    }
  }

  /**
   * Trigger webhook from parsing results
   */
  async function triggerWebhookFromParsing(
    webhook: MakeWebhook,
    extractedData: Record<string, string>,
    roomId: string,
    sender: string,
    messageId: string,
    originalMessage: string,
    client: MakeWebhookClient
  ) {
    const payload: WebhookPayload = {
      service: webhook.service,
      roomId,
      sender,
      messageId,
      timestamp: Date.now(),
      originalMessage,
      extractedData,
    };

    try {
      const response = await client.triggerWebhook(webhook.url, payload);

      if (response.success && pluginState.settings.defaultBotReply) {
        const replyMessage = `${pluginState.settings.botReplyPrefix}${
          response.message || "Automation triggered successfully"
        }`;
        await matrixClient.sendMessage(roomId, replyMessage);
      } else if (!response.success && pluginState.settings.errorNotifications) {
        const errorMessage = `${pluginState.settings.botReplyPrefix}Automation failed: ${response.error}`;
        await matrixClient.sendMessage(roomId, errorMessage);
      }

      // Update webhook trigger count
      webhook.triggerCount++;
      webhook.lastTriggered = new Date().toISOString();
    } catch (error) {
      console.error(`Error triggering webhook ${webhook.id}:`, error);

      if (pluginState.settings.errorNotifications) {
        const errorMessage = `${pluginState.settings.botReplyPrefix}Automation error occurred`;
        await matrixClient.sendMessage(roomId, errorMessage);
      }
    }
  }

  /**
   * Find webhook for a given parser and room
   */
  function findWebhookForParser(parser: MessageParser, roomId?: string): MakeWebhook | undefined {
    return pluginState.webhooks.find(
      (webhook) =>
        webhook.enabled && webhook.service === parser.service && (webhook.roomId === roomId || !webhook.roomId) // Global or room-specific
    );
  }

  /**
   * Add a new webhook from template
   */
  function addWebhookFromTemplate(templateId: string, webhookUrl: string, roomId?: string) {
    const template = SERVICE_TEMPLATES.find((t) => t.id === templateId);
    if (!template || !auth?.user) return;

    const newWebhook: MakeWebhook = {
      ...template.webhookTemplate,
      id: `${templateId}-${Date.now()}`,
      url: webhookUrl,
      createdBy: auth.user.id,
      createdAt: new Date().toISOString(),
      roomId,
    };

    pluginState.webhooks.push(newWebhook);
    setActiveWebhooks([...pluginState.webhooks]);
  }

  /**
   * Toggle plugin enabled state
   */
  function togglePlugin() {
    pluginState.settings.globalEnabled = !pluginState.settings.globalEnabled;
    setIsEnabled(pluginState.settings.globalEnabled);
  }

  if (!auth?.user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Make.com Integration</CardTitle>
          <CardDescription>Please log in to use Make.com automation features</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Make.com Integration
            <Badge variant={isEnabled ? "default" : "secondary"}>{isEnabled ? "Enabled" : "Disabled"}</Badge>
          </CardTitle>
          <CardDescription>Automate workflows using Make.com webhooks with flexible message parsing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button onClick={togglePlugin} variant={isEnabled ? "destructive" : "default"}>
              {isEnabled ? "Disable Plugin" : "Enable Plugin"}
            </Button>
            <div className="text-sm text-muted-foreground">{activeWebhooks.length} active webhooks</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Templates</CardTitle>
          <CardDescription>Quick setup for popular Make.com integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SERVICE_TEMPLATES.map((template) => (
              <Card key={template.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{template.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    <div className="mt-2">
                      <Badge variant="outline">{template.service}</Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button size="sm" variant="outline" disabled>
                    Configure Webhook
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trello Quick Setup</CardTitle>
          <CardDescription>Based on your existing implementation - ready to use!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium">How to use:</h4>
              <ol className="mt-2 text-sm space-y-1 list-decimal list-inside">
                <li>
                  Set your <code>MAKE_WEBHOOK_URL</code> environment variable
                </li>
                <li>Send a message in this format:</li>
              </ol>
              <div className="mt-3 p-3 bg-background rounded border font-mono text-sm">
                Task: Fix the login bug
                <br />
                Description: Users cannot authenticate with their Matrix credentials
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                The bot will automatically create a Trello card and reply with confirmation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
