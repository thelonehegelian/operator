import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { AuthState, Room, Message, Settings, Plugin, User } from "@/schemas";

// Auth state atom
export const authAtom = atomWithStorage<AuthState>("matrix-auth", {
  isAuthenticated: false,
  isGuest: false,
});

// Current user atom
export const currentUserAtom = atom<User | null>(null);

// Rooms atom
export const roomsAtom = atom<Room[]>([]);

// Selected room atom
export const selectedRoomIdAtom = atom<string | null>(null);
export const selectedRoomAtom = atom((get) => {
  const roomId = get(selectedRoomIdAtom);
  const rooms = get(roomsAtom);
  return rooms.find((room) => room.id === roomId) || null;
});

// Messages atom - organized by room
export const messagesAtom = atom<Record<string, Message[]>>({});

// Messages for selected room
export const selectedRoomMessagesAtom = atom((get) => {
  const roomId = get(selectedRoomIdAtom);
  const messages = get(messagesAtom);
  return roomId ? messages[roomId] || [] : [];
});

// Settings atom
export const settingsAtom = atomWithStorage<Settings>("matrix-settings", {
  theme: "system",
  notifications: {
    enabled: true,
    sound: true,
    desktop: true,
    mentions: true,
  },
  privacy: {
    readReceipts: true,
    typingIndicators: true,
    onlineStatus: true,
  },
  chat: {
    enterToSend: true,
    markdownEnabled: true,
    emojiEnabled: true,
    timeFormat: "24h",
  },
  bridges: {},
});

// Plugins atom
export const pluginsAtom = atomWithStorage<Plugin[]>("matrix-plugins", []);

// Active plugins atom
export const activePluginsAtom = atom((get) => {
  const plugins = get(pluginsAtom);
  return plugins.filter((plugin) => plugin.enabled);
});

// Typing indicators atom
export const typingIndicatorsAtom = atom<Record<string, string[]>>({});

// Selected room typing indicators
export const selectedRoomTypingAtom = atom((get) => {
  const roomId = get(selectedRoomIdAtom);
  const typing = get(typingIndicatorsAtom);
  return roomId ? typing[roomId] || [] : [];
});

// Connection status atom
export const connectionStatusAtom = atom<"connecting" | "connected" | "disconnected" | "error">("disconnected");

// Sync status atom
export const syncStatusAtom = atom<"syncing" | "synced" | "error">("synced");

// UI state atoms
export const sidebarOpenAtom = atom(true);
export const searchQueryAtom = atom("");
export const filteredRoomsAtom = atom((get) => {
  const rooms = get(roomsAtom);
  const query = get(searchQueryAtom).toLowerCase();

  if (!query) return rooms;

  return rooms.filter(
    (room) =>
      room.name?.toLowerCase().includes(query) ||
      room.id.toLowerCase().includes(query) ||
      room.lastMessage?.content.toLowerCase().includes(query)
  );
});

// Actions
export const addMessageAtom = atom(null, (get, set, { roomId, message }: { roomId: string; message: Message }) => {
  const messages = get(messagesAtom);
  const roomMessages = messages[roomId] || [];

  // Check if message already exists
  const existingIndex = roomMessages.findIndex((m) => m.id === message.id);

  if (existingIndex >= 0) {
    // Update existing message
    roomMessages[existingIndex] = message;
  } else {
    // Add new message in chronological order
    const insertIndex = roomMessages.findIndex((m) => m.timestamp > message.timestamp);
    if (insertIndex >= 0) {
      roomMessages.splice(insertIndex, 0, message);
    } else {
      roomMessages.push(message);
    }
  }

  set(messagesAtom, {
    ...messages,
    [roomId]: roomMessages,
  });
});

export const updateRoomAtom = atom(null, (get, set, room: Room) => {
  const rooms = get(roomsAtom);
  const existingIndex = rooms.findIndex((r) => r.id === room.id);

  if (existingIndex >= 0) {
    rooms[existingIndex] = room;
  } else {
    rooms.push(room);
  }

  set(roomsAtom, [...rooms]);
});

export const setTypingAtom = atom(null, (get, set, { roomId, userIds }: { roomId: string; userIds: string[] }) => {
  const typing = get(typingIndicatorsAtom);
  set(typingIndicatorsAtom, {
    ...typing,
    [roomId]: userIds,
  });
});
