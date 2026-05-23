---
name: Multiplayer Mode Reimplementation
overview: Re-implement the multiplayer mode from PR 76 in testable, incremental steps. Each step builds on the previous one and can be tested independently before moving forward.
todos:
  - id: phase1-server
    content: "Phase 1: Server Infrastructure - Basic server, room management, player joining/leaving"
    status: completed
  - id: phase2-client-foundation
    content: "Phase 2: Client Foundation - Types, player profiles, multiplayer client, multiplayer hook"
    status: in_progress
    dependencies:
      - phase1-server
  - id: phase3-lobby-ui
    content: "Phase 3: Room Lobby UI - Lobby screen, player list, config panel, ready system, bot management"
    status: pending
    dependencies:
      - phase2-client-foundation
  - id: phase4-disconnect-reconnect
    content: "Phase 4: Disconnection & Reconnection - Disconnect detection, bot takeover, reconnection system"
    status: pending
    dependencies:
      - phase3-lobby-ui
  - id: phase5-game-sync
    content: "Phase 5: Game Action Synchronization - WebSocket middleware, server action handling, game sync hook, game start"
    status: pending
    dependencies:
      - phase4-disconnect-reconnect
  - id: phase6-integration
    content: "Phase 6: Integration & Polish - Routing, exports, error handling"
    status: pending
    dependencies:
      - phase5-game-sync
---

# Multiplayer Mode Reimplementation Plan

This plan breaks down the multiplayer implementation from PR 76 into testable, incremental steps. Each step should be committed and tested before proceeding to the next.

## Architecture Overview

The multiplayer system consists of:

- **Server**: Node.js + Socket.io server for room management and game action synchronization
- **Client**: React hooks and components for UI and WebSocket communication
- **Redux Integration**: Middleware to intercept and sync game actions

## Phase 1: Foundation - Server Infrastructure

### Step 1.1: Basic Server Setup

**Goal**: Create a minimal Socket.io server that can accept connections

**Files to create:**

- `server/local-server.js` - Express + Socket.io server
- `server/README.md` - Server documentation

**Implementation:**

- Express server on port 8080
- Socket.io with CORS enabled
- Health check endpoint at `/health`
- Basic connection logging

**Testing:**

1. **Start the server:**
   ```bash
   npm run server
   # or
   node server/local-server.js
   ```


   - ✅ Server starts without errors
   - ✅ Console shows: "🚀 Multiplayer server running on http://localhost:8080"
   - ✅ Console shows: "📡 WebSocket server ready for connections"

2. **Test health endpoint:**
   ```bash
   curl http://localhost:8080/health
   ```


   - ✅ Returns JSON: `{"status":"ok","timestamp":"..."}`

3. **Test WebSocket connection (using browser console or Socket.io client):**
   ```javascript
   // In browser console or test script
   const socket = io('http://localhost:8080');
   socket.on('connect', () => {
     console.log('Connected:', socket.id);
   });
   ```


   - ✅ Connection succeeds
   - ✅ Socket ID is generated
   - ✅ Server console shows: "Client connected: [socket-id]"

4. **Test disconnection:**
   ```javascript
   socket.disconnect();
   ```


   - ✅ Server console shows: "Client disconnected: [socket-id]"

**Test Checklist:**

- [ ] Server starts successfully
- [ ] Health endpoint responds
- [ ] WebSocket connection works
- [ ] Connection logging appears in server console
- [ ] Disconnection is detected

**Reference**: [server/local-server.js](server/local-server.js) lines 1-44

---

### Step 1.2: Room Management Core

**Goal**: Implement room creation and basic room data structure

**Files to create:**

- `server/roomManager.js` - Room management class

**Implementation:**

