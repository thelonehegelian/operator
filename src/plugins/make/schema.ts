import { z } from "zod";

export const MakeServiceTypeSchema = z.enum(["trello", "gmail", "google-sheets", "slack", "calendar", "custom"]);

export const MakeTriggerTypeSchema = z.enum(["pattern", "command", "reaction", "manual"]);

export const MakeWebhookSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  service: MakeServiceTypeSchema,
  trigger: MakeTriggerTypeSchema,
  pattern: z.string().optional(),
  command: z.string().optional(),
  enabled: z.boolean().default(true),
  roomId: z.string().optional(),
  createdBy: z.string(),
  createdAt: z.string(),
  lastTriggered: z.string().optional(),
  triggerCount: z.number().default(0),
});

export const MessageParserSchema = z.object({
  id: z.string(),
  name: z.string(),
  pattern: z.string(),
  extractionMap: z.record(z.string()),
  service: MakeServiceTypeSchema,
  enabled: z.boolean().default(true),
});

export const ServiceTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  service: MakeServiceTypeSchema,
  description: z.string(),
  icon: z.string().optional(),
  defaultParser: MessageParserSchema,
  webhookTemplate: MakeWebhookSchema.omit({
    id: true,
    url: true,
    createdBy: true,
    createdAt: true,
  }),
  sampleMessage: z.string(),
  expectedOutput: z.string(),
});

export const MakeSettingsSchema = z.object({
  globalEnabled: z.boolean().default(true),
  defaultBotReply: z.boolean().default(true),
  botReplyPrefix: z.string().default("🤖 Make Automation: "),
  errorNotifications: z.boolean().default(true),
  webhookTimeout: z.number().default(5000),
  retryAttempts: z.number().default(3),
  retryDelay: z.number().default(1000),
  logWebhookCalls: z.boolean().default(true),
});

export const WebhookPayloadSchema = z.object({
  service: MakeServiceTypeSchema,
  roomId: z.string(),
  roomName: z.string().optional(),
  sender: z.string(),
  senderDisplayName: z.string().optional(),
  messageId: z.string(),
  timestamp: z.number(),
  originalMessage: z.string(),
  extractedData: z.record(z.unknown()),
  metadata: z.record(z.unknown()).optional(),
});

export const WebhookResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
  error: z.string().optional(),
});

export const ParsedTaskDataSchema = z.object({
  taskName: z.string().nullable(),
  taskDescription: z.string().nullable(),
});

export const TrelloTaskDataSchema = z.object({
  taskName: z.string(),
  taskDescription: z.string(),
  boardId: z.string().optional(),
  listId: z.string().optional(),
  labels: z.array(z.string()).optional(),
  dueDate: z.string().optional(),
  assignee: z.string().optional(),
});

export const GmailDataSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  body: z.string(),
  cc: z.string().email().optional(),
  bcc: z.string().email().optional(),
  attachments: z.array(z.string()).optional(),
});

export const SheetsDataSchema = z.object({
  sheetId: z.string(),
  range: z.string().optional(),
  values: z.array(z.array(z.string())),
});

export const MakePluginStateSchema = z.object({
  webhooks: z.array(MakeWebhookSchema),
  parsers: z.array(MessageParserSchema),
  settings: MakeSettingsSchema,
  templates: z.array(ServiceTemplateSchema),
});

// Export inferred types
export type MakeWebhook = z.infer<typeof MakeWebhookSchema>;
export type MessageParser = z.infer<typeof MessageParserSchema>;
export type ServiceTemplate = z.infer<typeof ServiceTemplateSchema>;
export type MakeSettings = z.infer<typeof MakeSettingsSchema>;
export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;
export type WebhookResponse = z.infer<typeof WebhookResponseSchema>;
export type ParsedTaskData = z.infer<typeof ParsedTaskDataSchema>;
export type TrelloTaskData = z.infer<typeof TrelloTaskDataSchema>;
export type GmailData = z.infer<typeof GmailDataSchema>;
export type SheetsData = z.infer<typeof SheetsDataSchema>;
export type MakePluginState = z.infer<typeof MakePluginStateSchema>;
