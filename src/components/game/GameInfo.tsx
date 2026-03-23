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
  /** Landscape phone mode - ultra compact inline */
  isLandscape?: boolean;
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
  isLandscape = false,
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
        const badgeSize = isLandscape ? "text-[8px] px-0.5 py-0" : compact ? "text-[9px] px-1 py-0" : "";
        items.push({
          label: isLandscape ? "T" : compact ? "T:" : "Trump:",
          show: true,
          renderContent: () => (
            <Badge variant="outline" className={cn("bg-white text-casino-black", badgeSize)}>
              <span
                className={cn(
                  isLandscape ? "text-[9px]" : compact ? "text-xs" : "text-base",
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
        const badgeSize = isLandscape ? "text-[8px] px-0.5 py-0" : compact ? "text-[9px] px-1 py-0" : "";
        items.push({
          label: isLandscape ? "A" : compact ? "Ally:" : "Teammate:",
          show: true,
          renderContent: () => (
            <Badge className={cn("bg-white text-casino-black", badgeSize)}>
              {gameConfig.teammateCard.id}{" "}
              {getSuiteIcon(gameConfig.teammateCard.suite)}
            </Badge>
          ),
        });
      }

      // Bid Amount
      if (gameConfig.bidAmount) {
        const badgeSize = isLandscape ? "text-[8px] px-0.5 py-0" : compact ? "text-[9px] px-1 py-0" : "";
        items.push({
          label: isLandscape ? "B" : compact ? "B:" : "Bid:",
          show: true,
          renderContent: () => (
            <Badge className={cn("bg-gold text-casino-black font-bold", badgeSize)}>
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
      const badgeSize = isLandscape ? "text-[8px] px-0.5 py-0" : compact ? "text-[9px] px-1 py-0" : "";

      items.push({
        label: isLandscape ? "1st" : compact ? "Start:" : "Starting Player:",
        show: true,
        renderContent: () => (
          <Badge className={cn("bg-gold text-casino-black font-bold", badgeSize)}>
            {startingPlayerName}
          </Badge>
        ),
      });
    }

    return items;
  };

  const infoItems = getInfoItems();

  // Landscape: inline horizontal bar
  if (isLandscape) {
    return (
      <div className="bg-secondary/80 backdrop-blur-sm border border-border/60 rounded-md px-1.5 py-0.5 shadow-lg flex items-center gap-1.5">
        {infoItems.map((item, index) => {
          if (!item.show) return null;
          if (!item.label) {
            return <div key={index} className="flex items-center">{item.renderContent()}</div>;
          }
          return (
            <div key={index} className="flex items-center gap-0.5">
              <span className="text-muted-foreground font-medium text-[7px]">{item.label}</span>
              {item.renderContent()}
            </div>
          );
        })}
      </div>
    );
  }

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
