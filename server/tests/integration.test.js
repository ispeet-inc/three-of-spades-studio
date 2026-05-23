import express from 'express';
import { createServer } from 'http';
import assert from 'node:assert';
import { test } from 'node:test';
import { Server } from 'socket.io';
import { io } from 'socket.io-client';
import { roomManager } from '../roomManager.js';
import {
  validateRoomCreateData,
  validateRoomJoinData,
} from '../utils.js';

/**
 * Create a test server instance
 * @returns {Promise<{server: any, io: any, port: number}>}
 */
async function createTestServer() {
  const app = express();
  const httpServer = createServer(app);
  const ioServer = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Import and set up handlers (same as local-server.js)
  ioServer.on('connection', (socket) => {
    // Room creation handler
    socket.on('room:create', (data) => {
      try {
        const validation = validateRoomCreateData(data);
        if (!validation.valid) {
          socket.emit('error', {
            message: validation.error || 'Invalid request data',
          });
          return;
        }

        const { playerId, playerName } = data;
        const room = roomManager.createRoom(socket.id, {
          id: playerId,
          name: playerName.trim(),
        });

        socket.join(room.id);

        socket.emit('room:created', {
          roomId: room.id,
          hostSocketId: socket.id,
        });

        const players = roomManager.getPlayersArray(room.id);
        socket.emit('room:joined', {
          roomId: room.id,
          players: players,
          bots: Array.from(room.bots.values()),
          config: room.config,
          host: room.host,
        });
      } catch (error) {
        console.error('Error creating room:', error);
        socket.emit('error', {
          message: error.message || 'Failed to create room',
        });
      }
    });

    // Room join handler
    socket.on('room:join', (data) => {
      try {
        const validation = validateRoomJoinData(data);
        if (!validation.valid) {
          socket.emit('error', {
            message: validation.error || 'Invalid request data',
          });
          return;
        }

        const { roomId, playerId, playerName } = data;
        const room = roomManager.joinRoom(roomId, socket.id, {
          id: playerId,
          name: playerName.trim(),
        });

        socket.join(roomId);

        const players = roomManager.getPlayersArray(roomId);
        socket.emit('room:joined', {
          roomId: room.id,
          players: players,
          bots: Array.from(room.bots.values()),
          config: room.config,
          host: room.host,
        });

        const newPlayer = room.players.get(socket.id);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4f836c53-2343-45c0-b9b9-9712ce1f45a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'integration.test.js:98',message:'Server emitting player:joined',data:{roomId,playersCount:players.length,socketId:socket.id},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        socket.to(roomId).emit('player:joined', {
          player: newPlayer,
          players: players,
          socketId: socket.id,
        });
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', {
          message: error.message || 'Failed to join room',
        });
      }
    });

    // Room leave handler
    socket.on('room:leave', (data) => {
      try {
        const { roomId } = data;
        if (!roomId) {
          socket.emit('error', {
            message: 'Missing roomId',
          });
          return;
        }

        const result = roomManager.leaveRoom(roomId, socket.id);
        socket.leave(roomId);

        const players = roomManager.getPlayersArray(roomId);
        socket.to(roomId).emit('player:left', {
          socketId: socket.id,
          players: players,
          newHost: result.newHost || null,
        });
      } catch (error) {
        console.error('Error leaving room:', error);
        socket.emit('error', {
          message: error.message || 'Failed to leave room',
        });
      }
    });

    socket.on('disconnect', () => {
      // Handled in Phase 4
    });
  });

  return new Promise((resolve) => {
    const port = 0; // Let OS assign port
    httpServer.listen(port, () => {
      const actualPort = httpServer.address().port;
      resolve({
        server: httpServer,
        io: ioServer,
        port: actualPort,
      });
    });
  });
}

/**
 * Wait for a promise with timeout
 */
function waitFor(condition, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  });
}

// ========== Integration Tests ==========

