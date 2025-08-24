import { createCard } from "@/utils/cardUtils";
import { FIRST_PLAYER_ID, TIMINGS } from "@/utils/constants";
import { getTeammateOptions } from "@/utils/gameUtils";
import { cancelled, delay, put, select, takeLatest } from "redux-saga/effects";
import { PlayerState, TableState } from "../../types/game";
import {
  botShouldBid,
  botShouldPlayCard,
  botShouldSelectTrump,
  passBid,
  placeBid,
  playCard,
  setBidAndTrump,
} from "../gameSlice";
import { GameStages } from "../gameStages";
import { RootState } from "../index";
import {
  selectBiddingStateRaw,
  selectGameConfig,
  selectGameProgress,
  selectPlayerState,
} from "../selectors";

// Bot card playing saga
function* handleBotCardPlay(): Generator<any, void, any> {
  let tableState: TableState;
  let playerState: PlayerState;

  try {
    // Wait for bot thinking time
    yield delay(TIMINGS.botPlayDelayMs);

    // Get current game state
    const gameProgress = yield select(selectGameProgress);
    tableState = yield select((state: RootState) => state.game.tableState);
    playerState = yield select(selectPlayerState);
    const gameConfig = yield select(selectGameConfig);

    // Check if it's still bot's turn and game is in playing stage
    if (gameProgress.stage !== GameStages.PLAYING || tableState.turn === 0) {
      return;
    }

    const currentPlayer = playerState.players[tableState.turn];
    const botAgent = playerState.playerAgents[tableState.turn];

    if (!currentPlayer?.hand?.length || !botAgent) {
      console.error(`Bot ${tableState.turn} cannot play - no hand or no agent`);
      return;
    }

    // Bot chooses card
    const cardIndex = botAgent.chooseCardIndex({
      hand: currentPlayer.hand,
      tableCards: tableState.tableCards,
      trumpSuite: gameConfig?.trumpSuite,
      runningSuite: tableState.runningSuite,
      playerIndex: tableState.turn,
    });

    // Validate card index and fallback to random if invalid
    const validCardIndex =
      cardIndex !== null &&
      cardIndex >= 0 &&
      cardIndex < currentPlayer.hand.length
        ? cardIndex
        : Math.floor(Math.random() * currentPlayer.hand.length);

    // Dispatch card play action
    yield put(
      playCard({
        playerIndex: tableState.turn,
        cardIndex: validCardIndex,
      })
    );
  } catch (error) {
    console.error(`Bot card play error:`, error);
  } finally {
    if (yield cancelled()) {
      console.log(`Bot card play saga cancelled`);
    }
  }
}

// Bot bidding saga
function* handleBotBidding(): Generator<any, void, any> {
  let biddingState: any;

  try {
    // Wait for bot thinking time
    yield delay(TIMINGS.botBidThinkMs);

    // Get current game state
    const gameProgress = yield select(selectGameProgress);
    biddingState = yield select(selectBiddingStateRaw);
    const playerState = yield select(selectPlayerState);

    // Check if still in bidding stage and it's bot's turn
    if (
      gameProgress.stage !== GameStages.BIDDING ||
      biddingState.currentBidder === 0 ||
      biddingState.passedPlayers.length >= 3 ||
      biddingState.bidWinner !== null
    ) {
      return;
    }

    const botAgent = playerState.playerAgents[biddingState.currentBidder];
    const currentPlayer = playerState.players[biddingState.currentBidder];

    if (!botAgent || !currentPlayer) {
      yield put(passBid({ playerIndex: biddingState.currentBidder }));
      return;
    }

    // Bot makes bidding decision
    const bidAction = botAgent.getBidAction({
      currentBid: biddingState.currentBid,
      minIncrement: 5,
      maxBid: 200,
      passedPlayers: biddingState.passedPlayers,
      hand: currentPlayer.hand,
      playerIndex: biddingState.currentBidder,
    });

    if (bidAction.action === "bid" && bidAction.bidAmount) {
      yield put(
        placeBid({
          playerIndex: biddingState.currentBidder,
          bidAmount: bidAction.bidAmount,
        })
      );
    } else {
      yield put(passBid({ playerIndex: biddingState.currentBidder }));
    }
  } catch (error) {
    console.error(`Bot ${biddingState?.currentBidder} bidding error:`, error);

    // Fallback: pass bid
    const fallbackBiddingState = yield select(selectBiddingStateRaw);
    if (fallbackBiddingState?.currentBidder) {
      yield put(passBid({ playerIndex: fallbackBiddingState.currentBidder }));
    }
  } finally {
    if (yield cancelled()) {
      console.log(`Bot ${biddingState?.currentBidder} bidding saga cancelled`);
    }
  }
}

