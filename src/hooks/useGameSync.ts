/**
 * Hook for synchronizing game actions in multiplayer mode
 */

import {
  playerSetup,
  setGameMode,
  setGameState,
  setPlayerName,
  startGame,
} from "@/store/gameSlice";
import {
  disableMultiplayerMode,
  initWebSocketMiddleware,
  setCurrentRoomId,
} from "@/store/websocketMiddleware";
import type { GameState } from "@/types/game";
import { GameMode } from "@/types/game";
import { FIRST_PLAYER_ID, NUM_PLAYERS } from "@/utils/constants";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useMultiplayer } from "./useMultiplayer";

export function useGameSync(roomId: string | null) {
  const dispatch = useDispatch();
  const { client, isConnected, roomState, socketId } = useMultiplayer();
  const isInitialized = useRef(false);

  // Initialize WebSocket middleware when in a room
  useEffect(() => {
    if (roomId && client && isConnected && !isInitialized.current) {
      initWebSocketMiddleware(client, roomId);
      setCurrentRoomId(roomId);
      isInitialized.current = true;
    } else if (!roomId && isInitialized.current) {
      disableMultiplayerMode();
      setCurrentRoomId(null);
      isInitialized.current = false;
    }
  }, [roomId, client, isConnected]);

  // Listen for game actions from server
  useEffect(() => {
    // Wait for both client and roomId to be available
    // The client might not be ready immediately after navigation, so we wait for it
    if (!roomId) {
      return;
    }
    
    // If client isn't ready yet, wait for it to become available
    // The effect will re-run when client becomes available
    if (!client) {
      return;
    }

    const handleGameAction = (data: unknown) => {
      const event = data as {
        action: { type: string; payload?: unknown };
        timestamp: number;
        socketId: string;
      };

      // Check if this action is from a bot that we already applied locally
      // Bot actions are applied locally immediately, so we should skip re-applying them
      const payload = event.action.payload as any;
      const isBotAction = payload?.playerIndex !== undefined && 
                          payload.playerIndex !== FIRST_PLAYER_ID;
      const isFromLocalSocket = event.socketId === socketId || event.socketId === client?.getSocketId?.();
      
      // Skip re-applying bot actions that we already applied locally
      if (isBotAction && isFromLocalSocket) {
        return;
      }

      // Apply actions from server (server is source of truth)
      // The middleware skips local application for actions sent to server,
      // so we apply them here when received from server
      dispatch({
        type: event.action.type,
        payload: event.action.payload,
      });
    };

    const handleGameStateUpdate = (data: unknown) => {
      const event = data as {
        roomId: string;
        gameState: GameState;
      };

      if (event.roomId === roomId) {
        // Update entire game state
        dispatch(setGameState(event.gameState));
      }
    };

    const handleGameStarted = (data: unknown) => {
      const event = data as {
        roomId: string;
        config: {
          seriesLength?: number;
          minStartingBid?: number;
          timePerTurn?: number;
        };
        players: Array<{ id: string; name: string; position: number }>;
        bots: Array<{ id: string; name: string; position: number }>;
      };

      if (event.roomId === roomId) {
        // Find current player's room position
        const currentSocketId = socketId || client?.getSocketId?.();
        const currentPlayer = (event.players as any[]).find((p: any) => p.socketId === currentSocketId);
        
        console.log("Game started in multiplayer mode, initializing...");
        
        // Initialize the game
        // Set game mode to Series (multiplayer uses series)
        dispatch(setGameMode(GameMode.Series));
        
        // Set player names
        // Map room positions to game indices, ensuring current player is at FIRST_PLAYER_ID
        const allParticipants = [...event.players, ...event.bots].sort(
          (a, b) => a.position - b.position
        );
        
        // Find current player's room position
        const currentPlayerRoomPosition = currentPlayer?.position ?? 0;
        
        // Calculate offset to map current player to FIRST_PLAYER_ID
        // If current player is at room position 0 and FIRST_PLAYER_ID is 3:
        // offset = 3 - 0 = 3, so room position 0 maps to game index 3
        const offset = FIRST_PLAYER_ID - currentPlayerRoomPosition;
        
        allParticipants.forEach((participant) => {
          // Map room position to game index
          // Formula: gameIndex = (roomPosition + offset + NUM_PLAYERS) % NUM_PLAYERS
          const gameIndex = (participant.position + offset + NUM_PLAYERS) % NUM_PLAYERS;
          dispatch(setPlayerName({ playerIndex: gameIndex, name: participant.name }));
        });
        
        // Setup players - preserve names in multiplayer mode
        // @ts-expect-error - Redux Toolkit type inference issue with optional payloads
        dispatch(playerSetup({ preserveNames: true }));
        
        // Start game with random starting player
        const startingPlayer = Math.floor(Math.random() * NUM_PLAYERS);
        dispatch(startGame({ startingPlayer }));
        
        console.log("Multiplayer game initialized");
      }
    };

    const unsubAction = client.on("game:action", handleGameAction);
    const unsubStateUpdate = client.on("game:stateUpdate", handleGameStateUpdate);
    const unsubStarted = client.on("game:started", handleGameStarted);

    return () => {
      unsubAction();
      unsubStateUpdate();
      unsubStarted();
    };
  }, [client, roomId, dispatch]);

  return {
    isMultiplayerMode: isInitialized.current,
  };
}

