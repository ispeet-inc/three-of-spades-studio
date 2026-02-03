# Multiplayer Design Document

## 🎯 Overview

This document outlines the design and implementation plan for adding local network multiplayer functionality to Three of Spades. The goal is to create a barebones MVP that validates the multiplayer experience before investing in server infrastructure.

## 🎮 Core Requirements

### **Player Management**

- **Profile System**: Local storage-based player profiles (no registration required)
- **Player Names**: Multiple players can have the same name
- **Stats Tracking**: Games played, wins, points (integrate with existing stats component)
- **Avatar System**: Text-only for now (no images/colors)

### **Room System**

- **Room Creation**: Generate unique room IDs (6-character alphanumeric)
- **Room Joining**: Players join via room code
- **Host Management**: First player is host, transfers to next player if host leaves
- **Room Persistence**: Rooms persist until empty, then dissolve
- **Player Capacity**: 4 players total (real players + bots)

### **Game Configuration**

- **Series Length**: Custom range (minimum 4 games)
- **Starting Bid**: Configurable (minimum 165)
- **Time Per Turn**: Default 90 seconds
- **Bot Integration**: Use existing GreedyBot logic
- **Bot Count**: 0-3 bots per room

### **Ready System**

- **Player Readiness**: Players can mark themselves as ready/not ready
- **Bot Readiness**: Bots auto-mark as ready
- **Game Start**: Only host can start game when all players ready
- **Player Count**: Game starts when exactly 4 players (real + bots)

### **Disconnection Handling**

- **Bot Takeover**: Replace disconnected players with bots after 30 seconds
- **Reconnection**: Players can rejoin same room using reconnection token
- **Bot Removal**: When player returns, remove bot and resume play
- **Host Transfer**: If host disconnects, next player becomes host

## 🏗️ System Architecture

### **Client-Server Model**

```
┌─────────────────┐    Local Network    ┌─────────────────┐
│   Player A      │ ←────────────────→ │   Player B      │
│ (Laptop 1)      │                     │ (Laptop 2)      │
│ localhost:3000  │                     │ localhost:3001  │
└─────────────────┘                     └─────────────────┘
         │                                       │
         └───────────────┬───────────────────────┘
                         │
                ┌─────────────────┐
                │  Local Server   │
                │  (Node.js)      │
                │  localhost:8080 │
                └─────────────────┘
```

### **Data Structures**

#### **Player Profile (Client-side)**

```typescript
interface PlayerProfile {
  id: string; // UUID
  name: string; // Display name
  gamesPlayed: number; // Total games
  gamesWon: number; // Total wins
  totalPoints: number; // Total points earned
  createdAt: Date; // Profile creation
  lastSeen: Date; // Last activity
}
```

#### **Game Room (Server-side)**

```typescript
interface GameRoom {
  id: string; // "ABC123"
  host: string; // Current host socket ID
  hostQueue: string[]; // Queue of players (next host)
  players: Map<string, Player>; // Connected players
  bots: Map<string, BotPlayer>; // AI players
  config: RoomConfig; // Game settings
  status: "waiting" | "ready" | "playing" | "finished";
  gameState?: GameState; // Current game state
  createdAt: Date;
  lastActivity: Date;
}

interface Player {
  id: string; // Player profile ID
  name: string; // Display name
  socket: WebSocket; // Connection
  isReady: boolean; // Ready status
  isConnected: boolean; // Connection status
  isHost: boolean; // Host status
  position: number; // 0-3 for game positioning
  reconnectionToken?: string; // For reconnection
}

interface BotPlayer {
  id: string; // Bot ID
  name: string; // Display name
  difficulty: "greedy"; // Bot difficulty
  isReady: boolean; // Always true
  position: number; // 0-3 for game positioning
  agent: GreedyBot; // Bot agent instance
}

interface RoomConfig {
  seriesLength: number; // 4+ (custom range)
  minStartingBid: number; // 165+ (configurable)
  timePerTurn: number; // 90 seconds default
  botCount: number; // 0-3 bots
  maxPlayers: number; // 4 total
}
```

## 🔄 System Flow

### **1. Player Profile & Room Creation**

