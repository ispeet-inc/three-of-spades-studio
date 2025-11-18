/**
 * Game state manager for multiplayer rooms
 * Tracks basic game state for validation purposes
 */

export class GameStateManager {
  constructor() {
    this.gameStates = new Map(); // roomId -> basic game state info
    this.gameActions = new Map(); // roomId -> array of actions (for history)
  }

  /**
   * Initialize game state for a room
   */
  initializeGameState(roomId, initialState) {
    this.gameStates.set(roomId, {
      stage: initialState?.gameProgress?.stage || "INIT",
      currentTurn: initialState?.tableState?.turn || 0,
      gameStarted: false,
      lastActionTime: Date.now(),
    });
    this.gameActions.set(roomId, []);
    return this.gameStates.get(roomId);
  }

  /**
   * Get game state for a room
   */
  getGameState(roomId) {
    return this.gameStates.get(roomId);
  }

  /**
   * Set game state directly (for state restoration)
   */
  setGameState(roomId, state) {
    this.gameStates.set(roomId, {
      stage: state?.gameProgress?.stage || "INIT",
      currentTurn: state?.tableState?.turn || 0,
      gameStarted: state?.gameProgress?.stage !== "INIT",
      lastActionTime: Date.now(),
    });
  }

  /**
   * Clear game state for a room
   */
  clearGameState(roomId) {
    this.gameStates.delete(roomId);
    this.gameActions.delete(roomId);
  }

  /**
   * Record an action for history
   */
  recordAction(roomId, action) {
    if (!this.gameActions.has(roomId)) {
      this.gameActions.set(roomId, []);
    }
    const actions = this.gameActions.get(roomId);
    actions.push({
      type: action.type,
      timestamp: Date.now(),
    });
    // Keep only last 100 actions
    if (actions.length > 100) {
      actions.shift();
    }
  }

  /**
   * Validate an action before applying
   */
  validateAction(roomId, action, currentState) {
    // Basic validation
    if (!action || !action.type) {
      return { valid: false, error: "Invalid action format" };
    }

    // If no state exists, allow initialization actions
    if (!currentState) {
      if (action.type.startsWith("game/playerSetup") || 
          action.type.startsWith("game/gameInitialize") ||
          action.type.startsWith("game/setGameMode")) {
        return { valid: true };
      }
      return { valid: false, error: "No game state for room" };
    }

    // Basic action type validation
    const actionType = action.type;
    
    // Allow certain actions regardless of state
    const alwaysAllowed = [
      "game/setStage",
      "game/setGameError",
      "game/clearGameError",
      "game/showWhitewashAnimation",
      "game/hideWhitewashAnimation",
      "game/startDealingAnimation",
      "game/stopDealingAnimation",
    ];

    if (alwaysAllowed.some(allowed => actionType.startsWith(allowed))) {
      return { valid: true };
    }

    // For now, allow all actions - more specific validation can be added later
    // This is a basic implementation; Phase 4 focuses on infrastructure
    return { valid: true };
  }
}

// Singleton instance
export const gameStateManager = new GameStateManager();

