import { useAppSelector } from "@/hooks/useAppSelector";
import { GameStages } from "@/store/gameStages";
import {
  selectBiddingStateRaw,
  selectBidTimer,
  selectCollectionWinner,
  selectCurrentBid,
  selectCurrentBidder,
  selectIsCollectingCards,
  selectShowCardsPhase,
} from "@/store/selectors";
import { TableCard } from "@/types/game";
import { BID_TIMER_DURATION, NUM_PLAYERS, TIMINGS } from "@/utils/constants";
import { getPlayerPosition } from "@/utils/positionUtils";
import { useEffect, useMemo, useState } from "react";
import { PlayingCard } from "./PlayingCard";

interface CenterTableProps {
  currentTrick: TableCard[];
  winner?: string;
  trickWinner?: number | null;
  playerNames?: Record<number, string>;
  viewerIndex?: number; // NEW: For dynamic positioning
  gameStage?: string; // NEW: For conditional rendering
}

// Internal BiddingDisplay component - Matching BiddingIntegrationMockup.tsx design
const BiddingDisplay = ({
  currentBid,
  currentBidder,
  bidTimer,
  bidHistory,
  passedPlayers,
  playerNames,
  viewerIndex,
  bidWinner,
}: {
  currentBid: number | null;
  currentBidder: number;
  bidTimer: number;
  bidHistory: Record<number, number>;
  passedPlayers: number[];
  playerNames: Record<number, string>;
  viewerIndex: number;
  bidWinner: number | null;
}) => {
  // Get player names for display
  const getPlayerName = (playerIndex: number, names: Record<number, string>) =>
    names[playerIndex] || `Player ${playerIndex}`;

  // Check if a player has passed (not in bid history)
  const hasPlayerPassed = (playerIndex: number, passed: number[]) =>
    passed.includes(playerIndex);

  // Get player's bid amount
  const getPlayerBid = (playerIndex: number, history: Record<number, number>) =>
    history[playerIndex];

  const getPlayerIndexWithHighestBid = (history: Record<number, number>) => {
    const playerIndices = Object.keys(history).map(Number);
    if (playerIndices.length === 0) {
      return null;
    }

    return playerIndices.reduce((max, playerIndex) => {
      return history[playerIndex] > history[max] ? playerIndex : max;
    }, playerIndices[0]);
  };

  // Create player data map for rendering - memoized to prevent unnecessary re-renders
  const players = useMemo(
    () =>
      Array.from({ length: NUM_PLAYERS }, (_, i) => i).map(playerIndex => ({
        playerIndex,
        hasPassed: hasPlayerPassed(playerIndex, passedPlayers),
        bid: getPlayerBid(playerIndex, bidHistory),
        positionInfo: getPlayerPosition(playerIndex, viewerIndex),
      })),
    [viewerIndex, bidHistory, passedPlayers]
  );

  const highestBidPlayerIndex = getPlayerIndexWithHighestBid(bidHistory);

  // Check if bidding is complete
  const isBiddingComplete = bidWinner !== null;

  return (
    <div className="relative">
      {/* Center Table Circle with Integrated Bidding Info */}
      <div className="w-96 h-96 rounded-full bg-gradient-to-br from-felt-green-light/30 to-felt-green-dark/60 border-4 border-gold/40 flex items-center justify-center shadow-elevated backdrop-blur-sm relative">
        {/* Current Bid Display - Integrated into the circle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isBiddingComplete ? (
            // Show bidding complete message
            <div className="text-center mb-4">
              <div className="text-sm font-medium text-gold/70 uppercase tracking-wider mb-2">
                Bidding Complete!
              </div>
              <div className="text-3xl font-bold text-gold mb-2">
                {getPlayerName(bidWinner, playerNames)} won!
              </div>
              <div className="text-xl text-gold/80 mb-2">
                Final Bid: {currentBid}
              </div>
              <div className="text-sm text-gold/60 animate-pulse">
                Get ready to play!
              </div>
            </div>
          ) : (
            // Original bidding display
            <div className="text-center mb-4">
              <div className="text-sm font-medium text-gold/70 uppercase tracking-wider mb-2">
                Current Bid
              </div>
              <div className="text-5xl font-bold text-gold mb-2">
                {currentBid}
              </div>
              {highestBidPlayerIndex !== null && (
                <div className="text-lg text-gold/80">
                  with {getPlayerName(highestBidPlayerIndex, playerNames)}
                </div>
              )}
              {highestBidPlayerIndex === null && (
                <div className="text-lg text-gold/80">No bids yet</div>
              )}
            </div>
          )}

          {/* Timer Display - Only show when bidding is active */}
          {!isBiddingComplete && (
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-gold/30 flex items-center justify-center bg-casino-black/60 backdrop-blur-sm">
                <div className="text-gold font-bold text-lg">{bidTimer}s</div>
                {/* Animated progress ring */}
                <div
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-gold animate-spin-slow"
                  style={{
                    transform: `rotate(${((BID_TIMER_DURATION - bidTimer) / BID_TIMER_DURATION) * 360}deg)`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Bidding Progress Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gold/40 border-r-gold/20 border-b-gold/10 border-l-gold/30 animate-spin-slow" />
      </div>

      {/* Bid History Timeline - Around the circle using proper positioning logic */}
      <div className="absolute inset-0 rounded-full">
        {players.map(({ playerIndex, hasPassed, bid, positionInfo }) => (
          <div
            key={playerIndex}
            className={positionInfo.biddingDisplayClassName}
          >
            <div
              className={`backdrop-blur-sm border-2 rounded-lg px-3 py-2 text-center transition-all duration-300 ${
                hasPassed
                  ? "border-red-400/60 bg-red-500/20"
                  : "border-gold/40 bg-felt-green-light/15"
              }`}
            >
              <div
                className={`text-sm font-bold ${
                  hasPassed ? "text-red-400" : "text-gold"
                }`}
              >
                {hasPassed ? "Pass" : bid ? "Bid: " + bid : "-"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CenterTable = ({
  currentTrick,
  winner,
  trickWinner = null,
  playerNames = {},
  viewerIndex = 3, // NEW: Default to FIRST_PLAYER_ID
  gameStage,
}: CenterTableProps) => {
  const [showPoints, setShowPoints] = useState(false);

  // Use selectors directly instead of props
  const isCollectingCards = useAppSelector(selectIsCollectingCards);
  const showCardsPhase = useAppSelector(selectShowCardsPhase);
  const collectionWinner = useAppSelector(selectCollectionWinner);

  // NEW: Get bidding state from store
  const biddingState = useAppSelector(selectBiddingStateRaw);
  const currentBid = useAppSelector(selectCurrentBid);
  const currentBidder = useAppSelector(selectCurrentBidder);
  const bidTimer = useAppSelector(selectBidTimer);

  // Check if we're in bidding stage
  const isBidding = gameStage === GameStages.BIDDING;

  // Memoize the card list rendering to prevent jitter
  const renderedCards = useMemo(() => {
    if (currentTrick.length === 0) return null;

    return currentTrick.map(playedCard => {
      if (!playedCard) return null;
      const playerIndex = playedCard.player;
      const isWinningCard = trickWinner === playerIndex;

      const positionInfo = getPlayerPosition(playerIndex, viewerIndex);
      const animationDelay = `${playerIndex * TIMINGS.dealingStaggerMs}ms`;
      const collectionDelay = `${playerIndex * 50}ms`;

      // Determine card styling based on game state
      let cardClassName = `shadow-elevated ${positionInfo.centerTableCardClass}`;

      if (isCollectingCards && collectionWinner !== null) {
        // Collection animation
        const targetTransform = getPlayerPosition(
          collectionWinner as number,
          viewerIndex
        ).collectionTarget;
        cardClassName += ` transform ${targetTransform} scale-75 opacity-0 transition-all duration-1200`;
      } else if (showCardsPhase && isWinningCard) {
        // Highlight winning card during display phase
        cardClassName += ` ring-2 ring-gold/60 shadow-[0_0_20px_rgba(255,215,0,0.4)] scale-105 transition-all duration-200`;
      } else {
        cardClassName += ` hover:scale-105 transition-transform duration-200`;
      }

      return (
        <div
          key={playedCard.id}
          className={positionInfo.centerTableContainer}
          style={{
            animationDelay: isCollectingCards
              ? collectionDelay
              : animationDelay,
          }}
        >
          <PlayingCard card={playedCard} className={cardClassName} />
        </div>
      );
    });
  }, [
    currentTrick,
    trickWinner,
    viewerIndex,
    isCollectingCards,
    collectionWinner,
    showCardsPhase,
  ]);

  useEffect(() => {
    if (isCollectingCards && collectionWinner !== null) {
      // Show points indicator after animation starts
      const timer = setTimeout(
        () => setShowPoints(true),
        TIMINGS.collectionAnimationMs
      );
      return () => clearTimeout(timer);
    } else {
      setShowPoints(false);
    }
  }, [isCollectingCards, collectionWinner]);

  // If in bidding stage, show bidding display
  if (isBidding) {
    return (
      <BiddingDisplay
        currentBid={currentBid}
        currentBidder={currentBidder}
        bidTimer={bidTimer}
        bidHistory={biddingState.bidHistory}
        passedPlayers={biddingState.passedPlayers}
        playerNames={playerNames}
        viewerIndex={viewerIndex}
        bidWinner={biddingState.bidWinner}
      />
    );
  }

  // Calculate points from current trick
  const trickPoints = currentTrick.reduce((sum, card) => sum + card.points, 0);

  return (
    <div className="relative">
      {/* Winner Announcement */}
      {(winner || (showCardsPhase && trickWinner !== null)) && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 text-center w-72">
          <div className="text-s text-gold/70 font-medium">
            {winner || playerNames[trickWinner as number] + " won the trick!"}
          </div>
        </div>
      )}

      {/* Points Indicator during collection */}
      {showPoints && collectionWinner !== null && trickPoints > 0 && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-xl font-bold text-gold animate-fade-in">
            +{trickPoints} points
          </div>
        </div>
      )}

      {/* Playing Area Circle */}
      <div
        className="w-80 h-80 rounded-full bg-gradient-to-br from-felt-green-light/30 to-felt-green-dark/60 border-4 border-gold/40 flex items-center justify-center shadow-elevated backdrop-blur-sm"
        role="region"
        aria-label={`Current trick: ${currentTrick.length} of 4 cards played`}
        aria-live="polite"
      >
        {/* Current Trick Cards - Positioned by Player */}
        <div className="relative w-full h-full">
          {/* Diamond Pattern Card Display */}
          {renderedCards}
        </div>
      </div>
    </div>
  );
};
