import BotAgent from "./BotAgent";
import GreedyBot from "./GreedyBot";
import RandomBot from "./RandomBot";

export const agentClasses: (typeof BotAgent)[] = [GreedyBot];

export { BotAgent, GreedyBot, RandomBot };