// Bot trump selection saga
function* handleBotTrumpSelection(): Generator<any, void, any> {
  let biddingState: any;

  try {
    // Wait for bot thinking time
    yield delay(TIMINGS.botTrumpThinkMs);

    // Get current game state
    const gameProgress = yield select(selectGameProgress);
    biddingState = yield select(selectBiddingStateRaw);
    const playerState = yield select(selectPlayerState);

    // Check if still in trump selection stage and bot is bid winner
    if (
      gameProgress.stage !== GameStages.TRUMP_SELECTION ||
      biddingState.bidWinner === FIRST_PLAYER_ID ||
      biddingState.bidWinner === null
    ) {
      return;
    }

    const botAgent = playerState.playerAgents[biddingState.bidWinner];
    const bidWinner = playerState.players[biddingState.bidWinner];

    if (!botAgent || !bidWinner) {
      // Fallback: random trump and teammate
      const randomTrump = Math.floor(Math.random() * 4);
      const randomTeammate = createCard(randomTrump, 1);
      yield put(
        setBidAndTrump({
          trumpSuite: randomTrump,
          bidder: biddingState.bidWinner,
          teammateCard: randomTeammate,
        })
      );
      return;
    }

    // Generate teammate options for all suits
    const allTeammateOptions = [0, 1, 2, 3].flatMap(suite =>
      getTeammateOptions(bidWinner.hand, suite)
    );

    // Bot chooses trump and teammate
    const choice = botAgent.chooseTrumpAndTeammate({
      hand: bidWinner.hand,
      playerNames: playerState.playerNames,
      playerIndex: biddingState.bidWinner,
      teammateOptions: allTeammateOptions,
    });

    yield put(
      setBidAndTrump({
        trumpSuite: choice.trumpSuite,
        bidder: biddingState.bidWinner,
        teammateCard: choice.teammateCard,
      })
    );
  } catch (error) {
    console.error(
      `Bot ${biddingState?.bidWinner} trump selection error:`,
      error
    );

    // Fallback: random trump and teammate
    const fallbackBiddingState = yield select(selectBiddingStateRaw);
    if (fallbackBiddingState?.bidWinner) {
      const randomTrump = Math.floor(Math.random() * 4);
      const randomTeammate = createCard(randomTrump, 1);
      yield put(
        setBidAndTrump({
          trumpSuite: randomTrump,
          bidder: fallbackBiddingState.bidWinner,
          teammateCard: randomTeammate,
        })
      );
    }
  } finally {
    if (yield cancelled()) {
      console.log(
        `Bot ${biddingState?.bidWinner} trump selection saga cancelled`
      );
    }
  }
}

// Main bot AI saga watcher
export default function* botAISaga(): Generator<any, void, any> {
  // Watch for bot card play opportunities
  yield takeLatest(botShouldPlayCard.type, handleBotCardPlay);

  // Watch for bot bidding opportunities
  yield takeLatest(botShouldBid.type, handleBotBidding);

  // Watch for bot trump selection opportunities
  yield takeLatest(botShouldSelectTrump.type, handleBotTrumpSelection);
}
