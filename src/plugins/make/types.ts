export interface MakeWebhook {
  id: string;
  name: string;
  url: string;
  service: MakeServiceType;
  trigger: MakeTriggerType;
  pattern?: string;
  command?: string;
  enabled: boolean;
  roomId?: string; // Optional room-specific webhook
  createdBy: string;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

export interface MessageParser {
  id: string;
  name: string;
  pattern: string; // Regex pattern
  extractionMap: Record<string, string>; // Maps capture groups to webhook parameters
  service: MakeServiceType;
  enabled: boolean;
}

export interface ServiceTemplate {
  id: string;
  name: string;
  service: MakeServiceType;
  description: string;
  icon?: string;
  defaultParser: MessageParser;
  webhookTemplate: Omit<MakeWebhook, "id" | "url" | "createdBy" | "createdAt">;
  sampleMessage: string;
  expectedOutput: string;
}

export interface MakeSettings {
  globalEnabled: boolean;
  defaultBotReply: boolean;
  botReplyPrefix: string;
  errorNotifications: boolean;
  webhookTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  logWebhookCalls: boolean;
}

export interface WebhookPayload {
  service: MakeServiceType;
  roomId: string;
  roomName?: string;
  sender: string;
  senderDisplayName?: string;
  messageId: string;
  timestamp: number;
  originalMessage: string;
  extractedData: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface WebhookResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface ParsedTaskData {
  taskName: string | null;
  taskDescription: string | null;
}

export type MakeServiceType = "trello" | "gmail" | "google-sheets" | "slack" | "calendar" | "custom";

export type MakeTriggerType =
  | "pattern" // Regex pattern matching
  | "command" // Slash command or @bot mention
  | "reaction" // React to specific emoji
  | "manual"; // Manual trigger via UI

export interface TrelloTaskData {
  taskName: string;
  taskDescription: string;
  boardId?: string;
  listId?: string;
  labels?: string[];
  dueDate?: string;
  assignee?: string;
}

export interface GmailData {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  attachments?: string[];
}

export interface SheetsData {
  sheetId: string;
  range?: string;
  values: string[][];
}

export interface MakePluginState {
  webhooks: MakeWebhook[];
  parsers: MessageParser[];
  settings: MakeSettings;
  templates: ServiceTemplate[];
}
