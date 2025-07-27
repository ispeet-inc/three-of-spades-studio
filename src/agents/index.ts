import RandomBot from "./RandomBot";
import GreedyBot from "./GreedyBot";
import BotAgent from "./BotAgent";

export const agentClasses: (typeof BotAgent)[] = [RandomBot, GreedyBot];

export { BotAgent, RandomBot, GreedyBot };