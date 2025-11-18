/**
 * Hook for synchronizing game actions in multiplayer mode
 */

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useMultiplayer } from "./useMultiplayer";
import {
  initWebSocketMiddleware,
  disableMultiplayerMode,
  setCurrentRoomId,
} from "@/store/websocketMiddleware";
import { setGameState } from "@/store/gameSlice";
import type { GameState } from "@/types/game";

export function useGameSync(roomId: string | null) {
  const dispatch = useDispatch();
  const { client, isConnected, roomState } = useMultiplayer();
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
    if (!client || !roomId) return;

    const handleGameAction = (data: unknown) => {
      const event = data as {
        action: { type: string; payload?: unknown };
        timestamp: number;
        socketId: string;
      };

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
        config: unknown;
        players: unknown[];
        bots: unknown[];
      };

      if (event.roomId === roomId) {
        // Game has started, trigger initialization
        // This will be handled by the game flow saga
        console.log("Game started in multiplayer mode");
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

