# Multiplayer Server

This is the local multiplayer server for Three of Spades. It runs on `localhost:8080` and handles WebSocket connections for local network multiplayer games.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm run server
```

Or for development with auto-reload:
```bash
npm run server:dev
```

## Server Endpoints

- **Health Check**: `GET http://localhost:8080/health`
- **WebSocket**: `ws://localhost:8080` (via Socket.io)

## Features (Phase 1)

- ✅ Room creation and management
- ✅ Player joining/leaving
- ✅ Host management and transfer
- ✅ Room configuration
- ✅ Player ready system
- ✅ Bot management (add/remove)

## Usage

The server will automatically:
- Generate unique 6-character room IDs
- Manage player connections
- Transfer host when host disconnects
- Clean up empty rooms after 1 hour

## Client Connection

Clients connect using Socket.io client:

```typescript
import { useMultiplayer } from "@/hooks/useMultiplayer";

const { isConnected, createRoom, joinRoom } = useMultiplayer();
```

## Next Steps (Future Phases)

- Game state synchronization
- Action validation
- Reconnection handling
- Bot takeover on disconnection

