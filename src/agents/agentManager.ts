import BotAgent from "./BotAgent";
import { agentRegistry } from "./agentRegistry";

/**
 * Singleton manager for bot agent instances.
 * Maintains agent instances outside of Redux state to avoid serialization issues.
 * Agents are created once per player and reused throughout the game.
 */
class AgentManager {
  private static instance: AgentManager;
  private agents: Map<string, BotAgent> = new Map();

  private constructor() {}

  static getInstance(): AgentManager {
    if (!AgentManager.instance) {
      AgentManager.instance = new AgentManager();
    }
    return AgentManager.instance;
  }

  /**
   * Get or create an agent instance for a specific player and agent type.
   * @param playerId - The player ID (0-3)
   * @param agentType - The agent type string (e.g., "GreedyBot", "RandomBot")
   * @returns The agent instance
   */
  getAgent(playerId: number, agentType: string): BotAgent {
    const key = `${playerId}-${agentType}`;

    if (!this.agents.has(key)) {
      const AgentClass = agentRegistry[agentType];
      if (!AgentClass) {
        console.warn(
          `Unknown agent type: ${agentType}, falling back to GreedyBot`
        );
        this.agents.set(key, new agentRegistry.GreedyBot());
      } else {
        this.agents.set(key, new AgentClass());
      }
    }

    const agent = this.agents.get(key);
    if (!agent) {
      throw new Error(`Failed to get agent for key: ${key}`);
    }
    return agent;
  }

  /**
   * Clear all agent instances. Useful for cleanup or when starting a new game.
   */
  clearAgents(): void {
    this.agents.clear();
  }

  /**
   * Clear agent instances for specific players. Useful when players change.
   * @param playerIds - Array of player IDs to clear
   */
  clearAgentsForPlayers(playerIds: number[]): void {
    const keysToDelete: string[] = [];

    for (const key of Array.from(this.agents.keys())) {
      const playerId = parseInt(key.split("-")[0]);
      if (playerIds.includes(playerId)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.agents.delete(key));
  }

  /**
   * Get the number of active agent instances (for debugging).
   */
  getAgentCount(): number {
    return this.agents.size;
  }
}

// Export singleton instance
export const agentManager = AgentManager.getInstance();
export default agentManager;
