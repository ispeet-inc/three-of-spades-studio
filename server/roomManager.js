/**
 * Room management for multiplayer game rooms
 */

import { v4 as uuidv4 } from "uuid";

// List of 20 simple 3-letter words for room codes
const ROOM_WORDS = [
  "ant", "axe", "bad", "bat", "bee",
  "box", "cat", "dog", "egg", "fox",
  "hat", "ice", "jam", "key", "log",
  "map", "net", "owl", "pig", "rat"
];

/**
 * Generate a unique room ID using format: word### (e.g., "ant123", "dog456")
 */
export function generateRoomId() {
  // Pick a random word from the list
  const word = ROOM_WORDS[Math.floor(Math.random() * ROOM_WORDS.length)];
  
  // Generate a random 3-digit number (100-999)
  const number = Math.floor(Math.random() * 900) + 100;
  
  return `${word}${number}`;
}

/**
 * Default room configuration
 */
export function getDefaultRoomConfig() {
  return {
    seriesLength: 4,
    minStartingBid: 165,
    timePerTurn: 90,
    botCount: 0,
    maxPlayers: 4,
  };
}

/**
 * Room manager class
 */
export class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  /**
   * Create a new game room
   */
  createRoom(hostSocketId, hostPlayer, config) {
    const roomId = generateRoomId();
    const defaultConfig = getDefaultRoomConfig();
    const roomConfig = {
      ...defaultConfig,
      ...config,
    };

    const host = {
      ...hostPlayer,
      socketId: hostSocketId,
      isHost: true,
      isReady: false,
      isConnected: true,
      position: 0,
    };

    const room = {
      id: roomId,
      host: hostSocketId,
      hostQueue: [],
      players: new Map([[hostSocketId, host]]),
      bots: new Map(),
      config: roomConfig,
      status: "waiting",
      createdAt: new Date(),
      lastActivity: new Date(),
    };

    this.rooms.set(roomId, room);
    return room;
  }

  /**
   * Get a room by ID
   */
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  /**
   * Join a room
   */
  joinRoom(roomId, socketId, player) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return null;
    }

    // Check if room is full
    const totalPlayers = room.players.size + room.bots.size;
    if (totalPlayers >= room.config.maxPlayers) {
      return null;
    }

    // Find next available position
    const usedPositions = new Set();
    room.players.forEach((p) => usedPositions.add(p.position));
    room.bots.forEach((b) => usedPositions.add(b.position));

    let position = 0;
    while (usedPositions.has(position) && position < room.config.maxPlayers) {
      position++;
    }

    if (position >= room.config.maxPlayers) {
      return null; // Room is full
    }

    const newPlayer = {
      ...player,
      socketId,
      isHost: false,
      isReady: false,
      isConnected: true,
      position,
    };

    room.players.set(socketId, newPlayer);
    room.hostQueue.push(socketId);
    room.lastActivity = new Date();

    return { room, player: newPlayer };
  }

  /**
   * Leave a room
   */
  leaveRoom(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { room: null };
    }

    const player = room.players.get(socketId);
    if (!player) {
      return { room };
    }

    const wasHost = player.isHost;
    room.players.delete(socketId);

    // Remove from host queue
    const queueIndex = room.hostQueue.indexOf(socketId);
    if (queueIndex !== -1) {
      room.hostQueue.splice(queueIndex, 1);
    }

    // If host left, transfer to next player
    let newHost;
    if (wasHost && room.players.size > 0) {
      // Get next player from queue or first available
      const nextHostSocketId =
        room.hostQueue.length > 0
          ? room.hostQueue[0]
          : Array.from(room.players.keys())[0];

      if (nextHostSocketId) {
        const nextHost = room.players.get(nextHostSocketId);
        if (nextHost) {
          nextHost.isHost = true;
          room.host = nextHostSocketId;
          newHost = nextHostSocketId;
        }
      }
    }

    // If room is empty, delete it
    if (room.players.size === 0 && room.bots.size === 0) {
      this.rooms.delete(roomId);
      return { room: null };
    }

    room.lastActivity = new Date();
    return { room, newHost };
  }

  /**
   * Update room configuration (host only)
   */
  updateRoomConfig(roomId, socketId, config) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return null;
    }

    const player = room.players.get(socketId);
    if (!player || !player.isHost) {
      return null; // Only host can update config
    }

    room.config = {
      ...room.config,
      ...config,
    };
    room.lastActivity = new Date();

    return room;
  }

  /**
   * Set player ready status
   */
  setPlayerReady(roomId, socketId, isReady) {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.error(`Room ${roomId} not found`);
      return { room: null, allReady: false, success: false };
    }

    const player = room.players.get(socketId);
    if (!player) {
      console.error(`Player with socketId ${socketId} not found in room ${roomId}`);
      console.error(`Room has players:`, Array.from(room.players.keys()));
      return { room: null, allReady: false, success: false };
    }

    player.isReady = isReady;
    room.lastActivity = new Date();

    // Check if all players are ready
    const allPlayersReady = Array.from(room.players.values()).every(
      (p) => p.isReady
    );
    const allBotsReady = Array.from(room.bots.values()).every(
      (b) => b.isReady
    );
    const totalPlayers = room.players.size + room.bots.size;
    const allReady =
      totalPlayers === room.config.maxPlayers &&
      allPlayersReady &&
      allBotsReady;

    return { room, allReady, success: true };
  }

  /**
   * Add a bot to the room
   */
  addBot(roomId, socketId, botName) {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.error(`Room ${roomId} not found`);
      return { room: null, bot: null, success: false };
    }

    const player = room.players.get(socketId);
    if (!player) {
      console.error(`Player with socketId ${socketId} not found in room ${roomId}`);
      return { room: null, bot: null, success: false };
    }

    if (!player.isHost) {
      console.error(`Player ${socketId} is not host. Current host: ${room.host}`);
      return { room: null, bot: null, success: false }; // Only host can add bots
    }

    // Check if room is full
    const totalPlayers = room.players.size + room.bots.size;
    if (totalPlayers >= room.config.maxPlayers) {
      console.error(`Room ${roomId} is full (${totalPlayers}/${room.config.maxPlayers})`);
      return { room: null, bot: null, success: false };
    }

    // Find next available position
    const usedPositions = new Set();
    room.players.forEach((p) => usedPositions.add(p.position));
    room.bots.forEach((b) => usedPositions.add(b.position));

    let position = 0;
    while (usedPositions.has(position) && position < room.config.maxPlayers) {
      position++;
    }

    if (position >= room.config.maxPlayers) {
      console.error(`No available position in room ${roomId}`);
      return { room: null, bot: null, success: false }; // Room is full
    }

    // Determine bot name - use provided name if available, otherwise fallback
    let finalBotName = botName;
    if (!finalBotName || finalBotName.trim() === "") {
      finalBotName = `Bot ${room.bots.size + 1}`;
    }

    // Ensure bot name is unique (check against existing players and bots)
    const usedNames = new Set();
    room.players.forEach((p) => usedNames.add(p.name));
    room.bots.forEach((b) => usedNames.add(b.name));

    // If name conflicts, append a number
    let uniqueName = finalBotName;
    let counter = 1;
    while (usedNames.has(uniqueName)) {
      uniqueName = `${finalBotName} ${counter}`;
      counter++;
    }

    const botId = uuidv4();
    const bot = {
      id: botId,
      name: uniqueName,
      difficulty: "greedy",
      isReady: true,
      position,
    };

    room.bots.set(botId, bot);
    room.lastActivity = new Date();

    return { room, bot, success: true };
  }

  /**
   * Remove a bot from the room
   */
  removeBot(roomId, botId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { room: null };
    }

    const player = room.players.get(socketId);
    if (!player || !player.isHost) {
      return { room }; // Only host can remove bots
    }

    room.bots.delete(botId);
    room.lastActivity = new Date();

    return { room };
  }

  /**
   * Mark player as disconnected (starts 30-second timer for bot takeover)
   */
  markPlayerDisconnected(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return null;
    }

    const player = room.players.get(socketId);
    if (!player) {
      return null;
    }

    // Generate reconnection token
    const reconnectionToken = uuidv4();
    player.reconnectionToken = reconnectionToken;
    player.isConnected = false;
    player.disconnectedAt = new Date();

    room.lastActivity = new Date();
    return { room, reconnectionToken };
  }

  /**
   * Replace disconnected player with bot (after 30 seconds)
   */
  replacePlayerWithBot(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { room: null, bot: null };
    }

    const player = room.players.get(socketId);
    if (!player || player.isConnected) {
      return { room, bot: null }; // Player already reconnected
    }

    // Check if room is full
    const totalPlayers = room.players.size + room.bots.size;
    if (totalPlayers >= room.config.maxPlayers) {
      return { room, bot: null };
    }

    // Find bot that might already be replacing this player
    let existingBot = null;
    for (const [botId, bot] of room.bots.entries()) {
      if (bot.replacingPlayerId === player.id) {
        existingBot = bot;
        break;
      }
    }

    if (existingBot) {
      // Bot already exists for this player
      return { room, bot: existingBot };
    }

    // Create bot to replace player
    const botId = uuidv4();
    const bot = {
      id: botId,
      name: `${player.name} (Bot)`,
      difficulty: "greedy",
      isReady: true,
      position: player.position,
      replacingPlayerId: player.id, // Track which player this bot replaces
      originalPlayerSocketId: socketId,
    };

    room.bots.set(botId, bot);
    room.lastActivity = new Date();

    return { room, bot };
  }

  /**
   * Reconnect player and remove replacement bot
   */
  reconnectPlayer(roomId, reconnectionToken, newSocketId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return null;
    }

    // Find player with matching reconnection token
    let playerToReconnect = null;
    let oldSocketId = null;

    for (const [socketId, player] of room.players.entries()) {
      if (player.reconnectionToken === reconnectionToken) {
        playerToReconnect = player;
        oldSocketId = socketId;
        break;
      }
    }

    if (!playerToReconnect) {
      return null; // Invalid token
    }

    // Find and remove bot that was replacing this player
    let removedBot = null;
    for (const [botId, bot] of room.bots.entries()) {
      if (bot.replacingPlayerId === playerToReconnect.id) {
        removedBot = bot;
        room.bots.delete(botId);
        break;
      }
    }

    // Update player connection
    if (oldSocketId !== newSocketId) {
      // Remove old socket entry and add new one
      room.players.delete(oldSocketId);
      playerToReconnect.socketId = newSocketId;
      playerToReconnect.isConnected = true;
      playerToReconnect.disconnectedAt = null;
      // Keep reconnectionToken for potential future reconnections
      room.players.set(newSocketId, playerToReconnect);
    } else {
      // Same socket, just mark as connected
      playerToReconnect.isConnected = true;
      playerToReconnect.disconnectedAt = null;
    }

    room.lastActivity = new Date();
    return { room, player: playerToReconnect, removedBot };
  }

  /**
   * Clean up empty rooms (older than 1 hour)
   */
  cleanupEmptyRooms() {
    const now = new Date();
    const oneHourAgo = now.getTime() - 60 * 60 * 1000;

    for (const [roomId, room] of this.rooms.entries()) {
      if (
        room.players.size === 0 &&
        room.bots.size === 0 &&
        room.lastActivity.getTime() < oneHourAgo
      ) {
        this.rooms.delete(roomId);
      }
    }
  }

  /**
   * Get all rooms (for debugging)
   */
  getAllRooms() {
    return Array.from(this.rooms.values());
  }
}

// Singleton instance
export const roomManager = new RoomManager();

