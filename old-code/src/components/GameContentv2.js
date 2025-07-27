import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { GameStages } from "../store/gameStages";
import {
  startNewRound,
  setBidAndTrump,
  setStage,
  placeBid,
  passBid,
  updateBidTimer,
} from "../store/gameSlice";

import "../css/GameContentv2.css";
import CardUI from "../pure_components/CardUI";
import PlayerHandUI from "../pure_components/PlayerHandUI";
import GameSummary from "../pure_components/GameSummary";
import GameHeader from "../pure_components/GameHeader";
import RoundSummary from "../pure_components/RoundSummary";
import TrumpSelectionModal from "../pure_components/TrumpSelectionModal";
import BiddingModal from "../pure_components/BiddingModal";
import { getTeammateOptions } from "../utils/gameUtils";
import BidResultModal from "../pure_components/BidResultModal";
import PlayerArea from "./PlayerArea";

import {
  sampleHand,
  player_info,
  overrideTableCards,
} from "../utils/dummy_data";
import CenterTable from "../pure_components/CenterTable";
import { getDisplayPlayerName } from "../utils/gameUtils";

// --- Main GameContentv2 component ---
// Shows all four players and the center played cards in a cross layout.
function GameContentv2({
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
  const playerTeamMap = useSelector((state) => state.game.playerTeamMap);
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

  console.log("GameContent v2 - stage : ", stage);
  return (
    <>
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
      {/* Wrap the table in a flex container for robust vertical centering */}
      <div className="table-outer-flex-v2">
        <div className="table-container-v2">
          {/* Render each player area in their respective positions */}
          {players.map((hand, idx) => {
            const info = player_info[idx];
            const name = getDisplayPlayerName(playerNames, idx);
            const isBidder = bidder === idx;
            const teamId = playerTeamMap ? playerTeamMap[idx] : 0;
            const teamColor = teamColors[teamId];
            return (
              <React.Fragment key={idx}>
                {/* Player Hand in the first column, aligned with the player's row */}
                <div className={`player-hands-container player-hands-grid`}>
                  <PlayerArea
                    key={info.pos}
                    pos={info.pos}
                    name={name}
                    isBidder={isBidder}
                    teamId={teamId}
                    teamColor={teamColor}
                    score={info.score}
                    handDirection={info.handDirection}
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
              </React.Fragment>
            );
          })}
          <CenterTable
            tableCards={tableCards.slice(-players.length)}
            players={players}
            roundWinner={roundWinner}
            onClose={handleCloseRoundSummary}
            playerNames={playerNames}
          />
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
      </div>
    </>
  );
}

export default GameContentv2;
