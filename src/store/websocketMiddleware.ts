/**
 * WebSocket middleware for Redux
 * Intercepts game actions and sends them to the multiplayer server
 */

import { Middleware } from "@reduxjs/toolkit";
import type { RootState } from "./index";
import type { AppDispatch } from "./index";
import type { MultiplayerClient } from "@/utils/multiplayer";

// Actions that should be sent to server (game actions)
const GAME_ACTION_PREFIX = "game/";

// Actions that should NOT be sent to server (local-only)
const LOCAL_ACTIONS = [
  "game/botShouldPlayCard",
  "game/botShouldBid",
  "game/botShouldSelectTrump",
  "game/gameInitialize",
  "game/gameStageTransition",
  "game/restoreGameState", // Server state restoration
];

// Actions that come FROM server (should not be sent back)
const SERVER_ACTIONS = [
  "game/setGameState", // Server state update
  "game/restoreGameState", // State restoration
];

let multiplayerClient: MultiplayerClient | null = null;
let currentRoomId: string | null = null;
let isMultiplayerMode = false;

/**
 * Initialize the WebSocket middleware with a multiplayer client
 */
export function initWebSocketMiddleware(
  client: MultiplayerClient,
  roomId: string
) {
  multiplayerClient = client;
  currentRoomId = roomId;
  isMultiplayerMode = true;
}

/**
 * Disable multiplayer mode (for single-player games)
 */
export function disableMultiplayerMode() {
  isMultiplayerMode = false;
  currentRoomId = null;
}

/**
 * Enable multiplayer mode
 */
export function enableMultiplayerMode() {
  isMultiplayerMode = true;
}

/**
 * Update the current room ID
 */
export function setCurrentRoomId(roomId: string | null) {
  currentRoomId = roomId;
}

/**
 * WebSocket middleware
 */
export const websocketMiddleware: Middleware<
  {},
  RootState,
  AppDispatch
> = store => next => action => {
  // If not in multiplayer mode, pass through normally
  if (!isMultiplayerMode || !wsClient) {
    return next(action);
  }

  const actionType = action.type;

  // Skip local-only actions
  if (LOCAL_ACTIONS.includes(actionType)) {
    return next(action);
  }

  // Skip server actions (prevent loops)
  if (SERVER_ACTIONS.includes(actionType)) {
    return next(action);
  }

  // Only send game actions to server
  if (actionType.startsWith(GAME_ACTION_PREFIX) && currentRoomId) {
    // Send action to server
    if (multiplayerClient?.isConnected()) {
      try {
        multiplayerClient.sendGameAction({
          type: action.type,
          payload: action.payload,
        });
        // In multiplayer mode, don't apply action locally
        // Server will broadcast it back and we'll apply it then
        // This prevents double-application
        return next({ type: "@@websocket/sent", originalAction: action });
      } catch (error) {
        console.error("Error sending action to server:", error);
        // If send fails, apply locally as fallback
        return next(action);
      }
    } else {
      console.warn("WebSocket not connected, action not sent:", actionType);
      // If not connected, apply locally
      return next(action);
    }
  }

  // Always pass action to next middleware/reducer
  return next(action);
};

