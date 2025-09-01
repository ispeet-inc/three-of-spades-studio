import BotAgent from "./BotAgent";
import GreedyBot from "./GreedyBot";

// Registry mapping agent type strings to their classes
export const agentRegistry: Record<string, new () => BotAgent> = {
  GreedyBot: GreedyBot,
  // RandomBot: RandomBot,
};

// Get all available agent classes for random selection
export const agentClasses = Object.values(agentRegistry);

// Get agent type string from class
export const getAgentType = (agentClass: new () => BotAgent): string => {
  const entry = Object.entries(agentRegistry).find(
    ([, cls]) => cls === agentClass
  );
  return entry ? entry[0] : "GreedyBot"; // fallback
};
