# Multiplayer Architecture - UML Diagrams

## 1. Server Architecture

```mermaid
classDiagram
    class ExpressServer {
        +app: Express
        +httpServer: HttpServer
        +io: Server
        +PORT: number
        +start()
    }
    
    class SocketIO {
        +on(event, handler)
        +emit(event, data)
    }
    
    class RoomManager {
        -rooms: Map~string, Room~
        +createRoom(hostSocketId, hostProfile): Room
        +getRoom(roomId): Room
        +joinRoom(roomId, socketId, playerProfile): Room
        +leaveRoom(roomId, socketId): LeaveResult
        +getPlayersArray(roomId): Player[]
    }
    
    class Room {
        +id: string
        +host: string
        +players: Map~string, Player~
        +bots: Map~string, BotPlayer~
        +config: RoomConfig
        +createdAt: string
        +status: RoomStatus
    }
    
    class Player {
        +id: string
        +name: string
        +socketId: string
        +isHost: boolean
        +position: number
        +isReady: boolean
        +isConnected: boolean
    }
    
    class RoomConfig {
        +seriesLength: number
        +minStartingBid: number
        +timePerTurn: number
        +botCount: number
        +maxPlayers: number
    }
    
    class Utils {
        +generateRoomId(): string
        +getDefaultRoomConfig(): RoomConfig
        +createPlayerObject(): Player
        +findNextAvailablePosition(): number
        +transferHostToLowestPosition(): string
    }
    
    ExpressServer --> SocketIO : uses
    SocketIO --> RoomManager : delegates to
    RoomManager --> Room : manages
    Room --> Player : contains
    Room --> RoomConfig : has
    RoomManager --> Utils : uses
```

## 2. Client Architecture

```mermaid
classDiagram
    class MultiplayerClient {
        -socket: Socket
        -eventListeners: Map
        -static instance: MultiplayerClient
        +connect(): Promise~void~
        +disconnect(): void
        +isConnected(): boolean
        +getSocketId(): string
        +on(event, callback): UnsubscribeFn
        +off(event, callback): void
        +emit(event, data): void
    }
    
    class useMultiplayer {
        -roomState: RoomState
        -isConnected: boolean
        -socketId: string
        +createRoom(): void
        +joinRoom(roomId): void
        +leaveRoom(roomId): void
        +roomState: RoomState
        +isHost: boolean
    }
    
    class usePlayerProfile {
        -profile: PlayerProfile
        +createProfile(name): void
        +updateProfile(updates): void
        +saveProfile(): void
    }
    
    class PlayerProfile {
        +id: string
        +name: string
        +gamesPlayed: number
        +gamesWon: number
        +totalPoints: number
        +createdAt: string
        +lastSeen: string
    }
    
    class RoomState {
        +roomId: string | null
        +players: Player[]
        +bots: BotPlayer[]
        +config: RoomConfig
        +host: string | null
        +status: RoomStatus
    }
    
    class playerProfileUtils {
        +loadPlayerProfile(): PlayerProfile
        +savePlayerProfile(profile): void
        +updatePlayerProfile(updates): void
        +getOrCreatePlayerProfile(name): PlayerProfile
    }
    
    useMultiplayer --> MultiplayerClient : uses
    useMultiplayer --> usePlayerProfile : uses
    usePlayerProfile --> playerProfileUtils : uses
    usePlayerProfile --> PlayerProfile : manages
    useMultiplayer --> RoomState : manages
    playerProfileUtils --> PlayerProfile : manages
```

## 3. Data Flow: Room Creation

```mermaid
sequenceDiagram
    participant UI as React Component
    participant Hook as useMultiplayer
    participant Client as MultiplayerClient
    participant Server as Socket.io Server
    participant RM as RoomManager
    
    UI->>Hook: createRoom()
    Hook->>Client: emit('room:create', {playerId, playerName})
    Client->>Server: Socket.io emit
    Server->>RM: createRoom(socketId, profile)
    RM->>RM: generateRoomId()
    RM->>RM: createPlayerObject()
    RM-->>Server: Room object
    Server->>Client: emit('room:created', {roomId, hostSocketId})
    Server->>Client: emit('room:joined', {roomId, players, bots, config, host})
    Client->>Hook: on('room:joined', data)
    Hook->>Hook: setRoomState(data)
    Hook-->>UI: roomState updated
```

## 4. Data Flow: Player Joining

```mermaid
sequenceDiagram
    participant UI as React Component
    participant Hook as useMultiplayer
    participant Client as MultiplayerClient
    participant Server as Socket.io Server
    participant RM as RoomManager
    participant OtherPlayers as Other Clients
    
    UI->>Hook: joinRoom(roomId)
    Hook->>Client: emit('room:join', {roomId, playerId, playerName})
    Client->>Server: Socket.io emit
    Server->>RM: joinRoom(roomId, socketId, profile)
    RM->>RM: findNextAvailablePosition()
    RM->>RM: createPlayerObject()
    RM-->>Server: Room object
    Server->>Client: emit('room:joined', {roomId, players, bots, config, host})
    Server->>OtherPlayers: emit('player:joined', {player, players, socketId})
    Client->>Hook: on('room:joined', data)
    Hook->>Hook: setRoomState(data)
    Hook-->>UI: roomState updated
    OtherPlayers->>OtherPlayers: Update player list
```

