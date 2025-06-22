import { matrixClient } from "./client";
import { addMessageAtom, updateRoomAtom, setTypingAtom, connectionStatusAtom, syncStatusAtom } from "@/lib/store/atoms";
import { MessageSchema, RoomSchema } from "@/schemas";
import { getDefaultStore } from "jotai";

const store = getDefaultStore();

export class MatrixSyncManager {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    // Set up Matrix client event listeners
    matrixClient.on("sync", this.handleSync.bind(this));
    matrixClient.on("timeline", this.handleTimeline.bind(this));
    matrixClient.on("receipt", this.handleReceipt.bind(this));
    matrixClient.on("typing", this.handleTyping.bind(this));
    matrixClient.on("membership", this.handleMembership.bind(this));
    matrixClient.on("error", this.handleError.bind(this));

    this.isInitialized = true;
  }

  private handleSync({ state }: { state: string; prevState?: unknown; data?: unknown }) {
    console.log("Sync state changed:", state);

    switch (state) {
      case "PREPARED":
        store.set(connectionStatusAtom, "connected");
        store.set(syncStatusAtom, "synced");
        this.loadInitialData();
        break;
      case "SYNCING":
        store.set(syncStatusAtom, "syncing");
        break;
      case "ERROR":
        store.set(connectionStatusAtom, "error");
        break;
    }
  }

  private handleTimeline({
    event,
    room,
    toStartOfTimeline,
  }: {
    event: unknown;
    room: unknown;
    toStartOfTimeline: boolean;
  }) {
    if (toStartOfTimeline) return; // Don't process paginated events

    try {
      // Convert Matrix event to our message schema
      const message = MessageSchema.parse({
        id: (event as any).getId(),
        roomId: (room as any).roomId,
        sender: (event as any).getSender(),
        content: (event as any).getContent(),
        timestamp: (event as any).getTs(),
        edited: false,
        reactions: this.extractReactions(event),
        replyTo: this.extractReplyTo(event),
        threadId: this.extractThreadId(event),
        isEncrypted: (event as any).isEncrypted(),
      });

      // Add to store
      store.set(addMessageAtom, { roomId: (room as any).roomId, message });

      // Update room's last message
      this.updateRoomLastMessage(room, message);
    } catch (error) {
      console.error("Failed to process timeline event:", error);
    }
  }

  private handleReceipt(_: { event: unknown; room: unknown }) {
    // TODO: Handle read receipts
    console.log("Read receipt received");
  }

  private handleTyping({ member }: { event?: unknown; member: any }) {
    const roomId = member.roomId;

    // Get current typing users for room
    const room = matrixClient.getRoom(roomId);
    if (!room) return;

    const typingMembers = room.getTypingMembers();
    const typingUserIds = typingMembers.map((m: any) => m.userId);

    store.set(setTypingAtom, { roomId, userIds: typingUserIds });
  }

  private handleMembership({ room }: { room: unknown; membership?: unknown; prevMembership?: unknown }) {
    this.updateRoomFromMatrix(room);
  }

  private handleError({ type, error }: { type: string; error: unknown }) {
    console.error(`Matrix ${type} error:`, error);
    store.set(connectionStatusAtom, "error");
  }

  private loadInitialData() {
    const rooms = matrixClient.getRooms();

    rooms.forEach((room) => {
      this.updateRoomFromMatrix(room);

      // Load recent messages
      const timeline = room.getLiveTimeline();
      const events = timeline.getEvents();

      events.forEach((event) => {
        if (event.getType() === "m.room.message") {
          this.handleTimeline({ event, room, toStartOfTimeline: false });
        }
      });
    });
  }

  private updateRoomFromMatrix(matrixRoom) {
    try {
      const room = RoomSchema.parse({
        id: matrixRoom.roomId,
        name: matrixRoom.name,
        topic: matrixRoom.currentState.getStateEvents("m.room.topic", "")?.getContent()?.topic,
        avatarUrl: matrixRoom.getAvatarUrl("", 32, 32, "crop"),
        isDirect: matrixRoom.guessDMInviter() !== null,
        isEncrypted: matrixRoom.hasEncryptionStateEvent(),
        memberCount: matrixRoom.getJoinedMemberCount(),
        unreadCount: matrixRoom.getUnreadNotificationCount(),
        highlightCount: matrixRoom.getUnreadNotificationCount("highlight"),
        tags: Object.keys(matrixRoom.tags || {}),
      });

      store.set(updateRoomAtom, room);
    } catch (error) {
      console.error("Failed to update room:", error);
    }
  }

  private updateRoomLastMessage(room, message) {
    const currentRoom = store.get(updateRoomAtom);
    // Update room with last message info
    // This will be implemented when we add derived state
  }

  private extractReactions(event) {
    // TODO: Extract reactions from event annotations
    return [];
  }

  private extractReplyTo(event) {
    const relatesTo = event.getContent()["m.relates_to"];
    if (relatesTo && relatesTo["m.in_reply_to"]) {
      return relatesTo["m.in_reply_to"].event_id;
    }
    return undefined;
  }

  private extractThreadId(event) {
    const relatesTo = event.getContent()["m.relates_to"];
    if (relatesTo && relatesTo.rel_type === "m.thread") {
      return relatesTo.event_id;
    }
    return undefined;
  }
}

export const syncManager = new MatrixSyncManager();
