import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getSuiteColor, getSuiteIcon } from "@/utils/suiteUtils";
import { GameConfig, SeriesProgress } from "../../types/game";
import { SeriesProgressBar } from "../ui/series-progress";

interface GameInfoProps {
  gameConfig: GameConfig | null;
  isSeries: boolean;
  seriesProgress: SeriesProgress | null;
  playerNames: Record<number, string>;
  /** Mobile-responsive: use compact layout */
  compact?: boolean;
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
  compact = false,
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
          label: compact ? "T:" : "Trump:",
          show: true,
          renderContent: () => (
            <Badge variant="outline" className={cn("bg-white text-casino-black", compact && "text-[9px] px-1 py-0")}>
              <span
                className={cn(
                  compact ? "text-xs" : "text-base",
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
          label: compact ? "Ally:" : "Teammate:",
          show: true,
          renderContent: () => (
            <Badge className={cn("bg-white text-casino-black", compact && "text-[9px] px-1 py-0")}>
              {gameConfig.teammateCard.id}{" "}
              {getSuiteIcon(gameConfig.teammateCard.suite)}
            </Badge>
          ),
        });
      }

      // Bid Amount
      if (gameConfig.bidAmount) {
        items.push({
          label: compact ? "B:" : "Bid:",
          show: true,
          renderContent: () => (
            <Badge className={cn("bg-gold text-casino-black font-bold", compact && "text-[9px] px-1 py-0")}>
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
        label: compact ? "Start:" : "Starting Player:",
        show: true,
        renderContent: () => (
          <Badge className={cn("bg-gold text-casino-black font-bold", compact && "text-[9px] px-1 py-0")}>
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
        <div key={index} className={cn("border-b border-border/30", compact ? "pb-1" : "pb-2")}>
          {item.renderContent()}
        </div>
      );
    }

    // Standard info item with label
    return (
      <div key={index} className="flex items-center justify-between py-0.5">
        <span className={cn("text-muted-foreground font-medium", compact ? "text-[9px]" : "text-sm")}>
          {item.label}
        </span>
        <div className={cn("flex items-center", compact ? "ml-1" : "ml-4")}>{item.renderContent()}</div>
      </div>
    );
  };

  const infoItems = getInfoItems();

  return (
    <div className={cn(
      "bg-secondary border-2 border-border/80 rounded-lg shadow-lg",
      compact ? "p-1.5 w-auto min-w-[100px] max-w-[140px]" : "p-3 w-56"
    )}>
      {!compact && (
        <h2 className="text-base font-semibold text-foreground mb-2">
          Three of Spades
        </h2>
      )}

      <div className={cn("space-y-1", compact && "space-y-0.5")}>{infoItems.map(renderInfoItem)}</div>
    </div>
  );
};
