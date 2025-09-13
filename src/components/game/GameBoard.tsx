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
      className="min-h-screen bg-gradient-felt relative overflow-hidden"
      role="main"
      aria-label="Three of Spades game board"
    >
      {/* Premium Felt Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-felt-green-dark via-felt-green to-felt-green-light opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.1)_100%)]" />

      {/* Table Border */}
      <div className="absolute inset-8 border-4 border-gold/30 rounded-3xl shadow-glow/10" />

      {/* Game Header */}
      <header className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
        {/* Game Info */}
        <GameInfo
          gameConfig={gameConfig}
          isSeries={isSeries}
          seriesProgress={seriesProgress}
          playerNames={playerState.playerNames}
        />

        {/* Settings */}
        {/* <Button
          variant="secondary"
          size="sm"
          onClick={onSettingsClick}
          className="bg-casino-black/40 hover:bg-casino-black/60 text-gold border border-gold/30 backdrop-blur-sm shadow-elevated"
          aria-label="Open game settings"
        >
          <Settings className="w-4 h-4" aria-hidden="true" />
        </Button> */}
      </header>

      {/* Minimal observer mode indicator */}
      {isObserver && (
        <div className="absolute top-32 right-6 bg-blue-500/40 backdrop-blur-sm border border-blue-400/40 rounded-md px-4 py-2 z-20">
          <div className="text-sm text-blue-300 font-medium">
            👁️{" "}
            {playersDisplayData[viewerIndex]?.name || `Player ${viewerIndex}`}
          </div>
        </div>
      )}

      {/* Team Scores */}
      {/* todo: move this into a new component */}

      <section
        className="absolute top-6 right-6 flex gap-6 z-20"
        aria-label="Game controls and scores"
      >
        {/* Series Scoreboard Toggle */}
        {isSeries && seriesProgress && seriesProgress.totalGames > 1 && (
          <button
            onClick={() => setShowScoreboard(!showScoreboard)}
            className={cn(
              "p-2 rounded-xl",
              "bg-secondary/90 backdrop-blur border border-border/50",
              "text-foreground hover:text-gold",
              "hover:bg-secondary/80 hover:border-gold/30",
              "transition-all duration-200",
              "hover:scale-105",
              "shadow-elevated",
              showScoreboard && "bg-gold/10 border-gold/30 text-gold"
            )}
            title={
              showScoreboard ? "Hide scoreboard" : "Show series scoreboard"
            }
          >
            <BarChart3 className="w-5 h-5" />
          </button>
        )}

        {/* Team Scores */}
        <TeamScoresDisplay
          scores={gameProgress.scores}
          animateScore={animateScore}
          isTeammateRevealed={isTeammateRevealed}
        />
      </section>

      {/* Series Scoreboard - Floating overlay */}
      {showScoreboard && isSeries && seriesProgress && (
        <div className="absolute top-24 right-6 z-30">
          <CollapsibleScoreboard
            seriesProgress={seriesProgress}
            playerNames={playerState.playerNames}
          />
        </div>
      )}

      {/* Main Game Area */}
      <section
        className="relative h-screen flex items-center justify-center"
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
        />

        {/* Player Areas */}
        {getPlayerPositions(viewerIndex).map(
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
              />
            </div>
          )
        )}
      </section>

      {/* NEW: Bidding Controls - positioned in bottom-right during bidding */}
      {gameProgress.stage === GameStages.BIDDING &&
        onBid &&
        onPass &&
        currentBid !== null && (
          <BiddingControls
            currentBid={currentBid as number}
            currentBidder={currentBidder}
            bidTimer={bidTimer}
            canBid={canPlayerBid}
            onBid={onBid}
            onPass={onPass}
            isObserver={isObserver}
          />
        )}
    </main>
  );
};