test('Integration: Full flow - create room, join, leave', async () => {
  // Clean up before test
  roomManager.rooms.clear();

  const { server, port } = await createTestServer();

  try {
    // Create first client (host)
    const client1 = io(`http://localhost:${port}`, {
      autoConnect: true,
      transports: ['websocket'],
    });

    await new Promise((resolve) => client1.on('connect', resolve));

    let roomId = null;
    let roomJoinedData = null;

    // Client 1 creates room
    client1.on('room:created', (data) => {
      roomId = data.roomId;
    });

    client1.on('room:joined', (data) => {
      roomJoinedData = data;
    });

    client1.emit('room:create', {
      playerId: 'player-1',
      playerName: 'Player 1',
    });

    await waitFor(() => roomId !== null && roomJoinedData !== null);

    assert.ok(roomId, 'Room ID should be set');
    assert.match(roomId, /^[a-z]{3}\d{3}$/, 'Room ID should match format');
    assert.strictEqual(roomJoinedData.players.length, 1, 'Should have 1 player');
    assert.strictEqual(roomJoinedData.players[0].name, 'Player 1');
    assert.strictEqual(roomJoinedData.players[0].isHost, true);
    assert.strictEqual(roomJoinedData.host, client1.id);

    // Create second client and join
    const client2 = io(`http://localhost:${port}`, {
      autoConnect: true,
      transports: ['websocket'],
    });

    await new Promise((resolve) => client2.on('connect', resolve));

    let client2Joined = false;
    let client1ReceivedJoin = false;

    client2.on('room:joined', (data) => {
      client2Joined = true;
      assert.strictEqual(data.roomId, roomId);
      assert.strictEqual(data.players.length, 2);
    });

    client1.on('player:joined', (data) => {
      client1ReceivedJoin = true;
      assert.strictEqual(data.players.length, 2);
      assert.strictEqual(data.player.name, 'Player 2');
    });

    client2.emit('room:join', {
      roomId: roomId,
      playerId: 'player-2',
      playerName: 'Player 2',
    });

    await waitFor(() => client2Joined && client1ReceivedJoin);

    // Client 2 leaves
    let client1ReceivedLeave = false;

    client1.on('player:left', (data) => {
      client1ReceivedLeave = true;
      assert.strictEqual(data.players.length, 1);
      assert.strictEqual(data.socketId, client2.id);
    });

    client2.emit('room:leave', { roomId });
    await waitFor(() => client1ReceivedLeave);

    // Cleanup
    client1.disconnect();
    client2.disconnect();
  } finally {
    server.close();
    roomManager.rooms.clear();
  }
});

test('Integration: Multiple players join same room', async () => {
  roomManager.rooms.clear();

  const { server, port } = await createTestServer();

  try {
    // Create host
    const host = io(`http://localhost:${port}`, {
      autoConnect: true,
      transports: ['websocket'],
    });

    await new Promise((resolve) => host.on('connect', resolve));

    let roomId = null;
    host.on('room:created', (data) => {
      roomId = data.roomId;
    });

    host.emit('room:create', {
      playerId: 'host',
      playerName: 'Host',
    });

    await waitFor(() => roomId !== null);

    // Create 3 more players
    const players = [];
    for (let i = 0; i < 3; i++) {
      const client = io(`http://localhost:${port}`, {
        autoConnect: true,
        transports: ['websocket'],
      });
      await new Promise((resolve) => client.on('connect', resolve));
      players.push(client);
    }

    // All players join
    const joinPromises = players.map((client, index) => {
      return new Promise((resolve) => {
        client.on('room:joined', (data) => {
          assert.strictEqual(data.players.length, index + 2); // +2 because host + previous players
          resolve();
        });

        client.emit('room:join', {
          roomId: roomId,
          playerId: `player-${index + 1}`,
          playerName: `Player ${index + 1}`,
        });
      });
    });

    await Promise.all(joinPromises);

    // Verify final state
    const room = roomManager.getRoom(roomId);
    assert.strictEqual(room.players.size, 4, 'Room should have 4 players');
    assert.strictEqual(room.players.size + room.bots.size, 4, 'Room should be full');

    // Cleanup
    host.disconnect();
    players.forEach((client) => client.disconnect());
  } finally {
    server.close();
    roomManager.rooms.clear();
  }
});

