import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  startNewRound,
  setBidAndTrump,
  setStage,
  placeBid,
  passBid,
  updateBidTimer,
} from "../store/gameSlice";
import { GameStages } from "../store/gameStages";
import CardUI from "../pure_components/CardUI";
import "../css/GameContent.css";
import PlayerHandUI from "../pure_components/PlayerHandUI";
import GameSummary from "../pure_components/GameSummary";
import GameHeader from "../pure_components/GameHeader";
import RoundSummary from "../pure_components/RoundSummary";
import TrumpSelectionModal from "../pure_components/TrumpSelectionModal";
import BiddingModal from "../pure_components/BiddingModal";
import { getTeammateOptions } from "../utils/gameUtils";
import BidResultModal from "../pure_components/BidResultModal";
import Scoreboard from "../foundational_components/Scoreboard";

function GameContent({
  round,
  tableCards,
  roundWinner,
  players,
  turn,
  scores,
  playCard,
  runningSuite,
  trumpSuite,
  playerNames,
  botCardsHidden,
  onToggleBotCardsHidden,
}) {
  const stage = useSelector((state) => state.game.stage);
  // todo unify players and playerStates
  const playerStates = useSelector((state) => state.game.players);
  const playerAgents = useSelector((state) => state.game.playerAgents);
  const bidAmount = useSelector((state) => state.game.bidAmount);
  const bidder = useSelector((state) => state.game.bidder);
  const biddingState = useSelector((state) => state.game.biddingState);
  const teammateCard = useSelector((state) => state.game.teammateCard);
  const teams = useSelector((state) => state.game.teams);
  const teamColors = useSelector((state) => state.game.teamColors);
  const dispatch = useDispatch();
  const botHandledRef = useRef(false);
  const botActionTimeout = useRef(null);
  const botBiddingInProgress = useRef(false);

  // Debug logging
  console.log("GameContent: stage =", stage);
  console.log("GameContent: biddingState =", biddingState);

  // --- Stage transition and bidding timer useEffects have been removed (handled by sagas) ---

  // Bot bidding effect
  useEffect(() => {
    if (stage === GameStages.BIDDING) {
      const { currentBidder, passedPlayers, currentBid, biddingActive } =
        biddingState;
      console.log("Bot bidding effect triggered:", {
        stage,
        currentBidder,
        passedPlayers,
        currentBid,
        biddingActive,
        playerAgents: Object.keys(playerAgents),
        botBiddingInProgress: botBiddingInProgress.current,
      });

      // Only act if it's a bot's turn, bidding is active, and bot hasn't passed
      if (
        biddingActive &&
        currentBidder > 0 &&
        !passedPlayers.includes(currentBidder) &&
        !botBiddingInProgress.current
      ) {
        console.log(
          `Bot ${currentBidder} turn to bid. Current bid: ${currentBid}`
        );
        botBiddingInProgress.current = true;

        // Prevent duplicate triggers
        if (botActionTimeout.current) clearTimeout(botActionTimeout.current);
        botActionTimeout.current = setTimeout(() => {
          const agent = playerAgents[currentBidder];
          console.log(`Bot ${currentBidder} agent:`, agent);
          if (agent && typeof agent.getBidAction === "function") {
            const minIncrement = currentBid < 200 ? 5 : 10;
            const maxBid = 250;
            const hand = playerStates[currentBidder].hand;
            const action = agent.getBidAction({
              currentBid,
              minIncrement,
              maxBid,
              passedPlayers,
              hand,
              playerIndex: currentBidder,
            });
            console.log(`Bot ${currentBidder} action:`, action);
            if (action && action.action === "bid") {
              dispatch(
                placeBid({
                  playerIndex: currentBidder,
                  bidAmount: action.bidAmount,
                })
              );
            } else {
              dispatch(passBid({ playerIndex: currentBidder }));
            }
          } else {
            console.log(
              `Bot ${currentBidder} has no agent or getBidAction method`
            );
            dispatch(passBid({ playerIndex: currentBidder }));
          }
          botBiddingInProgress.current = false;
        }, 1200 + Math.random() * 800); // 1.2-2s delay
      } else {
        console.log("Bot bidding conditions not met:", {
          biddingActive,
          currentBidder,
          passedPlayers,
          isBot: currentBidder > 0,
          hasNotPassed: !passedPlayers.includes(currentBidder),
          alreadyInProgress: botBiddingInProgress.current,
        });
      }
    }
    return () => {
      if (botActionTimeout.current) clearTimeout(botActionTimeout.current);
    };
  }, [
    stage,
    biddingState.currentBidder,
    biddingState.passedPlayers,
    biddingState.currentBid,
    biddingState.biddingActive,
    playerAgents,
    playerStates,
    dispatch,
  ]);

  // Helper function to get played card for a specific player
  const getPlayedCardForPlayer = (playerIndex) => {
    // In this new grid layout, we need to ensure we get the *specific* card played in the current round
    // tableCards contains all played cards across all rounds
    // For the current round display, we only care about the last 4 cards played (if 4 players have played)
    // A more robust approach might involve tracking played cards per round in state
    // For now, let's assume tableCards for the current round are the last cards and filter by player index
    const playedCardsThisRound = tableCards.slice(-4); // Assuming last 4 are for the current round
    return playedCardsThisRound.find((card) => card.player === playerIndex);
  };

  const handleCloseRoundSummary = () => {
    dispatch(startNewRound());
  };

  const bidWinner =
    biddingState && !biddingState.biddingActive ? biddingState.bidWinner : null;
  // Only show BidTrumpModal if user is the bid winner and bid/trump not set
  const showBidTrumpModal =
    stage === GameStages.TRUMP_SELECTION && bidWinner === 0;
  // Handle bot trump/teammate selection
  useEffect(() => {
    if (
      stage === GameStages.TRUMP_SELECTION &&
      bidWinner !== null &&
      bidWinner > 0 &&
      !botHandledRef.current
    ) {
      const agent = playerAgents[bidWinner];
      if (agent && typeof agent.chooseTrumpAndTeammate === "function") {
        const hand = playerStates[bidWinner].hand;
        // Compute teammateOptions for the bot's hand (all suites)
        let teammateOptions = [];
        [0, 1, 2, 3].forEach((suite) => {
          teammateOptions = teammateOptions.concat(
            getTeammateOptions(hand, suite)
          );
        });
        const { trumpSuite, teammateCard } = agent.chooseTrumpAndTeammate({
          hand,
          playerNames,
          playerIndex: bidWinner,
          teammateOptions,
        });
        dispatch(
          setBidAndTrump({
            trumpSuite,
            bidder: bidWinner,
            teammateCard,
          })
        );
        botHandledRef.current = true;
      }
    }
    // Reset botHandledRef when we're not in trump selection stage, or when user is bid winner, or when bid/trump are already set
    if (
      stage !== GameStages.TRUMP_SELECTION ||
      bidWinner === 0 ||
      (bidAmount && trumpSuite)
    ) {
      botHandledRef.current = false;
    }
  }, [
    stage,
    bidWinner,
    bidAmount,
    trumpSuite,
    playerAgents,
    playerStates,
    playerNames,
    biddingState,
    dispatch,
  ]);

  const handleBidTrumpSubmit = ({ trumpSuite, teammateCard }) => {
    dispatch(setBidAndTrump({ trumpSuite, bidder: 0, teammateCard }));
  };

  const handleCloseBidResultModal = () => {
    if (stage === GameStages.TRUMP_SELECTION_COMPLETE) {
      dispatch(setStage(GameStages.PLAYING));
    }
  };

  const handleNewGame = () => {
    window.location.reload();
  };

  // Callback functions for BiddingModal
  const handlePlaceBid = (bidData) => {
    dispatch(placeBid(bidData));
  };

  const handlePassBid = (passData) => {
    dispatch(passBid(passData));
  };

  const handleUpdateBidTimer = (newTimer) => {
    dispatch(updateBidTimer(newTimer));
  };

  const handleBotBid = (botBidData) => {
    dispatch(placeBid(botBidData));
  };

  // Helper to get trump info for Scoreboard
  const getTrumpInfo = (trumpSuite) => {
    if (trumpSuite === 0) return { label: "Spades", color: "blue", icon: "♠️" };
    if (trumpSuite === 1) return { label: "Hearts", color: "red", icon: "♥️" };
    if (trumpSuite === 2) return { label: "Clubs", color: "green", icon: "♣️" };
    if (trumpSuite === 3)
      return { label: "Diamonds", color: "red", icon: "♦️" };
    return { label: "—", color: "gray", icon: null };
  };

  return (
    <>
      {/* Scoreboard at the top */}
      {/* <Scoreboard
        team1Name="Team 1"
        team2Name="Team 2"
        team1Score={scores[0]}
        team2Score={scores[1]}
        currentBid={bidAmount}
        trump={getTrumpInfo(trumpSuite)}
        round={round}
        teammate={teammateCard ? teammateCard : ''}
      /> */}
      {/* Existing GameHeader for comparison */}
      <GameHeader
        round={round}
        trumpSuite={trumpSuite}
        teammateCard={teammateCard}
        bidAmount={bidAmount}
        playerNames={playerNames}
        teams={teams}
        teamColors={teamColors}
        scores={scores}
        turn={turn}
        botCardsHidden={botCardsHidden}
        onToggleBotCardsHidden={onToggleBotCardsHidden}
      />
      {stage === GameStages.BIDDING && (
        <BiddingModal
          biddingState={biddingState}
          playerNames={playerNames}
          userHand={playerStates[0].hand}
          onPlaceBid={handlePlaceBid}
          onPassBid={handlePassBid}
          onUpdateBidTimer={handleUpdateBidTimer}
          onBotBid={handleBotBid}
        />
      )}
      {/* Show Bid/Trump Modal if needed */}
      {showBidTrumpModal && (
        <TrumpSelectionModal
          onSubmit={handleBidTrumpSubmit}
          userHand={playerStates[0].hand}
        />
      )}
      {stage === GameStages.TRUMP_SELECTION_COMPLETE && (
        <BidResultModal
          bidWinner={bidder}
          bidAmount={bidAmount}
          trumpSuite={trumpSuite}
          teammateCard={teammateCard}
          playerNames={playerNames}
          onClose={handleCloseBidResultModal}
        />
      )}
      {stage === GameStages.ROUND_SUMMARY && (
        <RoundSummary
          tableCards={tableCards.slice(-players.length)}
          players={players}
          roundWinner={roundWinner}
          onClose={handleCloseRoundSummary}
          playerNames={playerNames}
        />
      )}
      <div className="game-content">
        {/* Render each player's hand and played card in the grid */}
        {players.map((hand, idx) => {
          const playedCard = getPlayedCardForPlayer(idx);
          const playerRow = idx + 2; // Rows 2-5 are for players
          return (
            <React.Fragment key={idx}>
              {/* Player Hand in the first column, aligned with the player's row */}
              <div
                className={`player-hands-container player-hands-grid player-row-${playerRow}`}
              >
                <PlayerHandUI
                  hand={hand}
                  idx={idx}
                  turn={turn}
                  tableCards={tableCards} // Still needed for disabling clicks
                  playCard={playCard}
                  runningSuite={runningSuite}
                  trumpSuite={trumpSuite}
                  playerNames={playerNames}
                  botCardsHidden={botCardsHidden}
                  playerAgents={playerAgents}
                />
              </div>

              {/* Played Card in the second column, aligned with the player's row */}
              <div
                className={`played-card-container played-card-grid player-row-${playerRow}`}
              >
                {playedCard && <CardUI card={playedCard} />}
              </div>
            </React.Fragment>
          );
        })}

        {/* Game Summary */}
        {stage === GameStages.GAME_OVER && (
          <GameSummary
            scores={scores}
            playerStates={playerStates}
            playerNames={playerNames}
            bidAmount={bidAmount}
            bidder={bidder}
            teams={teams}
            teamColors={teamColors}
            onNewGame={handleNewGame}
          />
        )}
      </div>
    </>
  );
}

export default GameContent;
