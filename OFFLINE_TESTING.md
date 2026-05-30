# Offline Testing Guide

This guide explains how to test the multiplayer implementation locally on your machine.

## Prerequisites

1. **Node.js installed** (v18 or higher)
2. **Dependencies installed**: `npm install`
3. **Two browser windows/tabs** (to simulate multiple players)

## Quick Start

### Step 1: Start the Server

Open Terminal 1 and run:
```bash
npm run server
```

You should see:
```
🚀 Multiplayer server running on http://localhost:8080
📡 WebSocket server ready for connections
```

**Keep this terminal open** - the server needs to keep running.

### Step 2: Start the Client

Open Terminal 2 and run:
```bash
npm run dev
```

This starts the Vite dev server (usually on `http://localhost:5173`).

### Step 3: Test Multiplayer

1. **Open two browser windows**:
   - Window 1: `http://localhost:5173`
   - Window 2: `http://localhost:5173` (or use incognito/private window)

2. **Test Room Creation**:
   - Window 1: Click "Multiplayer" → "Create Room"
   - Note the 6-character room code
   - Window 2: Click "Multiplayer" → Enter room code → "Join Room"

3. **Test Ready System**:
   - Both windows: Click "Mark as Ready"
   - Verify ready status updates in both windows

4. **Test Bot Management** (Host only):
   - Window 1 (host): Click "Add Bot"
   - Verify bot appears in both windows
   - Click "Remove Bot" to remove it

5. **Test Game Start**:
   - Add bots until 4 total players
   - All mark ready
   - Host clicks "Start Game"
   - Verify game starts in both windows

## Testing Scenarios

### Scenario 1: Basic Room Flow
```
1. Window 1: Create room → Get code "ABC123"
2. Window 2: Join room "ABC123"
3. Both: See each other in player list
4. Both: Mark as ready
5. Host: Add 2 bots
6. Host: Start game
```

### Scenario 2: Disconnection Test
```
1. Create room with 2 players
2. Window 2: Close tab (simulate disconnection)
3. Window 1: Wait 30 seconds
4. Verify: Bot takes over for disconnected player
5. Window 2: Reopen → Use reconnection token
6. Verify: Bot removed, player restored
```

### Scenario 3: Host Transfer
```
1. Create room with 2 players (Window 1 is host)
2. Window 1: Leave room
3. Window 2: Verify becomes new host
4. Window 2: Can now configure room and add bots
```

### Scenario 4: Full Game Test
```
1. Create room with 2 players
2. Add 2 bots (total 4 players)
3. All mark ready
4. Start game
5. Play through a round
6. Verify actions sync between windows
```

## Testing Checklist

### Phase 1: Core Infrastructure ✅
- [ ] Server starts without errors
- [ ] Health check works: `curl http://localhost:8080/health`
- [ ] Client connects to server
- [ ] Player profile loads from localStorage

### Phase 2: Room System ✅
- [ ] Create room generates unique code
- [ ] Join room with code works
- [ ] Player list updates in real-time
- [ ] Host can configure room
- [ ] Host transfer works

### Phase 3: Bot Integration ✅
- [ ] Host can add bots
- [ ] Host can remove bots
- [ ] Bots appear in player list
- [ ] Bots auto-ready
- [ ] Disconnection triggers bot takeover
- [ ] Reconnection removes bot

### Phase 4: Game Integration ✅
- [ ] Ready system works
- [ ] Game can start when all ready
- [ ] Game actions sync between clients
- [ ] Error messages display properly

## Troubleshooting

### Server won't start
```bash
# Check if port 8080 is in use
lsof -i :8080

# Kill process if needed
kill -9 <PID>

# Or use different port
PORT=8081 npm run server
```

### Client can't connect
- Verify server is running: `curl http://localhost:8080/health`
- Check browser console for WebSocket errors
- Verify CORS settings in server

### Actions not syncing
- Check server console for errors
- Verify both clients are in same room
- Check browser console for WebSocket messages
- Ensure game is started (actions require game state)

### Room not found
- Verify room code is correct (case-sensitive)
- Check server console for room creation
- Rooms auto-cleanup after 1 hour of inactivity

## Browser DevTools Tips

### Monitor WebSocket Messages
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "WS" (WebSocket)
4. Click on connection
5. View "Messages" tab to see all events

### Check Redux State
1. Install Redux DevTools extension
2. Open DevTools → Redux tab
3. Monitor state changes during gameplay

### Console Logging
The implementation includes debug logging:
- Server console: Shows all events and errors
- Browser console: Shows client-side events

## Automated Tests

Run the automated test suite:
```bash
# Terminal 1: Start server
npm run server

# Terminal 2: Run tests
npm run test:phase4
```

## Local Network Testing

To test on multiple devices on the same network:

1. **Find your local IP**:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. **Update server** (if needed):
   - Server already accepts all origins via CORS
   - Just use your local IP instead of localhost

3. **Access from other devices**:
   - Device 2: `http://YOUR_IP:5173` (client)
   - Server: `http://YOUR_IP:8080` (server)

4. **Update client connection** (if needed):
   - Check `src/utils/multiplayer.ts` for server URL
   - Default is `http://localhost:8080`

## Testing with Multiple Tabs

### Chrome/Edge
- Open new tab: `Ctrl+T` (Windows) or `Cmd+T` (Mac)
- Or use incognito window: `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)

### Firefox
- Open new tab: `Ctrl+T` (Windows) or `Cmd+T` (Mac)
- Or use private window: `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)

### Safari
- Open new tab: `Cmd+T`
- Or use private window: `Cmd+Shift+N`

## Performance Testing

### Test with Multiple Rooms
1. Create multiple rooms in different tabs
2. Join different rooms
3. Verify no interference between rooms

### Test with Max Players
1. Create room
2. Add 3 bots (total 4 players)
3. Test all features with full room

### Stress Test
1. Create 10+ rooms
2. Join/leave rapidly
3. Monitor server performance

## Common Issues

### "Not connected to server"
- Server not running
- Wrong server URL
- Firewall blocking connection

### "Room not found"
- Room code incorrect
- Room was cleaned up (1 hour inactivity)
- Server restarted (rooms cleared)

### "Failed to set ready status"
- Player not in room
- Socket connection lost
- Check server console for errors

### "Failed to add bot"
- Not the host
- Room is full (4 players)
- Check server console for errors

## Next Steps

After offline testing passes:
1. Test on local network (multiple devices)
2. Test full game playthrough
3. Test edge cases (rapid disconnects, etc.)
4. Performance testing
5. UI/UX polish

## Quick Reference

```bash
# Start server
npm run server

# Start client
npm run dev

# Run automated tests
npm run test:phase4

# Check server health
curl http://localhost:8080/health

# Server logs location
# Terminal where server is running
```

## Tips

1. **Keep server terminal visible** - Shows all events and errors
2. **Use browser DevTools** - Monitor WebSocket messages
3. **Test incrementally** - One feature at a time
4. **Clear localStorage** - If profile issues occur: `localStorage.clear()`
5. **Check both windows** - Verify sync works both ways
