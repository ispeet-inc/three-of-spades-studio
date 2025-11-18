/**
 * Local multiplayer server for Three of Spades
 * Runs on localhost:8080 for local network multiplayer
 */

import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { gameStateManager } from "./gameStateManager.js";
import { roomManager } from "./roomManager.js";

const PORT = process.env.PORT || 8080;
const app = express();

// Enable CORS for all origins (local network)
app.use(cors());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for local network
    methods: ["GET", "POST"],
  },
});

// Helper to serialize room for client (convert Maps to arrays)
function serializeRoom(room) {
  return {
    ...room,
    players: Array.from(room.players.values()),
    bots: Array.from(room.bots.values()),
    createdAt: room.createdAt.toISOString(),
    lastActivity: room.lastActivity.toISOString(),
  };
}

// Socket.io connection handling
io.on("connection", socket => {
  console.log(`Client connected: ${socket.id}`);

  // Create room
  socket.on("room:create", data => {
    try {
      const { playerId, playerName, config } = data;
      const room = roomManager.createRoom(
        socket.id,
        {
          id: playerId,
          name: playerName,
        },
        config
      );

      socket.join(room.id);
      socket.emit("room:created", {
        roomId: room.id,
        hostSocketId: socket.id,
        config: room.config,
      });

      // Send current room state
      socket.emit("room:joined", {
        roomId: room.id,
        player: room.players.get(socket.id),
        players: Array.from(room.players.values()),
        bots: Array.from(room.bots.values()),
        config: room.config,
        status: room.status,
      });

      console.log(`Room created: ${room.id} by ${socket.id}`);
    } catch (error) {
      console.error("Error creating room:", error);
      socket.emit("error", { message: "Failed to create room" });
    }
  });

  // Join room
  socket.on("room:join", data => {
    try {
      const { roomId, playerId, playerName } = data;
      const result = roomManager.joinRoom(roomId, socket.id, {
        id: playerId,
        name: playerName,
      });

      if (!result) {
        socket.emit("error", { message: "Failed to join room" });
        return;
      }

      const { room, player } = result;
      socket.join(roomId);

      // Notify the joining player
      socket.emit("room:joined", {
        roomId: room.id,
        player,
        players: Array.from(room.players.values()),
        bots: Array.from(room.bots.values()),
        config: room.config,
        status: room.status,
      });

      // Notify other players
      socket.to(roomId).emit("player:joined", {
        player,
        players: Array.from(room.players.values()),
      });

      console.log(`Player ${socket.id} joined room ${roomId}`);
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  // Leave room
  socket.on("room:leave", data => {
    try {
      const { roomId } = data;
      const result = roomManager.leaveRoom(roomId, socket.id);

      if (result.room) {
        socket.leave(roomId);
        socket.to(roomId).emit("player:left", {
          socketId: socket.id,
          players: Array.from(result.room.players.values()),
          newHost: result.newHost,
        });
      }

      console.log(`Player ${socket.id} left room ${roomId}`);
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  });

  // Update room config
  socket.on("room:updateConfig", data => {
    try {
      const { roomId, config } = data;
      const room = roomManager.updateRoomConfig(roomId, socket.id, config);

      if (!room) {
        socket.emit("error", { message: "Failed to update room config" });
        return;
      }

      // Broadcast config update to all players in room
      io.to(roomId).emit("room:configUpdated", {
        config: room.config,
      });
    } catch (error) {
      console.error("Error updating room config:", error);
      socket.emit("error", { message: "Failed to update room config" });
    }
  });

  // Set player ready
  socket.on("player:setReady", data => {
    try {
      const { roomId, isReady } = data;
      const result = roomManager.setPlayerReady(roomId, socket.id, isReady);

      if (!result.room) {
        socket.emit("error", { message: "Failed to set ready status" });
        return;
      }

      // Broadcast ready status to all players in room
      io.to(roomId).emit("player:ready", {
        socketId: socket.id,
        isReady,
        allReady: result.allReady,
      });
    } catch (error) {
      console.error("Error setting player ready:", error);
      socket.emit("error", { message: "Failed to set ready status" });
    }
  });

  // Add bot
  socket.on("room:addBot", data => {
    try {
      const { roomId } = data;
      const result = roomManager.addBot(roomId, socket.id);

      if (!result.room || !result.bot) {
        socket.emit("error", { message: "Failed to add bot" });
        return;
      }

      // Broadcast bot addition to all players in room
      io.to(roomId).emit("bot:added", {
        bot: result.bot,
        bots: Array.from(result.room.bots.values()),
        players: Array.from(result.room.players.values()),
      });
    } catch (error) {
      console.error("Error adding bot:", error);
      socket.emit("error", { message: "Failed to add bot" });
    }
  });

  // Remove bot
  socket.on("room:removeBot", data => {
    try {
      const { roomId, botId } = data;
      const result = roomManager.removeBot(roomId, botId, socket.id);

      if (!result.room) {
        socket.emit("error", { message: "Failed to remove bot" });
        return;
      }

      // Broadcast bot removal to all players in room
      io.to(roomId).emit("bot:removed", {
        botId,
        bots: Array.from(result.room.bots.values()),
        players: Array.from(result.room.players.values()),
      });
    } catch (error) {
      console.error("Error removing bot:", error);
      socket.emit("error", { message: "Failed to remove bot" });
    }
  });

  // Track disconnections for bot takeover
  const disconnectionTimers = new Map(); // socketId -> timer

  // Disconnect handling
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);

    // Find which room this socket belongs to
    let playerRoom = null;
    let playerRoomId = null;

    // Search through all rooms to find the one containing this socket
    const allRooms = roomManager.getAllRooms();
    for (const room of allRooms) {
      if (room.players.has(socket.id)) {
        playerRoom = room;
        playerRoomId = room.id;
        break;
      }
    }

    if (!playerRoom || !playerRoomId) {
      return; // Not in any room
    }

    // Mark player as disconnected
    const disconnectResult = roomManager.markPlayerDisconnected(
      playerRoomId,
      socket.id
    );

    if (!disconnectResult) {
      return;
    }

    const { reconnectionToken } = disconnectResult;

    // Notify room that player disconnected
    io.to(playerRoomId).emit("player:disconnected", {
      socketId: socket.id,
      player: playerRoom.players.get(socket.id),
      reconnectionToken, // Send token to disconnected player's client (if they reconnect)
      players: Array.from(playerRoom.players.values()),
    });

    // Set 30-second timer for bot takeover
    const timer = setTimeout(() => {
      const takeoverResult = roomManager.replacePlayerWithBot(
        playerRoomId,
        socket.id
      );

      if (takeoverResult.room && takeoverResult.bot) {
        // Broadcast bot takeover
        io.to(playerRoomId).emit("player:botTakeover", {
          socketId: socket.id,
          bot: takeoverResult.bot,
          bots: Array.from(takeoverResult.room.bots.values()),
          players: Array.from(takeoverResult.room.players.values()),
        });
      }

      disconnectionTimers.delete(socket.id);
    }, 30000); // 30 seconds

    disconnectionTimers.set(socket.id, timer);
  });

  // Reconnection handling
  socket.on("player:reconnect", data => {
    try {
      const { roomId, reconnectionToken } = data;

      const result = roomManager.reconnectPlayer(
        roomId,
        reconnectionToken,
        socket.id
      );

      if (!result) {
        socket.emit("error", { message: "Invalid reconnection token" });
        return;
      }

      const { room, player, removedBot } = result;

      // Cancel bot takeover timer if it exists
      // Try to find the timer by checking all timers for this room
      for (const [oldSocketId, timer] of disconnectionTimers.entries()) {
        const oldRoom = roomManager.getRoom(roomId);
        if (oldRoom && oldRoom.players.has(oldSocketId)) {
          const oldPlayer = oldRoom.players.get(oldSocketId);
          if (oldPlayer && oldPlayer.id === player.id) {
            clearTimeout(timer);
            disconnectionTimers.delete(oldSocketId);
            break;
          }
        }
      }

      socket.join(roomId);

      // Notify reconnected player
      socket.emit("player:reconnected", {
        roomId: room.id,
        player,
        players: Array.from(room.players.values()),
        bots: Array.from(room.bots.values()),
        config: room.config,
        status: room.status,
      });

      // Notify other players
      socket.to(roomId).emit("player:rejoined", {
        player,
        removedBot,
        players: Array.from(room.players.values()),
        bots: Array.from(room.bots.values()),
      });

      console.log(`Player ${socket.id} reconnected to room ${roomId}`);
    } catch (error) {
      console.error("Error reconnecting player:", error);
      socket.emit("error", { message: "Failed to reconnect" });
    }
  });

  // Game action handling
  socket.on("game:action", data => {
    try {
      const { action, timestamp } = data;

      // Find which room this socket belongs to
      let playerRoom = null;
      let playerRoomId = null;

      const allRooms = roomManager.getAllRooms();
      for (const room of allRooms) {
        if (room.players.has(socket.id)) {
          playerRoom = room;
          playerRoomId = room.id;
          break;
        }
      }

      if (!playerRoom || !playerRoomId) {
        socket.emit("error", { message: "Not in a room" });
        return;
      }

      // Basic validation
      if (!action || !action.type) {
        socket.emit("error", { message: "Invalid action format" });
        return;
      }

      // Get current game state for validation
      const currentState = gameStateManager.getGameState(playerRoomId);

      // Validate action
      const validation = gameStateManager.validateAction(
        playerRoomId,
        action,
        currentState
      );

      if (!validation.valid) {
        socket.emit("error", {
          message: validation.error || "Invalid action",
        });
        return;
      }

      // Record action for history
      gameStateManager.recordAction(playerRoomId, action);

      // Broadcast action to all players in room (including sender)
      io.to(playerRoomId).emit("game:action", {
        action,
        timestamp,
        socketId: socket.id,
      });

      console.log(
        `Game action ${action.type} from ${socket.id} in room ${playerRoomId}`
      );
    } catch (error) {
      console.error("Error handling game action:", error);
      socket.emit("error", { message: "Failed to process game action" });
    }
  });

  // Game start handling
  socket.on("game:start", data => {
    try {
      const { roomId } = data;

      const room = roomManager.getRoom(roomId);
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      const player = room.players.get(socket.id);
      if (!player || !player.isHost) {
        socket.emit("error", { message: "Only host can start game" });
        return;
      }

      // Check if all players are ready
      const allPlayersReady = Array.from(room.players.values()).every(
        p => p.isReady
      );
      const allBotsReady = Array.from(room.bots.values()).every(b => b.isReady);
      const totalPlayers = room.players.size + room.bots.size;

      if (
        !allPlayersReady ||
        !allBotsReady ||
        totalPlayers !== room.config.maxPlayers
      ) {
        socket.emit("error", {
          message: "Not all players are ready or room is not full",
        });
        return;
      }

      // Update room status
      room.status = "playing";
      room.lastActivity = new Date();

      // Initialize game state on server
      // Basic state - clients will initialize full state
      gameStateManager.initializeGameState(roomId, {
        gameProgress: { stage: "INIT" },
        tableState: { turn: 0 },
      });

      // Broadcast game start to all players
      io.to(roomId).emit("game:started", {
        roomId,
        config: room.config,
        players: Array.from(room.players.values()),
        bots: Array.from(room.bots.values()),
      });

      console.log(`Game started in room ${roomId}`);
    } catch (error) {
      console.error("Error starting game:", error);
      socket.emit("error", { message: "Failed to start game" });
    }
  });

  // Request game state (for reconnection or initial sync)
  socket.on("game:requestState", data => {
    try {
      const { roomId } = data;

      const room = roomManager.getRoom(roomId);
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      const gameState = gameStateManager.getGameState(roomId);
      if (gameState) {
        socket.emit("game:stateUpdate", {
          roomId,
          gameState,
        });
      }
    } catch (error) {
      console.error("Error sending game state:", error);
      socket.emit("error", { message: "Failed to get game state" });
    }
  });
});

// Cleanup empty rooms every 10 minutes
setInterval(
  () => {
    roomManager.cleanupEmptyRooms();
  },
  10 * 60 * 1000
);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Multiplayer server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
});
