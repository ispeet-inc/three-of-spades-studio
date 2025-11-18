/**
 * Multiplayer types for local network multiplayer functionality
 */

export interface PlayerProfile {
  id: string; // UUID
  name: string; // Display name
  gamesPlayed: number; // Total games
  gamesWon: number; // Total wins
  totalPoints: number; // Total points earned
  createdAt: Date; // Profile creation
  lastSeen: Date; // Last activity
}

export interface RoomConfig {
  seriesLength: number; // 4+ (custom range)
  minStartingBid: number; // 165+ (configurable)
  timePerTurn: number; // 90 seconds default
  botCount: number; // 0-3 bots
  maxPlayers: number; // 4 total
}

export interface Player {
  id: string; // Player profile ID
  name: string; // Display name
  socketId: string; // Socket connection ID
  isReady: boolean; // Ready status
  isConnected: boolean; // Connection status
  isHost: boolean; // Host status
  position: number; // 0-3 for game positioning
  reconnectionToken?: string; // For reconnection
}

export interface BotPlayer {
  id: string; // Bot ID
  name: string; // Display name
  difficulty: "greedy"; // Bot difficulty
  isReady: boolean; // Always true
  position: number; // 0-3 for game positioning
  replacingPlayerId?: string; // If bot is replacing a disconnected player
  originalPlayerSocketId?: string; // Original socket ID of replaced player
}

export interface GameRoom {
  id: string; // "ABC123"
  host: string; // Current host socket ID
  hostQueue: string[]; // Queue of players (next host)
  players: Map<string, Player>; // Connected players (socketId -> Player)
  bots: Map<string, BotPlayer>; // AI players
  config: RoomConfig; // Game settings
  status: "waiting" | "ready" | "playing" | "finished";
  gameState?: unknown; // Current game state (will be GameState later)
  createdAt: Date;
  lastActivity: Date;
}

// WebSocket message types
export interface ServerMessage {
  type: string;
  payload?: unknown;
  error?: string;
}

export interface ClientMessage {
  type: string;
  payload?: unknown;
}

// Room events
export interface RoomCreatedEvent {
  roomId: string;
  hostSocketId: string;
  config: RoomConfig;
}

export interface RoomJoinedEvent {
  roomId: string;
  player: Player;
  players: Player[];
  bots: BotPlayer[];
  config: RoomConfig;
  status: GameRoom["status"];
}

export interface PlayerJoinedEvent {
  player: Player;
  players: Player[];
}

export interface PlayerLeftEvent {
  socketId: string;
  players: Player[];
  newHost?: string;
}

export interface PlayerReadyEvent {
  socketId: string;
  isReady: boolean;
  allReady: boolean;
}

export interface RoomConfigUpdatedEvent {
  config: RoomConfig;
}

export interface PlayerDisconnectedEvent {
  socketId: string;
  player: Player;
  reconnectionToken: string;
  players: Player[];
}

export interface PlayerBotTakeoverEvent {
  socketId: string;
  bot: BotPlayer;
  bots: BotPlayer[];
  players: Player[];
}

export interface PlayerRejoinedEvent {
  player: Player;
  removedBot?: BotPlayer;
  players: Player[];
  bots: BotPlayer[];
}

export interface PlayerReconnectedEvent {
  roomId: string;
  player: Player;
  players: Player[];
  bots: BotPlayer[];
  config: RoomConfig;
  status: GameRoom["status"];
}