- `RoomManager` class with `rooms` Map
- `generateRoomId()` - 6-character format (word###, e.g., "ant123")
- `getDefaultRoomConfig()` - Default room settings
- `createRoom()` - Create room with host
- `getRoom()` - Retrieve room by ID

**Testing:**

1. **Test room ID generation:**
   ```javascript
   // In Node.js REPL or test file
   const { generateRoomId } = require('./server/roomManager.js');
   const id1 = generateRoomId();
   const id2 = generateRoomId();
   console.log(id1, id2);
   ```


   - ✅ Room IDs are 6 characters (e.g., "ant123", "dog456")
   - ✅ Format: 3 letters + 3 numbers
   - ✅ IDs are different each time

2. **Test default config:**
   ```javascript
   const { getDefaultRoomConfig } = require('./server/roomManager.js');
   const config = getDefaultRoomConfig();
   console.log(config);
   ```


   - ✅ Returns object with: `seriesLength: 4`, `minStartingBid: 165`, `timePerTurn: 90`, `botCount: 0`, `maxPlayers: 4`

3. **Test room creation:**
   ```javascript
   const { roomManager } = require('./server/roomManager.js');
   const room = roomManager.createRoom('socket-123', { id: 'player-1', name: 'Test Player' });
   console.log(room.id, room.host, room.players.size);
   ```


   - ✅ Room is created with valid ID
   - ✅ Host is set to provided socket ID
   - ✅ Room has 1 player (the host)
   - ✅ Player has `isHost: true`, `position: 0`, `isReady: false`

4. **Test getRoom:**
   ```javascript
   const retrieved = roomManager.getRoom(room.id);
   console.log(retrieved === room); // Should be same object
   ```


   - ✅ Returns the same room object
   - ✅ Returns `undefined` for non-existent room ID

**Test Checklist:**

- [ ] Room IDs generated in correct format (word###)
- [ ] Default config has correct values
- [ ] Rooms can be created with host
- [ ] Rooms can be retrieved by ID
- [ ] Host player has correct properties

**Reference**: [server/roomManager.js](server/roomManager.js) lines 1-90

---

### Step 1.3: Player Joining/Leaving

**Goal**: Players can join and leave rooms

**Files to modify:**

- `server/roomManager.js` - Add `joinRoom()` and `leaveRoom()`
- `server/local-server.js` - Add socket handlers

**Implementation:**

- `joinRoom()` - Add player to room, assign position
- `leaveRoom()` - Remove player, handle host transfer
- Socket handlers: `room:create`, `room:join`, `room:leave`
- Events: `room:created`, `room:joined`, `player:joined`, `player:left`

**Testing:**

1. **Test room creation (server-side):**
   ```javascript
   // Using Socket.io client test
   const socket1 = io('http://localhost:8080');
   socket1.emit('room:create', {
     playerId: 'player-1',
     playerName: 'Player 1'
   });
   socket1.on('room:created', (data) => {
     console.log('Room created:', data.roomId);
   });
   socket1.on('room:joined', (data) => {
     console.log('Joined room:', data.roomId, 'Players:', data.players.length);
   });
   ```


   - ✅ Receives `room:created` event with roomId and hostSocketId
   - ✅ Receives `room:joined` event with room state
   - ✅ Room has 1 player (the creator)
   - ✅ Creator is marked as host

2. **Test joining room (from second client):**
   ```javascript
   const socket2 = io('http://localhost:8080');
   // Wait for room ID from socket1, then:
   socket2.emit('room:join', {
     roomId: 'ant123', // Use actual room ID
     playerId: 'player-2',
     playerName: 'Player 2'
   });
   socket2.on('room:joined', (data) => {
     console.log('Player 2 joined:', data.players.length);
   });
   ```


   - ✅ Receives `room:joined` event
   - ✅ Room now has 2 players
   - ✅ Second player has `isHost: false`, `position: 1`

3. **Test player:joined event (on first client):**
   ```javascript
   socket1.on('player:joined', (data) => {
     console.log('New player joined:', data.player.name);
   });
   ```


   - ✅ First client receives `player:joined` when second player joins
   - ✅ Event includes updated players array

4. **Test leaving room:**
   ```javascript
   socket2.emit('room:leave', { roomId: 'ant123' });
   socket1.on('player:left', (data) => {
     console.log('Player left:', data.socketId);
   });
   ```


   - ✅ Second client leaves successfully
   - ✅ First client receives `player:left` event
   - ✅ Room now has 1 player again

5. **Test host transfer (if host leaves):**
   ```javascript
   // Host (socket1) leaves
   socket1.emit('room:leave', { roomId: 'ant123' });
   // If there are other players, verify new host is assigned
   ```


   - ✅ If host leaves and other players exist, new host is assigned
   - ✅ `player:left` event includes `newHost` field

6. **Test room full scenario:**
   ```javascript
   // Try to join with 5th player when room has 4
   socket5.emit('room:join', { roomId: 'ant123', ... });
   socket5.on('error', (data) => {
     console.log('Error:', data.message);
   });
   ```


   - ✅ Server rejects join when room is full
   - ✅ Client receives error event

**Test Checklist:**

- [ ] Room creation emits correct events
- [ ] Player can join existing room
- [ ] Other players receive `player:joined` event
- [ ] Player can leave room
- [ ] Other players receive `player:left` event
- [ ] Host transfer works when host leaves
- [ ] Room full rejection works correctly
- [ ] Position assignment works (0, 1, 2, 3)

**Reference**:

- [server/roomManager.js](server/roomManager.js) lines 85-187
- [server/local-server.js](server/local-server.js) lines 49-145

---

## Phase 2: Client Foundation

### Step 2.1: Type Definitions

**Goal**: Define TypeScript types for multiplayer system

**Files to create:**

- `src/types/multiplayer.ts` - All multiplayer types

**Implementation:**

- `PlayerProfile`, `RoomConfig`, `Player`, `BotPlayer`, `GameRoom`
- Event type interfaces (RoomCreatedEvent, PlayerJoinedEvent, etc.)

**Testing:**

1. **TypeScript compilation:**
   ```bash
   npm run build
   # or
   npx tsc --noEmit
   ```


   - ✅ No TypeScript errors
   - ✅ All types are properly exported

2. **Verify type exports:**
   ```typescript
   // In a test file or component
   import type {
     PlayerProfile,
     RoomConfig,
     Player,
     BotPlayer,
     GameRoom,
     RoomCreatedEvent,
     PlayerJoinedEvent
   } from '@/types/multiplayer';
   
   // Test type usage
   const player: Player = {
     id: 'test',
     name: 'Test',
     socketId: 'socket-1',
     isReady: false,
     isConnected: true,
     isHost: false,
     position: 0
   };
   ```


   - ✅ All types can be imported
   - ✅ Type checking works correctly
   - ✅ IntelliSense/autocomplete works

3. **Verify type compatibility:**

   - ✅ `Player` type matches server player structure
   - ✅ `RoomConfig` matches default config structure
   - ✅ Event types match server event payloads

**Test Checklist:**

- [ ] TypeScript compiles without errors
- [ ] All types can be imported
- [ ] Types match server data structures
- [ ] Type checking catches errors correctly

**Reference**: [src/types/multiplayer.ts](src/types/multiplayer.ts)

---

### Step 2.2: Player Profile System

**Goal**: Local storage-based player profiles

**Files to create:**

- `src/utils/playerProfile.ts` - Profile utilities
- `src/hooks/usePlayerProfile.ts` - React hook

**Implementation:**

- `getOrCreatePlayerProfile()` - Create or load profile
- `loadPlayerProfile()`, `savePlayerProfile()`, `updatePlayerProfile()`
- `usePlayerProfile()` hook with create/update methods
- Store in localStorage with key `threeOfSpades_playerProfile`

**Testing:**

1. **Test profile creation:**
   ```typescript
   // In browser console or test component
   import { getOrCreatePlayerProfile } from '@/utils/playerProfile';
   const profile = getOrCreatePlayerProfile('Test Player');
   console.log(profile);
   ```


   - ✅ Profile is created with UUID id
   - ✅ Profile has name, gamesPlayed: 0, gamesWon: 0, totalPoints: 0
   - ✅ Profile has createdAt and lastSeen dates

2. **Test profile persistence:**
   ```typescript
   // Create profile
   const profile1 = getOrCreatePlayerProfile('Test Player');
   const id1 = profile1.id;
   
   // Reload page or create new instance
   const profile2 = getOrCreatePlayerProfile('Test Player');
   const id2 = profile2.id;
   ```


   - ✅ Same name returns same profile (same ID)
   - ✅ Profile persists in localStorage
   - ✅ Check localStorage: `localStorage.getItem('threeOfSpades_playerProfile')`

3. **Test profile loading:**
   ```typescript
   import { loadPlayerProfile } from '@/utils/playerProfile';
   const loaded = loadPlayerProfile();
   ```


   - ✅ Returns profile if exists
   - ✅ Returns null if no profile exists

4. **Test profile update:**
   ```typescript
   import { updatePlayerProfile } from '@/utils/playerProfile';
   updatePlayerProfile({ gamesPlayed: 5, gamesWon: 2 });
   const updated = loadPlayerProfile();
   ```


   - ✅ Profile is updated
   - ✅ Updates persist in localStorage
   - ✅ Other fields remain unchanged

5. **Test usePlayerProfile hook:**
   ```typescript
   // In a React component
   const { profile, createProfile, updateProfile } = usePlayerProfile();
   useEffect(() => {
     if (!profile) {
       createProfile('Test Player');
     }
   }, [profile]);
   ```


   - ✅ Hook loads profile on mount
   - ✅ `createProfile()` creates and sets profile
   - ✅ `updateProfile()` updates and persists profile
   - ✅ Profile state updates correctly

**Test Checklist:**

- [ ] Profile can be created
- [ ] Profile persists in localStorage
- [ ] Profile loads after page reload
- [ ] Profile can be updated
- [ ] Hook works correctly in components
- [ ] Multiple calls with same name return same profile

**Reference**:

- [src/utils/playerProfile.ts](src/utils/playerProfile.ts) (if exists, or check usePlayerProfile.ts)
- [src/hooks/usePlayerProfile.ts](src/hooks/usePlayerProfile.ts)

---

### Step 2.3: Multiplayer Client Class

**Goal**: WebSocket client wrapper for Socket.io

**Files to create:**

- `src/utils/multiplayer.ts` - MultiplayerClient class

**Implementation:**

- `MultiplayerClient` class with Socket.io connection
- `connect()`, `disconnect()`, `isConnected()`, `getSocketId()`
- Event listener system: `on()`, `off()`
- Singleton pattern via `createMultiplayerClient()`
- Auto-connect on singleton creation

**Testing:**

1. **Test singleton pattern:**
   ```typescript
   import { createMultiplayerClient } from '@/utils/multiplayer';
   const client1 = createMultiplayerClient();
   const client2 = createMultiplayerClient();
   console.log(client1 === client2); // Should be true
   ```


   - ✅ Same instance is returned
   - ✅ Singleton pattern works

2. **Test connection:**
   ```typescript
   const client = createMultiplayerClient();
   await client.connect();
   console.log(client.isConnected()); // Should be true
   console.log(client.getSocketId()); // Should have socket ID
   ```


   - ✅ Connection succeeds
   - ✅ `isConnected()` returns true
   - ✅ `getSocketId()` returns socket ID string

3. **Test event listeners:**
   ```typescript
   const client = createMultiplayerClient();
   await client.connect();
   
   const unsub = client.on('connect', () => {
     console.log('Connected!');
   });
   
   // Test disconnect
   client.disconnect();
   ```


   - ✅ Event listener is called on connect
   - ✅ Unsubscribe function works
   - ✅ Disconnect works

4. **Test auto-connect:**
   ```typescript
   // Create client (should auto-connect)
   const client = createMultiplayerClient();
   // Wait a moment
   setTimeout(() => {
     console.log(client.isConnected()); // Should be true
   }, 1000);
   ```


   - ✅ Client auto-connects when singleton is created
   - ✅ Connection happens automatically

5. **Test reconnection:**
   ```typescript
   const client = createMultiplayerClient();
   await client.connect();
   client.disconnect();
   // Wait, then reconnect
   await client.connect();
   ```


   - ✅ Reconnection works
   - ✅ New socket ID is generated

**Test Checklist:**

- [ ] Singleton pattern works
- [ ] Connection succeeds
- [ ] Connection status is tracked correctly
- [ ] Socket ID is available
- [ ] Event listeners work
- [ ] Auto-connect works
- [ ] Disconnect works
- [ ] Reconnection works

**Reference**: [src/utils/multiplayer.ts](src/utils/multiplayer.ts) lines 1-397

---

### Step 2.4: Multiplayer Hook

**Goal**: React hook for room state management

**Files to create:**

- `src/hooks/useMultiplayer.ts` - Main multiplayer hook

**Implementation:**

- `useMultiplayer()` hook
- Room state management (roomId, players, bots, config, status)
- Event listeners for all room events
- Functions: `createRoom()`, `joinRoom()`, `leaveRoom()`
- Connection status tracking

**Testing:**

1. **Test hook initialization:**
   ```typescript
   // In a React component
   const { isConnected, roomState, createRoom } = useMultiplayer();
   console.log(isConnected, roomState);
   ```


   - ✅ Hook initializes without errors
   - ✅ `isConnected` reflects connection status
   - ✅ `roomState` has initial values (null roomId, empty arrays)

2. **Test room creation:**
   ```typescript
   const { roomState, createRoom, profile } = useMultiplayer();
   createRoom(profile.id, profile.name);
   // Wait for events
   useEffect(() => {
     console.log('Room ID:', roomState.roomId);
     console.log('Players:', roomState.players);
   }, [roomState.roomId]);
   ```


   - ✅ `roomState.roomId` is set after creation
   - ✅ `roomState.players` includes creator
   - ✅ Creator is marked as host
   - ✅ `roomState.config` has default values

3. **Test joining room:**
   ```typescript
   const { joinRoom, roomState } = useMultiplayer();
   joinRoom('ant123', profile.id, profile.name);
   // Wait for events
   ```


   - ✅ `roomState.roomId` is set to joined room
   - ✅ `roomState.players` includes all players
   - ✅ Player list updates when others join

4. **Test leaving room:**
   ```typescript
   const { leaveRoom, roomState } = useMultiplayer();
   leaveRoom(roomState.roomId);
   ```


   - ✅ `roomState.roomId` becomes null
   - ✅ `roomState.players` is empty
   - ✅ Room state is reset

5. **Test event handling:**
   ```typescript
   // In component, watch for updates
   useEffect(() => {
     console.log('Room state changed:', roomState);
   }, [roomState]);
   ```


   - ✅ State updates when events are received
   - ✅ `player:joined` updates player list
   - ✅ `player:left` updates player list
   - ✅ `room:configUpdated` updates config

6. **Test host detection:**
   ```typescript
   const { isHost, socketId, roomState } = useMultiplayer();
   console.log('Is host:', isHost);
   ```


   - ✅ `isHost` is true for room creator
   - ✅ `isHost` is false for other players
   - ✅ Updates when host changes

**Test Checklist:**

- [ ] Hook initializes correctly
- [ ] Room creation updates state
- [ ] Room joining updates state
- [ ] Room leaving resets state
- [ ] Events update state correctly
- [ ] Host detection works
- [ ] Connection status is tracked
- [ ] Error state is handled

**Reference**: [src/hooks/useMultiplayer.ts](src/hooks/useMultiplayer.ts) lines 1-352

---

## Phase 3: Room Lobby UI

### Step 3.1: Basic Lobby Screen

**Goal**: Create/join room interface

**Files to create:**

- `src/components/multiplayer/RoomLobby.tsx` - Main lobby component
- `src/pages/MultiplayerPage.tsx` - Page wrapper

**Implementation:**

- Create room button
- Join room input (room code format: word###)
- Connection status indicator
- Room code display when in room
- Leave room button

**Testing:**

1. **Test create room UI:**

   - Navigate to `/multiplayer` page
   - Click "Create Room" button
   - ✅ Connection status shows "Connected" (green)
   - ✅ Room code is displayed (format: word###)
   - ✅ "Leave Room" button appears
   - ✅ Room code can be copied

2. **Test join room UI:**

   - On second browser window/tab
   - Navigate to `/multiplayer` page
   - Enter room code (e.g., "ant123")
   - Click "Join Room"
   - ✅ Joins successfully
   - ✅ Room code is displayed
   - ✅ Both clients show same room code

3. **Test room code validation:**

   - Try invalid formats: "abc", "123456", "abc12"
   - ✅ Error message appears
   - ✅ Join button is disabled
   - ✅ Valid format (word###) is accepted

4. **Test connection status:**

   - Stop server
   - ✅ Status shows "Disconnected" (red)
   - ✅ Create/Join buttons are disabled
   - Start server
   - ✅ Status updates to "Connected"

5. **Test leave room:**

   - Click "Leave Room" button
   - ✅ Returns to create/join screen
   - ✅ Room state is cleared
   - ✅ Other players see player left

6. **Test back button:**

   - Click "Back to Menu" button
   - ✅ Navigates to home page

**Test Checklist:**

- [ ] Create room button works
- [ ] Room code is displayed correctly
- [ ] Room code can be copied
- [ ] Join room with valid code works
- [ ] Invalid room codes are rejected
- [ ] Connection status is displayed
- [ ] Leave room works
- [ ] Back button works
- [ ] UI updates when players join/leave

**Reference**:

- [src/components/multiplayer/RoomLobby.tsx](src/components/multiplayer/RoomLobby.tsx) lines 205-343
- [src/pages/MultiplayerPage.tsx](src/pages/MultiplayerPage.tsx)

---

### Step 3.2: Player List Component

**Goal**: Display players in room

**Files to create:**

- `src/components/multiplayer/PlayerList.tsx`

**Implementation:**

- Display all players and bots
- Show position, ready status, host indicator
- Current player highlighting
- Empty slot indicators

**Testing:**

1. **Test player display:**

   - Create room with 2-3 players
   - ✅ All players appear in list
   - ✅ Player names are displayed
   - ✅ Positions are shown (1, 2, 3, 4)
   - ✅ Current player is highlighted

2. **Test host indicator:**

   - ✅ Host has crown icon
   - ✅ Host badge is visible
   - ✅ Only one player shows as host

3. **Test ready status:**

   - ✅ Players show "Not Ready" badge (yellow)
   - ✅ Ready players show "Ready" badge (green)
   - ✅ Status updates when players toggle ready

4. **Test empty slots:**

   - With less than 4 players
   - ✅ Empty slots show "Waiting for player..."
   - ✅ Correct number of empty slots displayed

5. **Test bot display:**

   - Host adds bots
   - ✅ Bots appear in list
   - ✅ Bots show "Bot" badge
   - ✅ Bots show "Ready" status
   - ✅ Bots have positions

6. **Test current player highlighting:**

   - ✅ Current player's card has gold background
   - ✅ Current player's name is gold
   - ✅ Other players have normal styling

**Test Checklist:**

- [ ] All players are displayed
- [ ] Player names are correct
- [ ] Positions are correct
- [ ] Host indicator works
- [ ] Ready status is displayed
- [ ] Empty slots are shown
- [ ] Bots are displayed correctly
- [ ] Current player is highlighted
- [ ] List updates when players join/leave

**Reference**: [src/components/multiplayer/PlayerList.tsx](src/components/multiplayer/PlayerList.tsx)

---

### Step 3.3: Room Configuration Panel

**Goal**: Host-only room settings

**Files to create:**

- `src/components/multiplayer/RoomConfigurationPanel.tsx`

**Implementation:**

- Series length input (min 4)
- Minimum starting bid (min 165)
- Time per turn (default 90)
- Save/Reset buttons
- Host-only visibility

**Server changes:**

- `roomManager.updateRoomConfig()` - Update room config
- Socket handler: `room:updateConfig`
- Event: `room:configUpdated`

**Testing:**

1. **Test panel visibility:**

   - Host: ✅ Panel is visible
   - Non-host: ✅ Panel is NOT visible

2. **Test config inputs:**

   - Series length: ✅ Can change, minimum 4 enforced
   - Min starting bid: ✅ Can change, minimum 165 enforced
   - Time per turn: ✅ Can change, minimum 30 enforced
   - ✅ Inputs show current values

3. **Test save changes:**

   - Change series length to 6
   - Click "Save Changes"
   - ✅ Changes are saved
   - ✅ All clients see updated config
   - ✅ "Save Changes" button disappears

4. **Test reset:**

   - Change values
   - Click "Reset"
   - ✅ Values revert to server config
   - ✅ "Save Changes" button disappears

5. **Test real-time updates:**

   - Host changes config
   - ✅ Other clients see update immediately
   - ✅ No need to refresh

6. **Test validation:**

   - Try to set series length to 3
   - ✅ Input prevents invalid value
   - ✅ Error message or validation shown

**Test Checklist:**

- [ ] Panel only visible to host
- [ ] All config fields are editable
- [ ] Minimum values are enforced
- [ ] Save button appears when changes made
- [ ] Changes are saved to server
- [ ] All clients receive updates
- [ ] Reset button works
- [ ] Validation prevents invalid values

**Reference**:

- [src/components/multiplayer/RoomConfigurationPanel.tsx](src/components/multiplayer/RoomConfigurationPanel.tsx)
- [server/roomManager.js](server/roomManager.js) lines 189-210
- [server/local-server.js](server/local-server.js) lines 147-166

---

### Step 3.4: Ready System

**Goal**: Players mark ready, host starts game

**Files to create:**

- `src/components/multiplayer/ReadySystem.tsx`

**Implementation:**

- Ready toggle button for all players
- Progress bar showing ready count
- "Start Game" button (host only)
- Validation: 4 players total, all ready

**Server changes:**

- `roomManager.setPlayerReady()` - Update ready status
- Socket handler: `player:setReady`
- Event: `player:ready` with `allReady` flag

**Testing:**

1. **Test ready toggle:**

   - Click "Mark as Ready" button
   - ✅ Button changes to "Ready" (green)
   - ✅ Progress bar updates
   - ✅ Other players see ready status
   - ✅ Click again to un-ready

2. **Test progress bar:**

   - With 2 players ready out of 4
   - ✅ Progress bar shows 50%
   - ✅ Text shows "2/4 players ready"
   - ✅ Updates as players toggle ready

3. **Test all ready state:**

   - All 4 players mark ready
   - ✅ Progress bar shows 100%
   - ✅ Text shows "All players ready! Host can start the game."
   - ✅ Green checkmark icon appears

4. **Test start game button:**

   - Host only: ✅ "Start Game" button appears
   - Non-host: ✅ Button is NOT visible
   - When not all ready: ✅ Button is disabled
   - When all ready: ✅ Button is enabled

5. **Test start game:**

   - All players ready, 4 total players
   - Host clicks "Start Game"
   - ✅ Game starts
   - ✅ Navigation to game page (if implemented)
   - ✅ Server validates and broadcasts

6. **Test validation:**

   - Try to start with 3 players: ✅ Error message
   - Try to start when not all ready: ✅ Error message
   - ✅ Server rejects invalid start attempts

7. **Test bot ready status:**

   - Add bots
   - ✅ Bots automatically show as ready
   - ✅ Bots count toward ready total

**Test Checklist:**

- [ ] Ready toggle works for all players
- [ ] Progress bar updates correctly
- [ ] Ready count is accurate
- [ ] All ready state is detected
- [ ] Start button only visible to host
- [ ] Start button disabled when conditions not met
- [ ] Game starts when all conditions met
- [ ] Validation prevents invalid starts
- [ ] Bots count as ready

**Reference**:

- [src/components/multiplayer/ReadySystem.tsx](src/components/multiplayer/ReadySystem.tsx)
- [server/roomManager.js](server/roomManager.js) lines 212-246
- [server/local-server.js](server/local-server.js) lines 168-205

---

### Step 3.5: Bot Management

**Goal**: Host can add/remove bots

**Files to modify:**

- `src/components/multiplayer/PlayerList.tsx` - Add bot buttons

**Implementation:**

- "Add Bot" button (host only, when room not full)
- "Remove Bot" button for each bot (host only)
- Bot name generation from pool

**Server changes:**

- `roomManager.addBot()` - Add bot to room
- `roomManager.removeBot()` - Remove bot
- Socket handlers: `room:addBot`, `room:removeBot`
- Events: `bot:added`, `bot:removed`

**Testing:**

1. **Test add bot button:**

   - Host: ✅ "Add Bot" button is visible
   - Non-host: ✅ Button is NOT visible
   - When room full: ✅ Button is NOT visible

2. **Test adding bots:**

   - Host clicks "Add Bot"
   - ✅ Bot appears in player list
   - ✅ Bot has unique name (from pool or "Bot N")
   - ✅ Bot is marked as ready
   - ✅ Bot has position assigned
   - ✅ All clients see bot added

3. **Test bot limit:**

   - Add bots until room has 4 players
   - ✅ "Add Bot" button disappears
   - ✅ Cannot add more than 4 total

4. **Test remove bot:**

   - Host clicks remove (trash icon) on bot
   - ✅ Bot is removed from list
   - ✅ All clients see bot removed
   - ✅ Position becomes available

5. **Test bot name uniqueness:**

   - Add multiple bots
   - ✅ Bot names don't conflict
   - ✅ Names are from pool when available
   - ✅ Falls back to "Bot N" if pool exhausted

6. **Test bot properties:**

   - ✅ Bots show "Bot" badge
   - ✅ Bots show as ready
   - ✅ Bots have positions (0-3)
   - ✅ Bots appear in correct order

**Test Checklist:**

- [ ] Add bot button only visible to host
- [ ] Bots can be added
- [ ] Bots appear in player list
- [ ] Bot names are unique
- [ ] Bots are marked as ready
- [ ] Bots can be removed
- [ ] Room limit is enforced
- [ ] All clients see bot changes
- [ ] Bot positions are correct

**Reference**:

- [src/components/multiplayer/PlayerList.tsx](src/components/multiplayer/PlayerList.tsx) lines 31-75
- [server/roomManager.js](server/roomManager.js) lines 248-343
- [server/local-server.js](server/local-server.js) lines 207-266

---

## Phase 4: Disconnection & Reconnection

### Step 4.1: Disconnection Detection

**Goal**: Detect when players disconnect

**Server changes:**

- `roomManager.markPlayerDisconnected()` - Mark player as disconnected
- Socket `disconnect` handler in `local-server.js`
- Event: `player:disconnected` with reconnection token

**Implementation:**

- Generate UUID reconnection token
- Store token in player object
- 30-second timer for bot takeover

**Testing:**

1. **Test disconnection detection:**

   - Have 2 players in room
   - Close one browser tab/window
   - ✅ Server console shows: "Client disconnected: [socket-id]"
   - ✅ Other players receive `player:disconnected` event
   - ✅ Disconnected player marked as `isConnected: false`

2. **Test reconnection token:**

   - After disconnect
   - ✅ `player:disconnected` event includes `reconnectionToken`
   - ✅ Token is UUID format
   - ✅ Token is stored in player object

3. **Test 30-second timer:**

   - Disconnect player
   - ✅ Timer starts (check server logs)
   - ✅ No bot takeover immediately
   - ✅ Wait 30 seconds
   - ✅ Bot takeover happens (test in next step)

4. **Test disconnect event data:**
   ```javascript
   // On client, listen for event
   socket.on('player:disconnected', (data) => {
     console.log(data);
   });
   ```


   - ✅ Event includes: `socketId`, `player`, `reconnectionToken`, `players`
   - ✅ Player list updated (disconnected player marked)

**Test Checklist:**

- [ ] Disconnection is detected
- [ ] Server logs disconnection
- [ ] Other players receive event
- [ ] Reconnection token is generated
- [ ] Token is included in event
- [ ] Player marked as disconnected
- [ ] 30-second timer starts

**Reference**:

- [server/roomManager.js](server/roomManager.js) lines 345-367
- [server/local-server.js](server/local-server.js) lines 268-334

---

### Step 4.2: Bot Takeover

**Goal**: Replace disconnected players with bots after 30s

**Server changes:**

- `roomManager.replacePlayerWithBot()` - Create replacement bot
- Timer in disconnect handler
- Event: `player:botTakeover`

**Implementation:**

- Bot maintains player's position
- Bot tracks `replacingPlayerId` and `originalPlayerSocketId`
- Bot auto-ready

**Testing:**

1. **Test bot takeover after 30s:**

   - Disconnect a player
   - Wait 30 seconds (or modify timer for testing)
   - ✅ Bot is created
   - ✅ Bot replaces disconnected player
   - ✅ Bot maintains player's position
   - ✅ All clients receive `player:botTakeover` event

2. **Test bot properties:**

   - Check bot object
   - ✅ Bot has `replacingPlayerId` (original player ID)
   - ✅ Bot has `originalPlayerSocketId`
   - ✅ Bot name is "[Player Name] (Bot)"
   - ✅ Bot is ready
   - ✅ Bot has same position as replaced player

3. **Test multiple disconnections:**

   - Disconnect 2 players
   - Wait 30s each
   - ✅ Both get replaced by bots
   - ✅ Bots have different positions

4. **Test bot takeover event:**
   ```javascript
   socket.on('player:botTakeover', (data) => {
     console.log(data);
   });
   ```


   - ✅ Event includes: `socketId`, `bot`, `bots`, `players`
   - ✅ Bot list includes new bot
   - ✅ Player list updated

5. **Test reconnection before takeover:**

   - Disconnect player
   - Reconnect within 30s (test in next step)
   - ✅ Timer is cancelled
   - ✅ No bot is created

**Test Checklist:**

- [ ] Bot takeover happens after 30s
- [ ] Bot replaces disconnected player
- [ ] Bot maintains position
- [ ] Bot has correct properties
- [ ] All clients receive event
- [ ] Multiple disconnections work
- [ ] Reconnection cancels timer

**Reference**:

- [server/roomManager.js](server/roomManager.js) lines 369-419
- [server/local-server.js](server/local-server.js) lines 314-334

---

### Step 4.3: Reconnection System

**Goal**: Players can reconnect using token

**Server changes:**

- `roomManager.reconnectPlayer()` - Reconnect and remove bot
- Socket handler: `player:reconnect`
- Events: `player:reconnected`, `player:rejoined`

**Client changes:**

- `MultiplayerClient.reconnectToRoom()` - Send reconnect request
- `useMultiplayer()` - Track reconnection token, `canReconnect` flag
- `RoomLobby` - Show reconnection banner

**Testing:**

1. **Test reconnection before bot takeover:**

   - Disconnect player
   - Reconnect within 30s using token
   - ✅ Timer is cancelled
   - ✅ No bot is created
   - ✅ Player reconnects successfully
   - ✅ Player maintains position

2. **Test reconnection after bot takeover:**

   - Disconnect player
   - Wait 30s for bot takeover
   - Reconnect using token
   - ✅ Bot is removed
   - ✅ Player is restored
   - ✅ Player maintains position
   - ✅ All clients see bot removed

3. **Test reconnection token:**

   - Disconnect player
   - ✅ Client stores reconnection token
   - ✅ `canReconnect` flag is true
   - ✅ Reconnection banner appears

4. **Test reconnection UI:**

   - After disconnect, navigate to multiplayer page
   - ✅ Reconnection banner is visible
   - ✅ Shows "Reconnection Available" message
   - ✅ "Reconnect" button works
   - ✅ Clicking reconnects player

5. **Test reconnection events:**
   ```javascript
   // Reconnecting player
   socket.on('player:reconnected', (data) => {
     console.log('Reconnected:', data);
   });
   
   // Other players
   socket.on('player:rejoined', (data) => {
     console.log('Player rejoined:', data);
   });
   ```


   - ✅ Reconnecting player receives `player:reconnected`
   - ✅ Other players receive `player:rejoined`
   - ✅ Events include updated player/bot lists

6. **Test invalid token:**

   - Try to reconnect with wrong token
   - ✅ Server rejects
   - ✅ Error message shown

7. **Test reconnection state:**

   - After reconnection
   - ✅ `canReconnect` becomes false
   - ✅ Reconnection banner disappears
   - ✅ Player is back in room

**Test Checklist:**

- [ ] Reconnection before 30s works
- [ ] Reconnection after bot takeover works
- [ ] Bot is removed on reconnection
- [ ] Player maintains position
- [ ] Reconnection token is stored
- [ ] Reconnection UI appears
- [ ] Reconnection events are sent
- [ ] Invalid token is rejected
- [ ] State updates correctly

**Reference**:

- [server/roomManager.js](server/roomManager.js) lines 421-473
- [server/local-server.js](server/local-server.js) lines 336-393
- [src/utils/multiplayer.ts](src/utils/multiplayer.ts) lines 297-309
- [src/hooks/useMultiplayer.ts](src/hooks/useMultiplayer.ts) lines 173-239
- [src/components/multiplayer/RoomLobby.tsx](src/components/multiplayer/RoomLobby.tsx) lines 237-259

---

## Phase 5: Game Action Synchronization

### Step 5.1: WebSocket Middleware

**Goal**: Intercept Redux actions and send to server

**Files to create:**

- `src/store/websocketMiddleware.ts` - Redux middleware

**Implementation:**

- Middleware that intercepts `game/*` actions
- Filter local-only actions (bot triggers, saga triggers)
- Filter server actions (prevent loops)
- Send to server via `MultiplayerClient.sendGameAction()`
- Handle bot actions (apply locally immediately)

**Testing:**

1. **Test middleware initialization:**
   ```typescript
   import { initWebSocketMiddleware } from '@/store/websocketMiddleware';
   const client = createMultiplayerClient();
   initWebSocketMiddleware(client, 'test-room');
   ```


   - ✅ Middleware is initialized
   - ✅ Multiplayer mode is enabled
   - ✅ Room ID is set

2. **Test action interception:**
   ```typescript
   // Dispatch a game action
   dispatch({ type: 'game/placeBid', payload: { playerIndex: 3, bid: 200 } });
   ```


   - ✅ Action is intercepted by middleware
   - ✅ Action is sent to server (check server logs)
   - ✅ Action is NOT applied locally (for human players)

3. **Test local-only actions:**
   ```typescript
   dispatch({ type: 'game/botShouldPlayCard', payload: {...} });
   ```


   - ✅ Action is NOT sent to server
   - ✅ Action passes through normally
   - ✅ Applied locally only

4. **Test bot actions:**
   ```typescript
   // Bot action (playerIndex !== 3)
   dispatch({ type: 'game/playCard', payload: { playerIndex: 0, card: {...} } });
   ```


   - ✅ Action is sent to server
   - ✅ Action is ALSO applied locally immediately
   - ✅ UI updates right away

5. **Test server actions:**
   ```typescript
   dispatch({ type: 'game/setGameState', payload: {...} });
   ```


   - ✅ Action is NOT sent to server
   - ✅ Prevents action loops

6. **Test disabled multiplayer:**
   ```typescript
   disableMultiplayerMode();
   dispatch({ type: 'game/placeBid', payload: {...} });
   ```


   - ✅ Actions pass through normally
   - ✅ No server communication

**Test Checklist:**

- [ ] Middleware initializes correctly
- [ ] Game actions are intercepted
- [ ] Actions are sent to server
- [ ] Local-only actions are skipped
- [ ] Bot actions handled correctly
- [ ] Server actions don't loop
- [ ] Disabled mode works
- [ ] Room ID is tracked

**Reference**: [src/store/websocketMiddleware.ts](src/store/websocketMiddleware.ts)

---

### Step 5.2: Server Action Handling

**Goal**: Server validates and broadcasts game actions

**Server changes:**

- `server/gameStateManager.js` - Game state tracking
- Socket handler: `game:action` in `local-server.js`

**Implementation:**

- `GameStateManager` class
- `validateAction()` - Basic validation
- `recordAction()` - Action history (last 100)
- Broadcast validated actions to all players

**Testing:**

1. **Test action validation:**
   ```javascript
   // Send invalid action
   socket.emit('game:action', {
     action: { type: 'invalid' },
     timestamp: Date.now()
   });
   socket.on('error', (data) => {
     console.log('Error:', data.message);
   });
   ```


   - ✅ Server validates action format
   - ✅ Invalid actions are rejected
   - ✅ Error message is sent

2. **Test action broadcasting:**

   - Have 2+ clients in same room
   - One client sends action
   - ✅ Server receives action
   - ✅ Server broadcasts to all clients
   - ✅ All clients receive `game:action` event

3. **Test action history:**
   ```javascript
   // Send multiple actions
   // Check server state
   const state = gameStateManager.getGameState(roomId);
   ```


   - ✅ Actions are recorded
   - ✅ History limited to last 100 actions
   - ✅ History can be retrieved

4. **Test game state tracking:**
   ```javascript
   gameStateManager.initializeGameState(roomId, {
     gameProgress: { stage: 'BIDDING' },
     tableState: { turn: 0 }
   });
   const state = gameStateManager.getGameState(roomId);
   ```


   - ✅ State is initialized
   - ✅ State can be retrieved
   - ✅ State tracks stage and turn

5. **Test action format:**
   ```javascript
   socket.emit('game:action', {
     action: {
       type: 'game/placeBid',
       payload: { playerIndex: 3, bid: 200 }
     },
     timestamp: Date.now()
   });
   ```


   - ✅ Valid format is accepted
   - ✅ Action is broadcast
   - ✅ Timestamp is included

6. **Test room validation:**

   - Send action when not in room
   - ✅ Server rejects
   - ✅ Error message sent

**Test Checklist:**

- [ ] Actions are validated
- [ ] Invalid actions are rejected
- [ ] Valid actions are broadcast
- [ ] All clients receive actions
- [ ] Action history is recorded
- [ ] Game state is tracked
- [ ] Room validation works
- [ ] Error handling works

**Reference**:

- [server/gameStateManager.js](server/gameStateManager.js)
- [server/local-server.js](server/local-server.js) lines 395-458

---

### Step 5.3: Game Sync Hook

**Goal**: Receive and apply server actions to Redux

**Files to create:**

- `src/hooks/useGameSync.ts` - Game synchronization hook

**Implementation:**

- Initialize WebSocket middleware when in room
- Listen for `game:action` events
- Dispatch actions to Redux store
- Handle `game:stateUpdate` for full state sync
- Handle `game:started` for game initialization

**Testing:**

1. **Test hook initialization:**
   ```typescript
   const { isMultiplayerMode } = useGameSync(roomId);
   ```


   - ✅ Hook initializes when roomId provided
   - ✅ WebSocket middleware is initialized
   - ✅ Returns multiplayer mode status

2. **Test action reception:**

   - Client A sends action
   - Client B receives `game:action` event
   - ✅ Action is dispatched to Redux
   - ✅ Redux state updates
   - ✅ UI updates on Client B

3. **Test action filtering:**
   ```typescript
   // Bot action from local socket
   // Should be skipped (already applied locally)
   ```


   - ✅ Bot actions from local socket are skipped
   - ✅ Prevents double-application

4. **Test state update:**
   ```typescript
   // Server sends full state
   socket.emit('game:stateUpdate', {
     roomId: 'test',
     gameState: {...}
   });
   ```


   - ✅ Full state is applied
   - ✅ Redux state is replaced

5. **Test game started event:**
   ```typescript
   socket.emit('game:started', {
     roomId: 'test',
     config: {...},
     players: [...],
     bots: [...]
   });
   ```


   - ✅ Game is initialized
   - ✅ Player names are set
   - ✅ Game mode is set to Series
   - ✅ Game starts

6. **Test cleanup:**

   - Leave room (roomId becomes null)
   - ✅ Middleware is disabled
   - ✅ Event listeners are cleaned up

**Test Checklist:**

- [ ] Hook initializes correctly
- [ ] Actions are received and applied
- [ ] Redux state updates
- [ ] UI updates on all clients
- [ ] Bot actions are filtered
- [ ] State updates work
- [ ] Game started event works
- [ ] Cleanup works correctly

**Reference**: [src/hooks/useGameSync.ts](src/hooks/useGameSync.ts)

---

### Step 5.4: Game Start Integration

**Goal**: Start game in multiplayer mode

**Server changes:**

- Socket handler: `game:start` in `local-server.js`
- Validate: host only, all ready, 4 players
- Initialize game state
- Event: `game:started` with players/bots/config

**Client changes:**

- `ReadySystem` - Call `startGame()`
- `useGameSync` - Handle `game:started`, initialize game
- `MultiplayerPage` - Navigate to game on start

**Implementation:**

- Map room positions to game indices
- Set player names
- Initialize game state
- Navigate to game page

**Testing:**

1. **Test game start validation:**

   - Try to start with 3 players: ✅ Rejected
   - Try to start when not all ready: ✅ Rejected
   - Try to start as non-host: ✅ Rejected
   - ✅ Only host can start
   - ✅ All validation works

2. **Test game start:**

   - All 4 players ready
   - Host clicks "Start Game"
   - ✅ Server validates
   - ✅ Server initializes game state
   - ✅ Server broadcasts `game:started` event

3. **Test game initialization (client):**

   - All clients receive `game:started`
   - ✅ Game mode set to Series
   - ✅ Player names are set correctly
   - ✅ Positions mapped correctly (room position → game index)
   - ✅ Current player is at FIRST_PLAYER_ID (3)
   - ✅ Game state is initialized

4. **Test navigation:**

   - After game start
   - ✅ Navigates to game page
   - ✅ Room ID is in URL or state
   - ✅ Game loads correctly

5. **Test position mapping:**

   - Room position 0 → Game index 3 (if current player)
   - Room position 1 → Game index 0
   - Room position 2 → Game index 1
   - Room position 3 → Game index 2
   - ✅ Mapping is correct for all players
   - ✅ Current player is always at index 3

6. **Test with bots:**

   - Start game with 2 players + 2 bots
   - ✅ Bots are included in initialization
   - ✅ Bot names are set
   - ✅ Bot positions are mapped

7. **Test multiple starts:**

   - Try to start game twice
   - ✅ Second attempt is rejected (game already started)

**Test Checklist:**

- [ ] Game start validation works
- [ ] Host-only restriction works
- [ ] All-ready requirement works
- [ ] 4-player requirement works
- [ ] Server initializes game state
- [ ] All clients receive event
- [ ] Game initializes correctly
- [ ] Position mapping is correct
- [ ] Navigation works
- [ ] Bots are included

**Reference**:

- [server/local-server.js](server/local-server.js) lines 460-519
- [src/components/multiplayer/ReadySystem.tsx](src/components/multiplayer/ReadySystem.tsx) lines 63-86
- [src/hooks/useGameSync.ts](src/hooks/useGameSync.ts) lines 96-150
- [src/pages/MultiplayerPage.tsx](src/pages/MultiplayerPage.tsx) lines 30-39

---

## Phase 6: Integration & Polish

### Step 6.1: Routing Integration

**Goal**: Add multiplayer routes to app

**Files to modify:**

- `src/App.tsx` - Add multiplayer routes

**Implementation:**

- `/multiplayer` - Multiplayer page
- `/multiplayer/:roomId` - Room-specific page
- `/multiplayer-game` - Game page for multiplayer

**Testing:**

1. **Test `/multiplayer` route:**

   - Navigate to `/multiplayer`
   - ✅ MultiplayerPage loads
   - ✅ RoomLobby component renders
   - ✅ Create/Join UI is shown

2. **Test `/multiplayer/:roomId` route:**

   - Navigate to `/multiplayer/ant123`
   - ✅ MultiplayerPage loads
   - ✅ Room ID is extracted from URL
   - ✅ If room exists, shows room view
   - ✅ If room doesn't exist, shows create/join

3. **Test `/multiplayer-game` route:**

   - After starting game
   - ✅ Navigates to `/multiplayer-game`
   - ✅ GameRedux component loads
   - ✅ Game is in multiplayer mode

4. **Test route transitions:**

   - Create room → ✅ URL updates to `/multiplayer/:roomId`
   - Start game → ✅ Navigates to `/multiplayer-game`
   - Leave room → ✅ Returns to `/multiplayer`

5. **Test route parameters:**

   - Room ID in URL
   - ✅ `useParams` extracts roomId
   - ✅ Room ID is used for game sync

**Test Checklist:**

- [ ] All routes are defined
- [ ] Routes load correct components
- [ ] URL parameters work
- [ ] Route transitions work
- [ ] Navigation works correctly
- [ ] Back button works

**Reference**: [src/App.tsx](src/App.tsx) lines 38-41

---

### Step 6.2: Component Exports

**Goal**: Clean component exports

**Files to create/modify:**

- `src/components/multiplayer/index.ts` - Export all components

**Implementation:**

- Export RoomLobby, PlayerList, ReadySystem, RoomConfigurationPanel

**Testing:**

1. **Test component exports:**
   ```typescript
   import { RoomLobby, PlayerList, ReadySystem, RoomConfigurationPanel } from '@/components/multiplayer';
   ```


   - ✅ All components can be imported
   - ✅ No TypeScript errors
   - ✅ Components are properly typed

2. **Test default exports:**
   ```typescript
   import RoomLobby from '@/components/multiplayer/RoomLobby';
   ```


   - ✅ Default exports work
   - ✅ Named exports work

3. **Test component usage:**
   ```typescript
   <RoomLobby onBack={handleBack} onStartGame={handleStart} />
   ```


   - ✅ Components can be used
   - ✅ Props are typed correctly

**Test Checklist:**

- [ ] All components are exported
- [ ] Imports work correctly
- [ ] No TypeScript errors
- [ ] Components can be used

**Reference**: [src/components/multiplayer/index.ts](src/components/multiplayer/index.ts)

---

### Step 6.3: Error Handling

**Goal**: Better error messages and recovery

**Implementation:**

- Toast notifications for errors
- Connection status indicators
- Error boundaries
- Graceful degradation

**Testing:**

1. **Test server down:**

   - Stop server
   - ✅ Connection status shows "Disconnected"
   - ✅ Error toast appears
   - ✅ Buttons are disabled
   - ✅ Graceful degradation

2. **Test invalid room code:**

   - Try to join "invalid"
   - ✅ Error message appears
   - ✅ Validation prevents join

3. **Test room not found:**

   - Try to join non-existent room
   - ✅ Error message appears
   - ✅ Server sends error event

4. **Test connection errors:**

   - Network issues
   - ✅ Error handling works
   - ✅ Reconnection attempts
   - ✅ User-friendly messages

5. **Test error boundaries:**

   - Component errors
   - ✅ Error boundary catches
   - ✅ Fallback UI shown

6. **Test validation errors:**

   - Invalid config values
   - ✅ Validation prevents save
   - ✅ Error messages shown

**Test Checklist:**

- [ ] Server down is handled
- [ ] Invalid inputs are validated
- [ ] Error messages are user-friendly
- [ ] Connection errors are handled
- [ ] Error boundaries work
- [ ] Graceful degradation works

**Reference**: Error handling throughout codebase

---

## Testing Strategy

After each step, follow this testing process:

### 1. **Code-Level Testing**

   - Run TypeScript compiler: `npm run build` or `npx tsc --noEmit`
   - Verify no compilation errors
   - Check for linting errors
   - Verify imports/exports work

### 2. **Unit Testing** (where applicable)

   - Test functions in isolation
   - Test edge cases
   - Test error handling
   - Use console.log or debugger to verify behavior

### 3. **Integration Testing**

   - Start the server: `npm run server`
   - Open 2+ browser windows/tabs
   - Test the feature with multiple clients
   - Verify server logs show expected behavior
   - Verify events are sent/received correctly

### 4. **Manual UI Testing**

   - Navigate to relevant pages
   - Interact with UI elements
   - Verify visual feedback
   - Check error messages
   - Test responsive behavior

### 5. **Cross-Client Testing**

   - Test with 2-4 different clients
   - Verify state synchronization
   - Test concurrent actions
   - Verify no race conditions

### 6. **Error Scenario Testing**

   - Test invalid inputs
   - Test server disconnection
   - Test network issues
   - Test edge cases (empty room, full room, etc.)

### 7. **Commit Checklist**

Before committing each step:

   - [ ] All tests pass
   - [ ] Code compiles without errors
   - [ ] Feature works as expected
   - [ ] No console errors
   - [ ] Code is clean and readable
   - [ ] Commit message describes what was implemented

### Testing Tools

- **Browser DevTools**: Console, Network tab, React DevTools
- **Server Logs**: Check console output for events and errors
- **Socket.io Client**: Use browser console to test WebSocket events
- **Multiple Browsers**: Test with Chrome, Firefox, Safari
- **Network Throttling**: Test with slow connections

## Key Patterns to Follow

1. **Server Events**: Always emit events after state changes
2. **Client Events**: Listen for events, update local state
3. **Validation**: Server validates, client trusts server
4. **Error Handling**: Try-catch around all handlers
5. **Type Safety**: Use TypeScript types throughout

## Files Summary

**Server (3 files):**

- `server/local-server.js` - Main server
- `server/roomManager.js` - Room management
- `server/gameStateManager.js` - Game state tracking

**Client Types (1 file):**

- `src/types/multiplayer.ts` - All types

**Client Utils (2 files):**

- `src/utils/multiplayer.ts` - WebSocket client
- `src/utils/playerProfile.ts` - Profile management

**Client Hooks (3 files):**

- `src/hooks/useMultiplayer.ts` - Room state
- `src/hooks/usePlayerProfile.ts` - Profile hook
- `src/hooks/useGameSync.ts` - Game sync

**Client Components (5 files):**

- `src/components/multiplayer/RoomLobby.tsx` - Main lobby
- `src/components/multiplayer/PlayerList.tsx` - Player display
- `src/components/multiplayer/ReadySystem.tsx` - Ready system
- `src/components/multiplayer/RoomConfigurationPanel.tsx` - Config
- `src/components/multiplayer/index.ts` - Exports

**Client Pages (1 file):**

- `src/pages/MultiplayerPage.tsx` - Page wrapper

**Redux (1 file):**

- `src/store/websocketMiddleware.ts` - Action middleware

**Total: 16 files to create/modify**