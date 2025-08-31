import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getSuiteColor, getSuiteIcon } from "@/utils/suiteUtils";
import { GameConfig, SeriesProgress } from "../../types/game";
import { SeriesProgressBar } from "../ui/series-progress";
import { PlayingCard } from "./PlayingCard";

interface GameInfoProps {
  gameConfig: GameConfig | null;
  isSeries: boolean;
  seriesProgress: SeriesProgress | null;
  playerNames: Record<number, string>;
}

interface InfoItem {
  label: string;
  show: boolean;
  renderContent: () => React.ReactNode;
}

export const GameInfo = ({
  gameConfig,
  isSeries,
  seriesProgress,
  playerNames,
}: GameInfoProps) => {
  // Helper functions for cleaner conditional rendering
  const shouldShowSeriesProgress = () =>
    isSeries && seriesProgress && seriesProgress.totalGames > 1;

  const shouldShowGameConfig = () => gameConfig !== null;

  const shouldShowStartingPlayer = () =>
    isSeries && seriesProgress && seriesProgress.startingPlayerIndex !== null;

  // Unified info items configuration
  const getInfoItems = (): InfoItem[] => {
    const items: InfoItem[] = [];

    // Series Progress (special case - handled separately)
    if (shouldShowSeriesProgress()) {
      items.push({
        label: "",
        show: true,
        renderContent: () => (
          <SeriesProgressBar
            currentGame={seriesProgress!.currentGame}
            totalGames={seriesProgress!.totalGames}
          />
        ),
      });
    }

    // Game Config Items
    if (shouldShowGameConfig() && gameConfig) {
      // Trump Suit
      if (gameConfig.trumpSuite !== null) {
        items.push({
          label: "Trump:",
          show: true,
          renderContent: () => (
            <Badge variant="outline" className="bg-white text-casino-black">
              <span
                className={cn(
                  "text-base",
                  `text-casino-${getSuiteColor(gameConfig.trumpSuite)}`
                )}
              >
                {getSuiteIcon(gameConfig.trumpSuite)}
              </span>
            </Badge>
          ),
        });
      }

      // Teammate
      if (gameConfig.teammateCard) {
        items.push({
          label: "Teammate:",
          show: true,
          renderContent: () => (
            <PlayingCard card={gameConfig.teammateCard} mini />
          ),
        });
      }

      // Bid Amount
      if (gameConfig.bidAmount) {
        items.push({
          label: "Bid:",
          show: true,
          renderContent: () => (
            <Badge className="bg-gold text-casino-black font-bold">
              {gameConfig.bidAmount}
            </Badge>
          ),
        });
      }
    }

    // Starting Player (when no game config)
    if (!shouldShowGameConfig() && shouldShowStartingPlayer()) {
      const startingPlayerName =
        playerNames[seriesProgress!.startingPlayerIndex!];

      items.push({
        label: "Starting Player:",
        show: true,
        renderContent: () => (
          <Badge className="bg-gold text-casino-black font-bold">
            {startingPlayerName}
          </Badge>
        ),
      });
    }

    return items;
  };

  // Unified render function for info items
  const renderInfoItem = (item: InfoItem, index: number) => {
    if (!item.show) return null;

    // Special case for series progress (no label)
    if (!item.label) {
      return (
        <div key={index} className="pb-2 border-b border-border/30">
          {item.renderContent()}
        </div>
      );
    }

    // Standard info item with label
    return (
      <div key={index} className="flex items-center justify-between py-1">
        <span className="text-sm text-muted-foreground font-medium">
          {item.label}
        </span>
        <div className="flex items-center ml-4">{item.renderContent()}</div>
      </div>
    );
  };

  const infoItems = getInfoItems();

  return (
    <div className="bg-secondary border-2 border-border/80 rounded-lg p-3 shadow-lg w-56">
      <h2 className="text-base font-semibold text-foreground mb-2">
        Three of Spades
      </h2>

      <div className="space-y-2">{infoItems.map(renderInfoItem)}</div>
    </div>
  );
};
