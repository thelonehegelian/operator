/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthState } from "@/schemas";

// Dynamic imports for Matrix SDK types and functions
let MatrixClient: any;
let createClient: any;
let ClientEvent: any;
let RoomEvent: any;
let RoomMemberEvent: any;

// Initialize Matrix SDK imports on client side only
const initializeMatrixSDK = async () => {
  if (typeof window === "undefined") {
    throw new Error("Matrix SDK can only be initialized on client side");
  }

  if (!MatrixClient) {
    const matrixSDK = await import("matrix-js-sdk");
    MatrixClient = matrixSDK.MatrixClient;
    createClient = matrixSDK.createClient;
    ClientEvent = matrixSDK.ClientEvent;
    RoomEvent = matrixSDK.RoomEvent;
    RoomMemberEvent = matrixSDK.RoomMemberEvent;
  }
};

type EventCallback = (...args: unknown[]) => void;

class MatrixClientManager {
  private client: any = null;
  private eventListeners: Map<string, EventCallback[]> = new Map();

  async initialize(authState: AuthState): Promise<any> {
    if (!authState.isAuthenticated || !authState.accessToken || !authState.homeserver) {
      throw new Error("Invalid authentication state");
    }

    try {
      // Initialize Matrix SDK
      await initializeMatrixSDK();

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

  private async setupEventListeners() {
    if (!this.client) return;

    // Ensure Matrix SDK is initialized
    await initializeMatrixSDK();

    // Sync events
    this.client.on(ClientEvent.Sync, (state: any, prevState: any, data: any) => {
      this.emit("sync", { state, prevState, data });
    });

    // Room events
    this.client.on(RoomEvent.Timeline, (event: any, room: any, toStartOfTimeline: any) => {
      this.emit("timeline", { event, room, toStartOfTimeline });
    });

    this.client.on(RoomEvent.Receipt, (event: any, room: any) => {
      this.emit("receipt", { event, room });
    });

    this.client.on(RoomEvent.MyMembership, (room: any, membership: any, prevMembership: any) => {
      this.emit("membership", { room, membership, prevMembership });
    });

    // Member events
    this.client.on(RoomMemberEvent.Typing, (event: any, member: any) => {
      this.emit("typing", { event, member });
    });

    this.client.on(RoomMemberEvent.PowerLevel, (event: any, member: any) => {
      this.emit("powerLevel", { event, member });
    });

    // Error handling
    this.client.on(ClientEvent.SyncUnexpectedError, (error: any) => {
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
  async sendMessage(roomId: string, content: any) {
    if (!this.client) throw new Error("Client not initialized");

    try {
      return await this.client.sendEvent(roomId, "m.room.message", content);
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

  async createRoom(options: any) {
    if (!this.client) throw new Error("Client not initialized");

    try {
      return await this.client.createRoom(options);
    } catch (error) {
      console.error("Failed to create room:", error);
      throw new Error("Room creation failed");
    }
  }

  getClient(): any {
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