```
Player A (Laptop 1)          Player B (Laptop 2)          Player C (Laptop 3)
     │                              │                              │
     │ 1. Load Profile              │ 1. Load Profile              │ 1. Load Profile
     │    (localStorage)            │    (localStorage)            │    (localStorage)
     ▼                              ▼                              ▼
┌─────────────┐              ┌─────────────┐              ┌─────────────┐
│ Profile:    │              │ Profile:    │              │ Profile:    │
│ - ID: abc123│              │ - ID: def456│              │ - ID: ghi789│
│ - Name: Alice│              │ - Name: Bob │              │ - Name: Alice│
│ - Stats: 5W/10G│            │ - Stats: 3W/8G│            │ - Stats: 2W/5G│
└─────────────┘              └─────────────┘              └─────────────┘
     │                              │                              │
     │ 2. Create Room               │                              │
     ▼                              │                              │
┌─────────────┐                     │                              │
│ Room: XYZ789│                     │                              │
│ - Host: Alice│                    │                              │
│ - Config: 4G, 165B, 90s│          │                              │
└─────────────┘                     │                              │
     │                              │                              │
     │ 3. Start Server              │                              │
     ▼                              │                              │
┌─────────────┐                     │                              │
│ Server: 8080│                     │                              │
│ - Room: XYZ789│                   │                              │
│ - Players: 1│                     │                              │
└─────────────┘                     │                              │
     │                              │                              │
     │ 4. Share Room Code           │                              │
     ▼                              │                              │
┌─────────────┐                     │                              │
│ Code: XYZ789│                     │                              │
│ Link: ws://192.168.1.100:8080│    │                              │
└─────────────┘                     │                              │
     │                              │                              │
     │ 5. Join Room                 │ 5. Join Room                 │
     ▼                              ▼                              ▼
┌─────────────┐              ┌─────────────┐              ┌─────────────┐
│ Room Lobby  │              │ Room Lobby  │              │ Room Lobby  │
│ - Host: Alice│             │ - Host: Alice│             │ - Host: Alice│
│ - Players: 3│              │ - Players: 3│              │ - Players: 3│
│ - Bots: 0   │              │ - Bots: 0   │              │ - Bots: 0   │
│ - Status: Wait│            │ - Status: Wait│            │ - Status: Wait│
└─────────────┘              └─────────────┘              └─────────────┘
```

### **2. Room Management & Ready System**

```
Player A (Host)              Player B (Player)            Player C (Player)
     │                              │                              │
     │ 1. Add Bot                   │                              │
     ▼                              │                              │
┌─────────────┐                     │                              │
│ Bot Added:  │                     │                              │
│ - Name: Bot1│                     │                              │
│ - Ready: Yes│                     │                              │
│ - Position: 2│                    │                              │
└─────────────┘                     │                              │
     │                              │                              │
     │ 2. Mark Ready                │ 2. Mark Ready                │ 2. Mark Ready
     ▼                              ▼                              ▼
┌─────────────┐              ┌─────────────┐              ┌─────────────┐
│ Ready: Yes  │              │ Ready: Yes  │              │ Ready: Yes  │
│ - All Ready!│              │ - All Ready!│              │ - All Ready!│
└─────────────┘              └─────────────┘              └─────────────┘
     │                              │                              │
     │ 3. Start Game                │                              │
     ▼                              │                              │
┌─────────────┐                     │                              │
│ Game Started│                     │                              │
│ - Series: 1/4│                    │                              │
│ - Starting: Bob│                  │                              │
└─────────────┘                     │                              │
     │                              │                              │
     │ 4. Broadcast State           │                              │
     ▼                              ▼                              ▼
┌─────────────┐              ┌─────────────┐              ┌─────────────┐
│ Game Board  │              │ Game Board  │              │ Game Board  │
│ - All players│             │ - All players│             │ - All players│
│ - Game state│              │ - Game state│              │ - Game state│
│ - Synchronized│            │ - Synchronized│            │ - Synchronized│
└─────────────┘              └─────────────┘              └─────────────┘
```

### **3. Game Play & State Synchronization**