test('Integration: Host leaves, new host assigned', async () => {
  roomManager.rooms.clear();

  const { server, port } = await createTestServer();

  try {
    // Create host
    const host = io(`http://localhost:${port}`, {
      autoConnect: true,
      transports: ['websocket'],
    });

    await new Promise((resolve) => host.on('connect', resolve));

    let roomId = null;
    host.on('room:created', (data) => {
      roomId = data.roomId;
    });

    host.emit('room:create', {
      playerId: 'host',
      playerName: 'Host',
    });

    await waitFor(() => roomId !== null);

    // Create second player
    const player2 = io(`http://localhost:${port}`, {
      autoConnect: true,
      transports: ['websocket'],
    });

    await new Promise((resolve) => player2.on('connect', resolve));

    await new Promise((resolve) => {
      player2.on('room:joined', resolve);
      player2.emit('room:join', {
        roomId: roomId,
        playerId: 'player-2',
        playerName: 'Player 2',
      });
    });

    // Host leaves
    let newHostAssigned = false;
    let newHostSocketId = null;

    player2.on('player:left', (data) => {
      newHostAssigned = true;
      newHostSocketId = data.newHost;
      assert.ok(data.newHost, 'New host should be assigned');
      assert.strictEqual(data.newHost, player2.id, 'Player 2 should become host');
    });

    host.emit('room:leave', { roomId });
    await waitFor(() => newHostAssigned);

    // Verify new host in room
    const room = roomManager.getRoom(roomId);
    assert.strictEqual(room.host, newHostSocketId);
    const newHostPlayer = room.players.get(newHostSocketId);
    assert.strictEqual(newHostPlayer.isHost, true);

    // Cleanup
    host.disconnect();
    player2.disconnect();
  } finally {
    server.close();
    roomManager.rooms.clear();
  }
});

test('Integration: Room full scenario', async () => {
  roomManager.rooms.clear();

  const { server, port } = await createTestServer();

  try {
    // Create host
    const host = io(`http://localhost:${port}`, {
      autoConnect: true,
      transports: ['websocket'],
    });

    await new Promise((resolve) => host.on('connect', resolve));

    let roomId = null;
    host.on('room:created', (data) => {
      roomId = data.roomId;
    });

    host.emit('room:create', {
      playerId: 'host',
      playerName: 'Host',
    });

    await waitFor(() => roomId !== null);

    // Fill room to capacity (3 more players = 4 total)
    const players = [];
    for (let i = 0; i < 3; i++) {
      const client = io(`http://localhost:${port}`, {
        autoConnect: true,
        transports: ['websocket'],
      });
      await new Promise((resolve) => client.on('connect', resolve));

      await new Promise((resolve) => {
        client.on('room:joined', resolve);
        client.emit('room:join', {
          roomId: roomId,
          playerId: `player-${i + 1}`,
          playerName: `Player ${i + 1}`,
        });
      });

      players.push(client);
    }

    // Try to join with 5th player (should fail)
    const client5 = io(`http://localhost:${port}`, {
      autoConnect: true,
      transports: ['websocket'],
    });

    await new Promise((resolve) => client5.on('connect', resolve));

    let errorReceived = false;
    let errorMessage = null;

    client5.on('error', (data) => {
      errorReceived = true;
      errorMessage = data.message;
    });

    client5.emit('room:join', {
      roomId: roomId,
      playerId: 'player-5',
      playerName: 'Player 5',
    });

    await waitFor(() => errorReceived);

    assert.ok(errorReceived, 'Should receive error');
    assert.ok(errorMessage.includes('full') || errorMessage.includes('Room is full'));

    // Verify room still has 4 players
    const room = roomManager.getRoom(roomId);
    assert.strictEqual(room.players.size, 4);

    // Cleanup
    host.disconnect();
    players.forEach((client) => client.disconnect());
    client5.disconnect();
  } finally {
    server.close();
    roomManager.rooms.clear();
  }
});

test('Integration: Invalid room ID format', async () => {
  roomManager.rooms.clear();

  const { server, port } = await createTestServer();

  try {
    const client = io(`http://localhost:${port}`, {
      autoConnect: true,
      transports: ['websocket'],
    });

    await new Promise((resolve) => client.on('connect', resolve));

    let errorReceived = false;
    let errorMessage = null;

    client.on('error', (data) => {
      errorReceived = true;
      errorMessage = data.message;
    });

    client.emit('room:join', {
      roomId: 'invalid',
      playerId: 'player-1',
      playerName: 'Player 1',
    });

    await waitFor(() => errorReceived);

    assert.ok(errorReceived, 'Should receive error');
    assert.ok(errorMessage.includes('Room ID') || errorMessage.includes('format'));

    client.disconnect();
  } finally {
    server.close();
    roomManager.rooms.clear();
  }
});

