import { useMobileLayout } from "@/hooks/use-mobile";
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
  /** Mobile-responsive: use compact sizing */
  compact?: boolean;
  /** Is portrait orientation */
  isPortrait?: boolean;
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
  compact = false,
  isLandscape = false,
  isPortrait = false,
}: {
  currentBid: number | null;
  currentBidder: number;
  bidTimer: number;
  bidHistory: Record<number, number>;
  passedPlayers: number[];
  playerNames: Record<number, string>;
  viewerIndex: number;
  bidWinner: number | null;
  compact?: boolean;
  isLandscape?: boolean;
  isPortrait?: boolean;
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
        positionInfo: getPlayerPosition(playerIndex, viewerIndex, compact, isPortrait),
      })),
    [viewerIndex, bidHistory, passedPlayers, compact, isPortrait]
  );

  const highestBidPlayerIndex = getPlayerIndexWithHighestBid(bidHistory);

  // Check if bidding is complete
  const isBiddingComplete = bidWinner !== null;

  // Responsive circle size: landscape gets smaller circle
  const circleSize = isLandscape ? "w-32 h-32" : compact ? "w-44 h-44" : "w-96 h-96";
  const timerSize = isLandscape ? "w-8 h-8" : compact ? "w-10 h-10" : "w-16 h-16";

  return (
    <div className="relative">
      {/* Center Table Circle with Integrated Bidding Info */}
      <div className={`${circleSize} rounded-full bg-gradient-to-br from-felt-green-light/30 to-felt-green-dark/60 border-4 border-gold/40 flex items-center justify-center shadow-elevated backdrop-blur-sm relative`}>
        {/* Current Bid Display - Integrated into the circle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isBiddingComplete ? (
            // Show bidding complete message
            <div className="text-center mb-0.5">
              <div className={`font-medium text-gold/70 uppercase tracking-wider ${isLandscape ? "text-[7px] mb-0" : compact ? "text-[8px] mb-0.5" : "text-sm mb-2"}`}>
                Bidding Complete!
              </div>
              <div className={`font-bold text-gold ${isLandscape ? "text-xs mb-0" : compact ? "text-sm mb-0.5" : "text-3xl mb-2"}`}>
                {getPlayerName(bidWinner, playerNames)} sets trump!
              </div>
              <div className={`text-gold/80 ${isLandscape ? "text-[9px]" : compact ? "text-xs mb-0.5" : "text-xl mb-2"}`}>
                Final Bid: {currentBid}
              </div>
              {!isLandscape && (
                <div className={`text-gold/60 ${compact ? "text-[8px]" : "text-sm"}`}>
                  Get ready to play!
                </div>
              )}
            </div>
          ) : (
            // Original bidding display
            <div className="text-center mb-0.5">
              <div className={`font-medium text-gold/70 uppercase tracking-wider ${isLandscape ? "text-[7px] mb-0" : compact ? "text-[8px] mb-0.5" : "text-sm mb-2"}`}>
                Current Bid
              </div>
              <div className={`font-bold text-gold ${isLandscape ? "text-xl mb-0" : compact ? "text-2xl mb-0.5" : "text-5xl mb-2"}`}>
                {currentBid}
              </div>
              {highestBidPlayerIndex !== null && (
                <div className={`text-gold/80 ${isLandscape ? "text-[8px]" : compact ? "text-[9px]" : "text-lg"}`}>
                  with {getPlayerName(highestBidPlayerIndex, playerNames)}
                </div>
              )}
              {highestBidPlayerIndex === null && (
                <div className={`text-gold/80 ${isLandscape ? "text-[8px]" : compact ? "text-[9px]" : "text-lg"}`}>No bids yet</div>
              )}
            </div>
          )}

          {/* Timer Display - Only show when bidding is active */}
          {!isBiddingComplete && (
            <div className="relative">
              <div className={`${timerSize} rounded-full border-4 border-gold/30 flex items-center justify-center bg-casino-black/60 backdrop-blur-sm`}>
                <div className={`text-gold font-bold ${isLandscape ? "text-[9px]" : compact ? "text-xs" : "text-lg"}`}>{bidTimer}s</div>
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

        {/* Bidding Progress Ring - Hidden when bidding is complete */}
        {!isBiddingComplete && (
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gold/40 border-r-gold/20 border-b-gold/10 border-l-gold/30 animate-spin-slow" />
        )}
      </div>

      {/* Bid History Timeline - Around the circle using proper positioning logic - Hidden when bidding is complete */}
      {!isBiddingComplete && (
        <div className="absolute inset-0 rounded-full">
          {players.map(({ playerIndex, hasPassed, bid, positionInfo }) => (
            <div
              key={playerIndex}
              className={positionInfo.biddingDisplayClassName}
            >
              <div
                className={`backdrop-blur-sm border-2 rounded-lg text-center transition-all duration-300 ${
                  isLandscape ? "px-1 py-0.5" : compact ? "px-1.5 py-1" : "px-3 py-2"
                } ${
                  hasPassed
                    ? "border-red-400/60 bg-red-500/20"
                    : "border-gold/40 bg-felt-green-light/15"
                }`}
              >
                <div
                  className={`font-bold ${isLandscape ? "text-[8px]" : compact ? "text-[9px]" : "text-sm"} ${
                    hasPassed ? "text-red-400" : "text-gold"
                  }`}
                >
                  {hasPassed ? "Pass" : bid ? "Bid: " + bid : "-"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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
  compact = false,
  isPortrait = false,
}: CenterTableProps) => {
  const [showPoints, setShowPoints] = useState(false);
  const { isPhoneLandscape } = useMobileLayout();

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

  // Responsive circle size: landscape gets smaller to fit 390px height
  const circleSize = isPhoneLandscape ? "w-28 h-28" : compact ? "w-36 h-36" : "w-80 h-80";

  // Memoize the card list rendering to prevent jitter
  const renderedCards = useMemo(() => {
    if (currentTrick.length === 0) return null;

    return currentTrick.map(playedCard => {
      if (!playedCard) return null;
      const playerIndex = playedCard.player;
      const isWinningCard = trickWinner === playerIndex;

      const positionInfo = getPlayerPosition(playerIndex, viewerIndex, compact, isPortrait);
      const animationDelay = `${playerIndex * TIMINGS.dealingStaggerMs}ms`;
      const collectionDelay = `${playerIndex * 50}ms`;

      // Determine card styling based on game state
      let cardClassName = `shadow-elevated ${positionInfo.centerTableCardClass}`;

      if (isCollectingCards && collectionWinner !== null) {
        // Collection animation
        const targetTransform = getPlayerPosition(
          collectionWinner as number,
          viewerIndex,
          compact,
          isPortrait
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
          key={playedCard.hash}
          className={positionInfo.centerTableContainer}
          style={{
            animationDelay: isCollectingCards
              ? collectionDelay
              : animationDelay,
          }}
        >
          <PlayingCard card={playedCard} compact={compact} className={cardClassName} />
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
    compact,
    isPortrait,
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
        compact={compact}
        isLandscape={isPhoneLandscape}
        isPortrait={isPortrait}
      />
    );
  }

  // Calculate points from current trick
  const trickPoints = currentTrick.reduce((sum, card) => sum + card.points, 0);

  return (
    <div className="relative">
      {/* Winner Announcement */}
      {(winner || (showCardsPhase && trickWinner !== null)) && (
        <div className={`absolute left-1/2 transform -translate-x-1/2 text-center ${
          isPhoneLandscape ? "-top-6 w-40" : compact ? "-top-8 w-48" : "-top-16 w-72"
        }`}>
          <div className={`text-gold/70 font-medium ${
            isPhoneLandscape ? "text-[9px]" : compact ? "text-[10px]" : "text-s"
          }`}>
            {winner || playerNames[trickWinner as number] + " won the trick!"}
          </div>
        </div>
      )}

      {/* Points Indicator during collection */}
      {showPoints && collectionWinner !== null && trickPoints > 0 && (
        <div className={`absolute left-1/2 transform -translate-x-1/2 text-center ${
          isPhoneLandscape ? "-top-4" : compact ? "-top-5" : "-top-8"
        }`}>
          <div className={`font-bold text-gold animate-fade-in ${
            isPhoneLandscape ? "text-xs" : compact ? "text-sm" : "text-xl"
          }`}>
            +{trickPoints} points
          </div>
        </div>
      )}

      {/* Playing Area Circle */}
      <div
        className={`${circleSize} rounded-full bg-gradient-to-br from-felt-green-light/30 to-felt-green-dark/60 border-4 border-gold/40 flex items-center justify-center shadow-elevated backdrop-blur-sm`}
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
