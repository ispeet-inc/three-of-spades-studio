/**
 * Client-side multiplayer utilities for WebSocket communication
 */

import { io, Socket } from "socket.io-client";
import type {
  BotPlayer,
  ClientMessage,
  Player,
  RoomConfig,
  ServerMessage,
} from "@/types/multiplayer";

const DEFAULT_SERVER_URL = "http://localhost:8080";

/**
 * Multiplayer client class for managing WebSocket connections
 */
export class MultiplayerClient {
  private socket: Socket | null = null;
  private serverUrl: string;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

  constructor(serverUrl: string = DEFAULT_SERVER_URL) {
    this.serverUrl = serverUrl;
  }

  /**
   * Connect to the multiplayer server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(this.serverUrl, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      // Handle connection events
      const connectHandler = () => {
        console.log("Connected to multiplayer server");
        this.setupEventForwarding();
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
    if (!this.socket) return;

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
  addBot(roomId: string): void {
    if (!this.socket) {
      throw new Error("Not connected to server");
    }

    this.socket.emit("room:addBot", { roomId });
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

/**
 * Create a multiplayer client instance
 */
export function createMultiplayerClient(
  serverUrl?: string
): MultiplayerClient {
  return new MultiplayerClient(serverUrl);
}

