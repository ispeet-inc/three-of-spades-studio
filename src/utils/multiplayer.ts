/**
 * Client-side multiplayer utilities for WebSocket communication
 */

import type {
  RoomConfig
} from "@/types/multiplayer";
import { io, Socket } from "socket.io-client";

const DEFAULT_SERVER_URL = "http://localhost:8080";

/**
 * Multiplayer client class for managing WebSocket connections
 */
export class MultiplayerClient {
  private socket: Socket | null = null;
  private serverUrl: string;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private eventForwardingSetup: boolean = false;

  constructor(serverUrl: string = DEFAULT_SERVER_URL) {
    this.serverUrl = serverUrl;
  }

  /**
   * Connect to the multiplayer server
   */
  connect(): Promise<void> {
    // If already connected, resolve immediately
    if (this.socket?.connected) {
      return Promise.resolve();
    }

    // Create a new connection promise
    return new Promise((resolve, reject) => {
      // If socket exists but is disconnected, let Socket.io's auto-reconnect handle it
      // Don't manually call connect() as it might interfere with reconnection logic
      if (this.socket && !this.socket.connected) {
        // Socket.io will auto-reconnect if reconnection is enabled
        // Just wait for it to connect
        const connectHandler = () => {
          console.log("Reconnected to multiplayer server");
          if (!this.eventForwardingSetup) {
            this.setupEventForwarding();
          }
          this.notifyListeners("connect", undefined);
          resolve();
        };
        const connectErrorHandler = (error: Error) => {
          console.error("Reconnection error:", error);
          this.notifyListeners("connect_error", error);
          reject(error);
        };
        // Use once to avoid duplicate handlers
        this.socket.once("connect", connectHandler);
        this.socket.once("connect_error", connectErrorHandler);
        return;
      }

      // Create new socket only if one doesn't exist
      this.socket = io(this.serverUrl, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      // Reset event forwarding flag for new socket
      this.eventForwardingSetup = false;

      // Handle connection events
      const connectHandler = () => {
        console.log("Connected to multiplayer server");
        if (!this.eventForwardingSetup) {
          this.setupEventForwarding();
        }
        this.notifyListeners("connect", undefined);
        resolve();
      };

      const connectErrorHandler = (error: Error) => {
        console.error("Connection error:", error);
        this.notifyListeners("connect_error", error);
        reject(error);
      };

      const disconnectHandler = (reason: string) => {
        console.log("Disconnected from server:", reason);
        this.notifyListeners("disconnect", reason);
      };

      this.socket.on("connect", connectHandler);
      this.socket.on("connect_error", connectErrorHandler);
      this.socket.on("disconnect", disconnectHandler);

      // If already connected, resolve immediately
      if (this.socket.connected) {
        connectHandler();
      }
    });
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
    this.eventForwardingSetup = false;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get socket ID
   */
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  /**
   * Set up event forwarding from socket to listeners
   */
  private setupEventForwarding(): void {
    if (!this.socket || this.eventForwardingSetup) return;

    // Forward all events to registered listeners
    const events = [
      "room:created",
      "room:joined",
      "player:joined",
      "player:left",
      "player:ready",
      "room:configUpdated",
      "bot:added",
      "bot:removed",
      "player:disconnected",
      "player:botTakeover",
      "player:reconnected",
      "player:rejoined",
      "game:action",
      "game:stateUpdate",
      "game:started",
      "error",
    ];

    events.forEach((event) => {
      this.socket?.on(event, (data) => {
        this.notifyListeners(event, data);
      });
    });

    this.eventForwardingSetup = true;
  }

  /**
   * Register an event listener
   */
  on(event: string, callback: (data: unknown) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Remove an event listener
   */
  off(event: string, callback: (data: unknown) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  /**
   * Notify all listeners for an event
   */
  private notifyListeners(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Create a new room
   */
  createRoom(
    playerId: string,
    playerName: string,
    config?: Partial<RoomConfig>
  ): void {
    if (!this.socket) {
      throw new Error("Not connected to server");
    }

    this.socket.emit("room:create", {
      playerId,
      playerName,
      config,
    });
  }

  /**
   * Join a room
   */
  joinRoom(roomId: string, playerId: string, playerName: string): void {
    if (!this.socket) {
      throw new Error("Not connected to server");
    }

    this.socket.emit("room:join", {
      roomId,
      playerId,
      playerName,
    });
  }

  /**
   * Leave a room
   */
  leaveRoom(roomId: string): void {
    if (!this.socket) {
      throw new Error("Not connected to server");
    }

    this.socket.emit("room:leave", { roomId });
  }

  /**
   * Update room configuration (host only)
   */
  updateRoomConfig(roomId: string, config: Partial<RoomConfig>): void {
    if (!this.socket) {
      throw new Error("Not connected to server");
    }

    this.socket.emit("room:updateConfig", {
      roomId,
      config,
    });
  }

  /**
   * Set player ready status
   */
  setPlayerReady(roomId: string, isReady: boolean): void {
    if (!this.socket) {
      throw new Error("Not connected to server");
    }

    this.socket.emit("player:setReady", {
      roomId,
      isReady,
    });
  }

  /**
   * Add a bot to the room (host only)
   */
  addBot(roomId: string, botName?: string): void {
    if (!this.socket) {
      throw new Error("Not connected to server");
    }

    this.socket.emit("room:addBot", { roomId, botName });
  }

  /**
   * Remove a bot from the room (host only)
   */
  removeBot(roomId: string, botId: string): void {
    if (!this.socket) {
      throw new Error("Not connected to server");
    }

    this.socket.emit("room:removeBot", {
      roomId,
      botId,
    });
  }

  /**
   * Reconnect to a room using reconnection token
   */
  reconnectToRoom(roomId: string, reconnectionToken: string): void {
    if (!this.socket) {
      throw new Error("Not connected to server");
    }

    this.socket.emit("player:reconnect", {
      roomId,
      reconnectionToken,
    });
  }

  /**
   * Send a game action to the server
   */
  sendGameAction(action: { type: string; payload?: unknown }): void {
    if (!this.socket) {
      throw new Error("Not connected to server");
    }

    this.socket.emit("game:action", {
      action: {
        type: action.type,
        payload: action.payload,
      },
      timestamp: Date.now(),
    });
  }

  /**
   * Start a game in a room
   */
  startGame(roomId: string): void {
    if (!this.socket) {
      throw new Error("Not connected to server");
    }

    this.socket.emit("game:start", { roomId });
  }
}

// Singleton instance to ensure all components share the same connection
// Use window to survive hot module reloads in development
const getGlobalSingleton = (): {
  client: MultiplayerClient | null;
  promise: Promise<void> | null;
} => {
  if (typeof window !== 'undefined') {
    if (!(window as any).__multiplayerClientInstance) {
      (window as any).__multiplayerClientInstance = {
        client: null,
        promise: null,
      };
    }
    return (window as any).__multiplayerClientInstance;
  }
  // Fallback for Node.js environments
  if (typeof globalThis !== 'undefined') {
    if (!(globalThis as any).__multiplayerClientInstance) {
      (globalThis as any).__multiplayerClientInstance = {
        client: null,
        promise: null,
      };
    }
    return (globalThis as any).__multiplayerClientInstance;
  }
  // Last resort: module-level (will reset on hot reload)
  return { client: null, promise: null };
};

/**
 * Create or get the singleton multiplayer client instance
 */
export function createMultiplayerClient(
  serverUrl?: string
): MultiplayerClient {
  const singleton = getGlobalSingleton();
  
  if (!singleton.client) {
    singleton.client = new MultiplayerClient(serverUrl);
    // Auto-connect when singleton is created (only once, globally)
    singleton.promise = singleton.client.connect().catch((err) => {
      console.error("Failed to auto-connect multiplayer client:", err);
      singleton.promise = null; // Reset on error so we can retry
      throw err;
    });
  }
  // If already connecting, return the existing promise's client
  // This ensures all callers wait for the same connection
  return singleton.client;
}

/**
 * Get the global connection promise (for waiting on initial connection)
 */
export function getConnectionPromise(): Promise<void> | null {
  return getGlobalSingleton().promise;
}
