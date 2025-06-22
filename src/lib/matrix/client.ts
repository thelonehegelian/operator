import {
  MatrixClient,
  createClient,
  ClientEvent,
  RoomEvent,
  RoomMemberEvent,
  IContent,
  ICreateRoomOpts,
} from "matrix-js-sdk";
import { AuthState } from "@/schemas";

type EventCallback = (...args: unknown[]) => void;

class MatrixClientManager {
  private client: MatrixClient | null = null;
  private eventListeners: Map<string, EventCallback[]> = new Map();

  async initialize(authState: AuthState): Promise<MatrixClient> {
    if (!authState.isAuthenticated || !authState.accessToken || !authState.homeserver) {
      throw new Error("Invalid authentication state");
    }

    try {
      // Create client with authentication
      this.client = createClient({
        baseUrl: authState.homeserver,
        accessToken: authState.accessToken,
        userId: authState.user?.id,
        deviceId: authState.deviceId,
      });

      // Set up event listeners
      this.setupEventListeners();

      // Start the client
      await this.client.startClient({ initialSyncLimit: 50 });

      return this.client;
    } catch (error) {
      console.error("Failed to initialize Matrix client:", error);
      throw new Error("Matrix client initialization failed");
    }
  }

  private setupEventListeners() {
    if (!this.client) return;

    // Sync events
    this.client.on(ClientEvent.Sync, (state, prevState, data) => {
      this.emit("sync", { state, prevState, data });
    });

    // Room events
    this.client.on(RoomEvent.Timeline, (event, room, toStartOfTimeline) => {
      this.emit("timeline", { event, room, toStartOfTimeline });
    });

    this.client.on(RoomEvent.Receipt, (event, room) => {
      this.emit("receipt", { event, room });
    });

    this.client.on(RoomEvent.MyMembership, (room, membership, prevMembership) => {
      this.emit("membership", { room, membership, prevMembership });
    });

    // Member events
    this.client.on(RoomMemberEvent.Typing, (event, member) => {
      this.emit("typing", { event, member });
    });

    this.client.on(RoomMemberEvent.PowerLevel, (event, member) => {
      this.emit("powerLevel", { event, member });
    });

    // Error handling
    this.client.on(ClientEvent.SyncUnexpectedError, (error) => {
      console.error("Sync error:", error);
      this.emit("error", { type: "sync", error });
    });
  }

  // Event emitter functionality
  on(event: string, callback: EventCallback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: unknown) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => callback(data));
    }
  }

  // Matrix API methods
  async sendMessage(roomId: string, content: IContent) {
    if (!this.client) throw new Error("Client not initialized");

    try {
      return await this.client.sendEvent(roomId, "m.room.message" as any, content);
    } catch (error) {
      console.error("Failed to send message:", error);
      throw new Error("Message sending failed");
    }
  }

  async joinRoom(roomIdOrAlias: string) {
    if (!this.client) throw new Error("Client not initialized");

    try {
      return await this.client.joinRoom(roomIdOrAlias);
    } catch (error) {
      console.error("Failed to join room:", error);
      throw new Error("Room join failed");
    }
  }

  async leaveRoom(roomId: string) {
    if (!this.client) throw new Error("Client not initialized");

    try {
      return await this.client.leave(roomId);
    } catch (error) {
      console.error("Failed to leave room:", error);
      throw new Error("Room leave failed");
    }
  }

  async createRoom(options: ICreateRoomOpts) {
    if (!this.client) throw new Error("Client not initialized");

    try {
      return await this.client.createRoom(options);
    } catch (error) {
      console.error("Failed to create room:", error);
      throw new Error("Room creation failed");
    }
  }

  getClient(): MatrixClient | null {
    return this.client;
  }

  getRooms() {
    if (!this.client) return [];
    return this.client.getRooms();
  }

  getRoom(roomId: string) {
    if (!this.client) return null;
    return this.client.getRoom(roomId);
  }

  async stop() {
    if (this.client) {
      this.client.stopClient();
      this.client = null;
    }
    this.eventListeners.clear();
  }
}

// Export singleton instance
export const matrixClient = new MatrixClientManager();
export default matrixClient;
