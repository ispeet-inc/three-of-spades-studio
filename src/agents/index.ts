import BotAgent from "./BotAgent";
import GreedyBot from "./GreedyBot";
import RandomBot from "./RandomBot";

export { agentManager } from "./agentManager";
export {
  agentClasses as agentClassesFromRegistry,
  agentRegistry,
  getAgentType,
} from "./agentRegistry";

export { BotAgent, GreedyBot, RandomBot };
