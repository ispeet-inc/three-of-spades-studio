import { useMobileLayout } from "@/hooks/use-mobile";
import { useAppSelector } from "@/hooks/useAppSelector";
import { cn } from "@/lib/utils";
import { GameStages } from "@/store/gameStages";
import {
  selectBidTimer,
  selectCanPlayerBid,
  selectCurrentBid,
  selectCurrentBidder,
  selectIsSeries,
  selectIsTeammateRevealed,
  selectSeriesProgress,
} from "@/store/selectors";
import {
  Card,
  GameConfig,
  GameProgress,
  PlayerDisplayData,
  PlayerState,
  TableState,
  TeamScores,
} from "@/types/game";
import {
  announceToScreenReader,
  gameStateAnnouncements,
} from "@/utils/accessibility";
import { FIRST_PLAYER_ID } from "@/utils/constants";
import { getPlayerPositions } from "@/utils/positionUtils";
import { BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { CollapsibleScoreboard } from "../ui/collapsible-scoreboard";
import { BiddingControls } from "./BiddingControls";
import { CenterTable } from "./CenterTable";
import { GameInfo } from "./GameInfo";
import { PlayerArea } from "./PlayerArea";
import { TeamScoresDisplay } from "./TeamScoresDisplay";

interface GameBoardProps {
  playersDisplayData: PlayerDisplayData[];
  tableState: TableState;
  playerState: PlayerState;
  gameConfig: GameConfig | null;
  gameProgress: GameProgress;
  onCardPlay: (card: Card) => void;
  onSettingsClick: () => void;
  isDealing?: boolean;
  botCardsHidden?: boolean;
  isObserver?: boolean;
  viewerIndex?: number;
  // NEW: Add bidding handlers
  onBid?: (amount: number) => void;
  onPass?: () => void;
}

export const GameBoard = ({
  playersDisplayData,
  tableState,
  playerState,
  gameConfig,
  gameProgress,
  onCardPlay,
  onSettingsClick,
  isDealing = false,
  botCardsHidden = false,
  isObserver = false,
  viewerIndex = 3,
  onBid,
  onPass,
}: GameBoardProps) => {
  const [lastScores, setLastScores] = useState<TeamScores>(
    gameProgress.scores ?? { team1: 0, team2: 0 }
  );
  const [animateScore, setAnimateScore] = useState<
    Record<keyof TeamScores, boolean>
  >({
    team1: false,
    team2: false,
  });
  const [showScoreboard, setShowScoreboard] = useState(false);

  // Mobile layout detection
  const { isMobile, isPhoneLandscape, isPhonePortrait } = useMobileLayout();
  const compact = isMobile;

  // NEW: Get bidding state from store
  const currentBid = useAppSelector(selectCurrentBid);
  const currentBidder = useAppSelector(selectCurrentBidder);
  const bidTimer = useAppSelector(selectBidTimer);
  const canPlayerBid = useAppSelector(selectCanPlayerBid);
  const seriesProgress = useAppSelector(selectSeriesProgress);
  const isSeries = useAppSelector(selectIsSeries);
  const isTeammateRevealed = useAppSelector(selectIsTeammateRevealed);

  // Score animation effect
  useEffect(() => {
    if (lastScores.team1 !== gameProgress.scores.team1) {
      setAnimateScore(prev => ({ ...prev, team1: true }));
      announceToScreenReader(
        `Team 1 scores updated: ${gameProgress.scores.team1} points`
      );
      setTimeout(
        () => setAnimateScore(prev => ({ ...prev, team1: false })),
        500
      );
    }
    if (lastScores.team2 !== gameProgress.scores.team2) {
      setAnimateScore(prev => ({ ...prev, team2: true }));
      announceToScreenReader(
        `Team 2 scores updated: ${gameProgress.scores.team2} points`
      );
      setTimeout(
        () => setAnimateScore(prev => ({ ...prev, team2: false })),
        500
      );
    }
    setLastScores(gameProgress.scores);
  }, [gameProgress.scores, lastScores]);

  // Announce current player turn
  useEffect(() => {
    const currentPlayer = playersDisplayData.find(p => p.isCurrentPlayer);
    if (currentPlayer) {
      if (currentPlayer.id === `player-${FIRST_PLAYER_ID}`) {
        announceToScreenReader(gameStateAnnouncements.yourTurn);
      } else {
        announceToScreenReader(
          gameStateAnnouncements.botTurn(currentPlayer.name)
        );
      }
    }
  }, [playersDisplayData]);

  return (
    <main
      className={cn(
        "min-h-screen bg-gradient-felt relative overflow-hidden game-no-select",
        compact && "safe-area-inset"
      )}
      role="main"
      aria-label="Three of Spades game board"
    >
      {/* Premium Felt Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-felt-green-dark via-felt-green to-felt-green-light opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.1)_100%)]" />

      {/* Table Border - hidden on mobile to save space */}
      {!compact && (
        <div className="absolute inset-8 border-4 border-gold/30 rounded-3xl shadow-glow/10" />
      )}

      {/* Game Header - z-30 to stay above player areas */}
      <header className={cn(
        "absolute left-0 right-0 flex justify-between items-start z-30",
        isPhoneLandscape ? "top-0.5 px-1" : compact ? "top-1 px-2" : "top-6 left-6 right-6"
      )}>
          {/* Game Info */}
          <GameInfo
            gameConfig={gameConfig}
            isSeries={isSeries}
            seriesProgress={seriesProgress}
            playerNames={playerState.playerNames}
            compact={compact}
            isLandscape={isPhoneLandscape}
          />
        </header>

      {/* Minimal observer mode indicator */}
      {isObserver && (
        <div className={cn(
          "absolute bg-blue-500/40 backdrop-blur-sm border border-blue-400/40 rounded-md z-30",
          isPhoneLandscape ? "top-8 right-1 px-1.5 py-0.5" : compact ? "top-10 right-2 px-2 py-1" : "top-32 right-6 px-4 py-2"
        )}>
          <div className={cn("text-blue-300 font-medium", isPhoneLandscape ? "text-[8px]" : compact ? "text-[10px]" : "text-sm")}>
            👁️{" "}
            {playersDisplayData[viewerIndex]?.name || `Player ${viewerIndex}`}
          </div>
        </div>
      )}

      {/* Team Scores - z-30 to stay above player areas */}
      <section
        className={cn(
          "absolute flex z-30",
          isPhoneLandscape ? "top-0.5 right-1 gap-1" : compact ? "top-1 right-2 gap-1.5" : "top-6 right-6 gap-6"
        )}
        aria-label="Game controls and scores"
      >
        {/* Series Scoreboard Toggle */}
        {isSeries && seriesProgress && seriesProgress.totalGames > 1 && (
          <button
            onClick={() => setShowScoreboard(!showScoreboard)}
            className={cn(
              "rounded-xl",
              "bg-secondary/90 backdrop-blur border border-border/50",
              "text-foreground hover:text-gold",
              "hover:bg-secondary/80 hover:border-gold/30",
              "transition-all duration-200",
              "hover:scale-105",
              "shadow-elevated",
              isPhoneLandscape ? "p-0.5" : compact ? "p-1" : "p-2",
              showScoreboard && "bg-gold/10 border-gold/30 text-gold"
            )}
            title={
              showScoreboard ? "Hide scoreboard" : "Show series scoreboard"
            }
          >
            <BarChart3 className={isPhoneLandscape ? "w-3 h-3" : compact ? "w-3.5 h-3.5" : "w-5 h-5"} />
          </button>
        )}

        {/* Team Scores */}
        <TeamScoresDisplay
          scores={gameProgress.scores}
          animateScore={animateScore}
          isTeammateRevealed={isTeammateRevealed}
          compact={compact}
          isLandscape={isPhoneLandscape}
        />
      </section>

      {/* Series Scoreboard - Floating overlay */}
      {showScoreboard && isSeries && seriesProgress && (
        <div className={cn(
          "absolute z-40",
          isPhoneLandscape ? "top-7 right-1" : compact ? "top-10 right-2" : "top-24 right-6"
        )}>
          <CollapsibleScoreboard
            seriesProgress={seriesProgress}
            playerNames={playerState.playerNames}
          />
        </div>
      )}

      {/* Main Game Area */}
      <section
        className={cn(
          "relative h-screen flex items-center justify-center",
          // In landscape, shift center area slightly upward to make room for cards at bottom
          isPhoneLandscape && "-mt-6"
        )}
        aria-label="Game playing area"
      >
        {/* Center Table Area */}
        <CenterTable
          currentTrick={tableState.tableCards}
          winner={
            tableState.trickWinner !== null
              ? playersDisplayData[tableState.trickWinner.player]?.name
              : undefined
          }
          trickWinner={tableState.trickWinner?.player ?? null}
          playerNames={playerState.playerNames}
          viewerIndex={viewerIndex}
          gameStage={gameProgress.stage}
          compact={compact}
          isPortrait={isPhonePortrait}
        />

        {/* Player Areas */}
        {getPlayerPositions(viewerIndex, compact, isPhonePortrait).map(
          ({ playerIndex, position, playerAreaClassName }) => (
            <div key={position} className={playerAreaClassName}>
              <PlayerArea
                player={playersDisplayData[playerIndex]}
                runningSuite={tableState.runningSuite}
                position={position}
                onCardPlay={onCardPlay}
                isDealing={isDealing}
                botCardsHidden={botCardsHidden}
                isObserver={isObserver}
                viewerIndex={viewerIndex}
                isTeammateRevealed={isTeammateRevealed}
                compact={compact}
                isLandscape={isPhoneLandscape}
              />
            </div>
          )
        )}
      </section>

      {/* NEW: Bidding Controls - positioned in bottom-center on mobile, bottom-right on desktop */}
      {gameProgress.stage === GameStages.BIDDING &&
        onBid &&
        onPass &&
        currentBid !== null && (
          <BiddingControls
            currentBid={currentBid as number}
            canBid={canPlayerBid}
            onBid={onBid}
            onPass={onPass}
            isObserver={isObserver}
            compact={compact}
          />
        )}
    </main>
  );
};
