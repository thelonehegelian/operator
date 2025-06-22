import { z } from "zod";

// Core Matrix schemas
export const UserSchema = z.object({
  id: z.string(),
  displayName: z.string().optional(),
  avatarUrl: z.string().optional(),
  presence: z.enum(["online", "offline", "unavailable"]).default("offline"),
  lastActiveAgo: z.number().optional(),
  statusMessage: z.string().optional(),
});

export const RoomSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  topic: z.string().optional(),
  avatarUrl: z.string().optional(),
  isDirect: z.boolean().default(false),
  isEncrypted: z.boolean().default(false),
  memberCount: z.number().default(0),
  unreadCount: z.number().default(0),
  highlightCount: z.number().default(0),
  lastMessage: z
    .object({
      content: z.string(),
      sender: z.string(),
      timestamp: z.number(),
      type: z.string(),
    })
    .optional(),
  tags: z.array(z.string()).default([]),
  bridgeInfo: z
    .object({
      type: z.enum(["whatsapp", "telegram", "discord", "signal"]).optional(),
      identifier: z.string().optional(),
      status: z.enum(["connected", "disconnected", "error"]).optional(),
    })
    .optional(),
});

export const MessageSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  sender: z.string(),
  content: z.object({
    msgtype: z.string(),
    body: z.string(),
    formatted_body: z.string().optional(),
    format: z.string().optional(),
    url: z.string().optional(),
    info: z.record(z.any()).optional(),
  }),
  timestamp: z.number(),
  edited: z.boolean().default(false),
  reactions: z
    .array(
      z.object({
        key: z.string(),
        users: z.array(z.string()),
        count: z.number(),
      })
    )
    .default([]),
  replyTo: z.string().optional(),
  threadId: z.string().optional(),
  isEncrypted: z.boolean().default(false),
  decryptionError: z.string().optional(),
});

export const AuthStateSchema = z.object({
  isAuthenticated: z.boolean(),
  user: UserSchema.optional(),
  accessToken: z.string().optional(),
  homeserver: z.string().optional(),
  deviceId: z.string().optional(),
  isGuest: z.boolean().default(false),
});

export const PluginSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  description: z.string(),
  author: z.string(),
  type: z.enum(["message-renderer", "input-extension", "sidebar-panel", "settings-page", "automation"]),
  enabled: z.boolean().default(true),
  settings: z.record(z.any()).default({}),
  hooks: z.array(z.string()).default([]),
  permissions: z.array(z.string()).default([]),
});

export const SettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("system"),
  notifications: z.object({
    enabled: z.boolean().default(true),
    sound: z.boolean().default(true),
    desktop: z.boolean().default(true),
    mentions: z.boolean().default(true),
  }),
  privacy: z.object({
    readReceipts: z.boolean().default(true),
    typingIndicators: z.boolean().default(true),
    onlineStatus: z.boolean().default(true),
  }),
  chat: z.object({
    enterToSend: z.boolean().default(true),
    markdownEnabled: z.boolean().default(true),
    emojiEnabled: z.boolean().default(true),
    timeFormat: z.enum(["12h", "24h"]).default("24h"),
  }),
  bridges: z
    .record(
      z.object({
        enabled: z.boolean(),
        settings: z.record(z.any()),
      })
    )
    .default({}),
});

// Export types
export type User = z.infer<typeof UserSchema>;
export type Room = z.infer<typeof RoomSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type AuthState = z.infer<typeof AuthStateSchema>;
export type Plugin = z.infer<typeof PluginSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