test('Integration: Join non-existent room', async () => {
  roomManager.rooms.clear();

  const { server, port } = await createTestServer();

  try {
    const client = io(`http://localhost:${port}`, {
      autoConnect: true,
      transports: ['websocket'],
    });

    await new Promise((resolve) => client.on('connect', resolve));

    let errorReceived = false;
    let errorMessage = null;

    client.on('error', (data) => {
      errorReceived = true;
      errorMessage = data.message;
    });

    // Use valid format but non-existent room
    client.emit('room:join', {
      roomId: 'ant999',
      playerId: 'player-1',
      playerName: 'Player 1',
    });

    await waitFor(() => errorReceived);

    assert.ok(errorReceived, 'Should receive error');
    assert.ok(errorMessage.includes('not found') || errorMessage.includes('Room not found'));

    client.disconnect();
  } finally {
    server.close();
    roomManager.rooms.clear();
  }
});

test('Integration: Event sequence verification', async () => {
  roomManager.rooms.clear();

  const { server, port } = await createTestServer();

  try {
    // Create host
    const host = io(`http://localhost:${port}`, {
      autoConnect: true,
      transports: ['websocket'],
    });

    await new Promise((resolve) => host.on('connect', resolve));

    const events = [];

    host.on('room:created', (data) => {
      events.push({ type: 'room:created', data });
    });

    host.on('room:joined', (data) => {
      events.push({ type: 'room:joined', data });
    });

    host.emit('room:create', {
      playerId: 'host',
      playerName: 'Host',
    });

    await waitFor(() => events.length >= 2);

    // Verify event sequence
    assert.strictEqual(events[0].type, 'room:created');
    assert.strictEqual(events[1].type, 'room:joined');
    assert.strictEqual(events[0].data.roomId, events[1].data.roomId);

    // Create second player
    const player2 = io(`http://localhost:${port}`, {
      autoConnect: true,
      transports: ['websocket'],
    });

    await new Promise((resolve) => player2.on('connect', resolve));

    const hostEvents = [];
    const player2Events = [];

    host.on('player:joined', (data) => {
      hostEvents.push({ type: 'player:joined', data });
    });

    player2.on('room:joined', (data) => {
      player2Events.push({ type: 'room:joined', data });
    });

    const roomId = events[0].data.roomId;

    player2.emit('room:join', {
      roomId: roomId,
      playerId: 'player-2',
      playerName: 'Player 2',
    });

    await waitFor(() => hostEvents.length >= 1 && player2Events.length >= 1);

    // Verify events
    assert.strictEqual(hostEvents[0].type, 'player:joined');
    assert.strictEqual(player2Events[0].type, 'room:joined');
    assert.strictEqual(hostEvents[0].data.players.length, 2);
    assert.strictEqual(player2Events[0].data.players.length, 2);

    // Cleanup
    host.disconnect();
    player2.disconnect();
  } finally {
    server.close();
    roomManager.rooms.clear();
  }
});

