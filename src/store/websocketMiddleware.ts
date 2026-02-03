/**
 * WebSocket middleware for Redux
 * Intercepts game actions and sends them to the multiplayer server
 */

import type { MultiplayerClient } from "@/utils/multiplayer";
import { Middleware } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "./index";

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
  "game/playerSetup", // Local initialization - each client sets up independently
  "game/startGame", // Local initialization - triggered by game:started event
  "game/setGameMode", // Local initialization - set by each client when game starts
  "game/setPlayerName", // Local initialization - set by each client when game starts
  "game/setStage", // Local stage transitions - handled by saga, not synced to server
  // Bot actions - bots run locally on each client, but their game actions (placeBid, passBid, playCard) should be synced
  // The bot trigger actions (botShould*) are local, but the actual game actions they produce should go to server
];

// Actions that come FROM server (should not be sent back)
const SERVER_ACTIONS = [
  "game/setGameState", // Server state update
  "game/restoreGameState", // State restoration
];

let multiplayerClient: MultiplayerClient | null = null;
let currentRoomId: string | null = null;
let isMultiplayerMode = false;
let localSocketId: string | null = null;

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
  localSocketId = client.getSocketId?.() || null;
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
  if (!isMultiplayerMode || !multiplayerClient) {
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
    // Check if this is a bot action (actions with playerIndex that's not FIRST_PLAYER_ID)
    // Bot actions should be applied locally immediately AND sent to server
    const payload = action.payload as any;
    const isBotAction = payload?.playerIndex !== undefined && 
                        payload.playerIndex !== 3; // FIRST_PLAYER_ID is 3
    
    // Send action to server
    if (multiplayerClient?.isConnected()) {
      try {
        multiplayerClient.sendGameAction({
          type: action.type,
          payload: action.payload,
        });
        
        // For bot actions, apply locally immediately so the UI updates right away
        // The server will broadcast it back, but we'll skip re-applying it
        if (isBotAction) {
          // Apply locally immediately for bot actions, then return the sent action
          const result = next(action);
          next({ type: "@@websocket/sent", originalAction: action });
          return result;
        } else {
          // For human player actions, wait for server broadcast to prevent double-application
          return next({ type: "@@websocket/sent", originalAction: action });
        }
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