```
Player A (Bid: 200)          Player B (Bid: 250)          Player C (Bid: 300)
     │                              │                              │
     │ 1. Make Bid                  │ 1. Make Bid                  │ 1. Make Bid
     ▼                              ▼                              ▼
┌─────────────┐              ┌─────────────┐              ┌─────────────┐
│ Local Redux │              │ Local Redux │              │ Local Redux │
│ - Optimistic│              │ - Optimistic│              │ - Optimistic│
│ - Update UI │              │ - Update UI │              │ - Update UI │
└─────────────┘              └─────────────┘              └─────────────┘
     │                              │                              │
     │ 2. Send to Server            │ 2. Send to Server            │ 2. Send to Server
     ▼                              ▼                              ▼
┌─────────────┐              ┌─────────────┐              ┌─────────────┐
│ WebSocket   │              │ WebSocket   │              │ WebSocket   │
│ - Send Action│             │ - Send Action│             │ - Send Action│
└─────────────┘              └─────────────┘              └─────────────┘
     │                              │                              │
     └──────────────────────────────┼──────────────────────────────┘
                                    ▼
                           ┌─────────────┐
                           │ Local Server│
                           │ - Validate  │
                           │ - Apply Action│
                           │ - Update State│
                           └─────────────┘
                                    │
                                    │ 3. Broadcast to All
                                    ▼
┌─────────────┐              ┌─────────────┐              ┌─────────────┐
│ Game State  │              │ Game State  │              │ Game State  │
│ - Bid: 300  │              │ - Bid: 300  │              │ - Bid: 300  │
│ - Winner: C │              │ - Winner: C │              │ - Winner: C │
│ - Sync'd    │              │ - Sync'd    │              │ - Sync'd    │
└─────────────┘              └─────────────┘              └─────────────┘
```

### **4. Disconnection & Reconnection**

```
Player A (Disconnected)      Player B (Playing)           Player C (Playing)
     │                              │                              │
     │ 1. Connection Lost           │                              │
     ▼                              │                              │
┌─────────────┐                     │                              │
│ 30s Timer   │                     │                              │
│ - Countdown │                     │                              │
│ - Bot Ready │                     │                              │
└─────────────┘                     │                              │
     │                              │                              │
     │ 2. Bot Takeover              │                              │
     ▼                              ▼                              ▼
┌─────────────┐              ┌─────────────┐              ┌─────────────┐
│ Bot Replaces│              │ Game Continues│            │ Game Continues│
│ - Bot2 (Alice)│            │ - Bot2 Playing│            │ - Bot2 Playing│
│ - Ready: Yes│              │ - State Sync│              │ - State Sync│
└─────────────┘              └─────────────┘              └─────────────┘
     │                              │                              │
     │ 3. Player Returns             │                              │
     ▼                              │                              │
┌─────────────┐                     │                              │
│ Reconnection│                     │                              │
│ - Token: abc123│                  │                              │
│ - Bot2 → Alice│                   │                              │
└─────────────┘                     │                              │
     │                              │                              │
     │ 4. Resume Play               │                              │
     ▼                              ▼                              ▼
┌─────────────┐              ┌─────────────┐              ┌─────────────┐
│ Alice Back  │              │ Game Continues│            │ Game Continues│
│ - Bot2 Removed│            │ - Alice Playing│           │ - Alice Playing│
│ - State Sync│              │ - State Sync│              │ - State Sync│
└─────────────┘              └─────────────┘              └─────────────┘
```

## 🛠️ Implementation Plan

### **Phase 1: Core Infrastructure (Week 1)**

- [ ] Local Node.js server with Socket.io
- [ ] Room creation and management
- [ ] Basic WebSocket communication
- [ ] Player profile system (localStorage)

### **Phase 2: Room System (Week 2)**

- [ ] Room configuration UI
- [ ] Player joining/leaving
- [ ] Host management and transfer
- [ ] Ready system implementation

### **Phase 3: Bot Integration (Week 3)**

- [ ] Bot player management
- [ ] GreedyBot integration
- [ ] Bot takeover on disconnection
- [ ] Bot removal on reconnection

### **Phase 4: Game Integration (Week 4)**

- [ ] WebSocket middleware for Redux
- [ ] Game state synchronization
- [ ] Action validation and broadcasting
- [ ] Error handling and recovery

### **Phase 5: Testing & Polish (Week 5)**

- [ ] Cross-laptop testing
- [ ] 2 real players + 2 bots testing
- [ ] Reconnection testing
- [ ] UI polish and error messages

## 🎯 Success Criteria

### **MVP Validation**