test('Integration: State consistency across clients', async () => {
  roomManager.rooms.clear();

  const { server, port } = await createTestServer();

  try {
    // Create host
    const host = io(`http://localhost:${port}`, {
      autoConnect: true,
      transports: ['websocket'],
    });

    await new Promise((resolve) => host.on('connect', resolve));

    let roomId = null;
    let hostRoomState = null;
    let latestHostPlayerJoined = null;

    host.on('room:created', (data) => {
      roomId = data.roomId;
    });

    host.on('room:joined', (data) => {
      hostRoomState = data;
    });

    // Listen for player:joined events to track state updates
    // #region agent log
    host.on('player:joined', (data) => {
      fetch('http://127.0.0.1:7242/ingest/4f836c53-2343-45c0-b9b9-9712ce1f45a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'integration.test.js:687',message:'First listener received player:joined',data:{playersCount:data.players?.length,eventReceived:true},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
      latestHostPlayerJoined = data;
    });
    // #endregion

    host.emit('room:create', {
      playerId: 'host',
      playerName: 'Host',
    });

    await waitFor(() => roomId !== null && hostRoomState !== null);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4f836c53-2343-45c0-b9b9-9712ce1f45a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'integration.test.js:696',message:'Room created, setting up second listener',data:{roomId,hasHostRoomState:!!hostRoomState},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // Create 2 more players
    const players = [];
    const playerStates = [];
    const hostPlayerJoinedEvents = [];

    // Set up listener to collect all player:joined events
    // #region agent log
    host.on('player:joined', (data) => {
      fetch('http://127.0.0.1:7242/ingest/4f836c53-2343-45c0-b9b9-9712ce1f45a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'integration.test.js:704',message:'Second listener received player:joined',data:{playersCount:data.players?.length,eventsArrayLength:hostPlayerJoinedEvents.length},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
      latestHostPlayerJoined = data;
      hostPlayerJoinedEvents.push(data);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4f836c53-2343-45c0-b9b9-9712ce1f45a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'integration.test.js:707',message:'After push to hostPlayerJoinedEvents',data:{eventsArrayLength:hostPlayerJoinedEvents.length},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
      // #endregion
    });
    // #endregion

    for (let i = 0; i < 2; i++) {
      const client = io(`http://localhost:${port}`, {
        autoConnect: true,
        transports: ['websocket'],
      });
      await new Promise((resolve) => client.on('connect', resolve));

      const playerJoinedPromise = new Promise((resolve) => {
        client.on('room:joined', (data) => {
          playerStates.push(data);
          resolve();
        });
      });

      // Wait for host to receive player:joined event for this player
      // The second listener (line 703) will push to hostPlayerJoinedEvents
      // We'll wait for the array to have the expected length

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4f836c53-2343-45c0-b9b9-9712ce1f45a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'integration.test.js:722',message:'Emitting room:join',data:{playerIndex:i,roomId,playerId:`player-${i + 1}`},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
      // #endregion

      client.emit('room:join', {
        roomId: roomId,
        playerId: `player-${i + 1}`,
        playerName: `Player ${i + 1}`,
      });

      // Wait for player to join
      await playerJoinedPromise;
      
      // Then wait for host to receive the player:joined event
      // (second listener pushes to hostPlayerJoinedEvents array)
      await waitFor(() => hostPlayerJoinedEvents.length === i + 1, 2000);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4f836c53-2343-45c0-b9b9-9712ce1f45a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'integration.test.js:729',message:'Player joined and host received event',data:{playerIndex:i,eventsArrayLength:hostPlayerJoinedEvents.length},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      players.push(client);
    }

    // Verify we have both events (should already be true, but double-check)
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4f836c53-2343-45c0-b9b9-9712ce1f45a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'integration.test.js:734',message:'Final check after all joins',data:{currentEventsLength:hostPlayerJoinedEvents.length,targetLength:2},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    assert.strictEqual(hostPlayerJoinedEvents.length, 2, 'Host should have received 2 player:joined events');

    // Final verification - latest event should have 3 players
    assert.ok(latestHostPlayerJoined !== null, 'Host should have received player:joined events');
    assert.strictEqual(hostPlayerJoinedEvents.length, 2, 'Host should have received 2 player:joined events');
    assert.strictEqual(hostPlayerJoinedEvents[1].players.length, 3, 'Second player:joined event should have 3 players');
    assert.strictEqual(latestHostPlayerJoined.players.length, 3, 'Latest host event should have 3 players');

    // Use latest player:joined event data for host's player list (it has the most up-to-date list)
    // player:joined event has: { player, players, socketId }
    // room:joined event has: { roomId, players, bots, config, host }
    const hostPlayers = latestHostPlayerJoined
      ? latestHostPlayerJoined.players
      : hostRoomState.players;

    // Verify all clients have consistent state
    assert.strictEqual(hostPlayers.length, 3, 'Host should see 3 players');
    assert.strictEqual(playerStates[0].players.length, 3, 'Player 1 should see 3 players');
    assert.strictEqual(playerStates[1].players.length, 3, 'Player 2 should see 3 players');

    // Verify all have same room ID (from room:joined events)
    assert.strictEqual(hostRoomState.roomId, roomId);
    assert.strictEqual(playerStates[0].roomId, roomId);
    assert.strictEqual(playerStates[1].roomId, roomId);

    // Verify all have same host (from room:joined events)
    assert.strictEqual(hostRoomState.host, host.id);
    assert.strictEqual(playerStates[0].host, host.id);
    assert.strictEqual(playerStates[1].host, host.id);

    // Cleanup
    host.disconnect();
    players.forEach((client) => client.disconnect());
  } finally {
    server.close();
    roomManager.rooms.clear();
  }
});