## 5. Event Flow Diagram

```mermaid
graph TB
    subgraph "Client Side"
        A[React Component] -->|uses| B[useMultiplayer Hook]
        B -->|uses| C[MultiplayerClient]
        B -->|uses| D[usePlayerProfile Hook]
        D -->|uses| E[playerProfile Utils]
        E -->|reads/writes| F[localStorage]
    end
    
    subgraph "Network"
        C <-->|WebSocket| G[Socket.io Server]
    end
    
    subgraph "Server Side"
        G -->|delegates| H[RoomManager]
        H -->|manages| I[Room Objects]
        I -->|contains| J[Player Objects]
    end
    
    style A fill:#e1f5ff
    style B fill:#e1f5ff
    style C fill:#e1f5ff
    style D fill:#e1f5ff
    style E fill:#e1f5ff
    style F fill:#fff4e1
    style G fill:#ffe1f5
    style H fill:#ffe1f5
    style I fill:#ffe1f5
    style J fill:#ffe1f5
```

## 6. Component Interaction Diagram

```mermaid
graph LR
    subgraph "Client Components"
        A[UI Component] -->|calls| B[useMultiplayer]
        B -->|listens to| C[MultiplayerClient]
        B -->|reads| D[usePlayerProfile]
        D -->|manages| E[PlayerProfile]
    end
    
    subgraph "Server Handlers"
        C -->|emits| F[room:create]
        C -->|emits| G[room:join]
        C -->|emits| H[room:leave]
        C -->|receives| I[room:created]
        C -->|receives| J[room:joined]
        C -->|receives| K[player:joined]
        C -->|receives| L[player:left]
    end
    
    subgraph "Server Logic"
        F --> M[RoomManager.createRoom]
        G --> N[RoomManager.joinRoom]
        H --> O[RoomManager.leaveRoom]
        M --> P[Room Object]
        N --> P
        O --> P
    end
    
    style A fill:#e1f5ff
    style B fill:#e1f5ff
    style C fill:#e1f5ff
    style D fill:#e1f5ff
    style E fill:#fff4e1
    style F fill:#ffe1f5
    style G fill:#ffe1f5
    style H fill:#ffe1f5
    style I fill:#ffe1f5
    style J fill:#ffe1f5
    style K fill:#ffe1f5
    style L fill:#ffe1f5
    style M fill:#ffe1f5
    style N fill:#ffe1f5
    style O fill:#ffe1f5
    style P fill:#ffe1f5
```

## 7. State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Disconnected: Initial State
    
    Disconnected --> Connecting: createMultiplayerClient()
    Connecting --> Connected: Socket.io connect
    Connecting --> Disconnected: Connection failed
    
    Connected --> InRoom: createRoom() / joinRoom()
    Connected --> Disconnected: disconnect()
    
    InRoom --> Waiting: Room created/joined
    Waiting --> Waiting: player:joined
    Waiting --> Waiting: player:left
    Waiting --> Waiting: room:configUpdated
    Waiting --> InGame: game:started (Phase 5)
    Waiting --> Disconnected: leaveRoom()
    
    InGame --> Finished: Game ends (Phase 5)
    Finished --> [*]
    
    note right of Waiting
        Room state includes:
        - players array
        - bots array
        - config
        - host
        - status
    end note
```

## 8. File Structure

```
server/
├── local-server.js          # Express + Socket.io server
├── roomManager.js           # Room management class
├── constants.js              # Constants (RoomStatus, WORDS)
├── utils.js                 # Utility functions
├── README.md                # Server documentation
└── tests/
    └── roomManager.test.js  # Room manager tests

src/
├── types/
│   └── multiplayer.ts      # TypeScript type definitions
├── utils/
│   ├── multiplayer.ts      # MultiplayerClient class
│   └── playerProfile.ts    # Profile utilities
└── hooks/
    ├── useMultiplayer.ts   # Main multiplayer hook
    └── usePlayerProfile.ts # Player profile hook
```

## Key Features Implemented

### Server Side
- ✅ Express server with Socket.io
- ✅ Room creation and management
- ✅ Player joining/leaving
- ✅ Host transfer logic
- ✅ Position assignment (0-3)
- ✅ Room full validation
- ✅ Event broadcasting

### Client Side
- ✅ TypeScript type definitions
- ✅ Player profile system (localStorage)
- ✅ WebSocket client wrapper (singleton)
- ✅ React hook for room state management
- ✅ Event listener system
- ✅ Connection status tracking
- ✅ Host detection

### Testing
- ✅ Room manager unit tests (24 tests passing)
- ✅ TypeScript compilation verification
- ✅ Linting checks

## Next Steps (Phase 3)

- Room Lobby UI components
- Player list display
- Room configuration panel
- Ready system
- Bot management