- [ ] Create room with unique ID
- [ ] 2 real players join from different laptops
- [ ] Add 2 bots to fill room
- [ ] All players mark ready
- [ ] Host starts game
- [ ] Game plays smoothly with state synchronization
- [ ] Player can disconnect and reconnect
- [ ] Bot takes over when player disconnects
- [ ] Player can resume from bot when reconnecting

### **Technical Requirements**

- [ ] Local server runs on laptop
- [ ] Other laptops can connect via IP address
- [ ] WebSocket communication works reliably
- [ ] Game state stays synchronized
- [ ] No data loss on disconnection
- [ ] Smooth reconnection experience

## 🔧 Technical Details

### **Server Setup**

```bash
# Server dependencies
npm install express socket.io cors uuid

# Server file structure
server/
├── local-server.js          # Main server file
├── roomManager.js           # Room management logic
├── gameValidator.js         # Game action validation
├── botManager.js            # Bot player management
└── package.json             # Server dependencies
```

### **Client Integration**

```typescript
// WebSocket middleware for Redux
const websocketMiddleware: Middleware = store => next => action => {
  // Send game actions to server
  if (action.type.startsWith("game/")) {
    socket.send(
      JSON.stringify({
        type: "GAME_ACTION",
        action,
      })
    );
  }

  return next(action);
};

// Add to Redux store
export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(websocketMiddleware),
});
```

### **Room Configuration UI**

```typescript
interface RoomConfig {
  seriesLength: number;          // 4+ (custom range)
  minStartingBid: number;        // 165+ (configurable)
  timePerTurn: number;           // 90 seconds default
  botCount: number;              // 0-3 bots
  maxPlayers: number;            // 4 total
}

const RoomConfigurationPanel = ({ room, onConfigChange }) => {
  return (
    <div className="room-config">
      <h3>Room Settings</h3>

      {/* Series Length */}
      <div className="config-item">
        <label>Number of Games</label>
        <input
          type="number"
          min="4"
          value={room.config.seriesLength}
          onChange={(e) => onConfigChange('seriesLength', parseInt(e.target.value))}
        />
      </div>

      {/* Minimum Starting Bid */}
      <div className="config-item">
        <label>Minimum Starting Bid</label>
        <input
          type="number"
          min="165"
          value={room.config.minStartingBid}
          onChange={(e) => onConfigChange('minStartingBid', parseInt(e.target.value))}
        />
      </div>

      {/* Time Per Turn */}
      <div className="config-item">
        <label>Time Per Turn (seconds)</label>
        <input
          type="number"
          min="30"
          value={room.config.timePerTurn}
          onChange={(e) => onConfigChange('timePerTurn', parseInt(e.target.value))}
        />
      </div>

      {/* Bot Count */}
      <div className="config-item">
        <label>Number of Bots</label>
        <select
          value={room.config.botCount}
          onChange={(e) => onConfigChange('botCount', parseInt(e.target.value))}
        >
          <option value="0">0 Bots</option>
          <option value="1">1 Bot</option>
          <option value="2">2 Bots</option>
          <option value="3">3 Bots</option>
        </select>
      </div>
    </div>
  );
};
```

## 🚀 Future Enhancements

### **Phase 2: Server Hosting**

- [ ] Deploy to Railway/Render
- [ ] Database persistence
- [ ] Global room discovery
- [ ] Cross-device profile sync

### **Phase 3: Advanced Features**

- [ ] Spectator mode
- [ ] Game replays
- [ ] Tournament system
- [ ] Mobile app

### **Phase 4: Social Features**

- [ ] Friend system
- [ ] Chat functionality
- [ ] Player rankings
- [ ] Achievement system

## 📝 Notes

- **Local Storage**: Player profiles stored in browser localStorage
- **No Registration**: Players can join immediately with generated profiles
- **Name Conflicts**: Multiple players can have same name
- **Bot Integration**: Use existing GreedyBot logic
- **Host Transfer**: Automatic when host leaves
- **Room Persistence**: Rooms persist until empty
- **Reconnection**: Players can rejoin using tokens
- **State Sync**: Server validates all actions, broadcasts to all players

---

_This document serves as the comprehensive guide for implementing local network multiplayer functionality, building upon the existing game foundation to create a seamless multiplayer experience._


