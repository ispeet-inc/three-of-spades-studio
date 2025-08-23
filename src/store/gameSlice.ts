import { agentClasses } from "@/agents";
import { Card, GameState, Suite, TeamScores } from "@/types/game";
import { distributeDeck, shuffle } from "@/utils/cardUtils";
import { FIRST_PLAYER_ID, PLAYER_NAME_POOL } from "@/utils/constants";
import { initialBiddingState, initPlayerObject } from "@/utils/gameSetupUtils";
import {
  assignTeamsByTeammateCard,
  selectRandomNames,
} from "@/utils/gameUtils";
import {
  initialTableState,
  newRoundOnTable,
  playCardOnTable,
} from "@/utils/tableUtils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GameStages, type GameStage } from "./gameStages";

const NUM_PLAYERS = 4;

// Helper function to convert team number to scores key
const getTeamScoreKey = (team: number): keyof TeamScores => {
  return team === 1 ? "team1" : "team2";
};

const initialState: GameState = {
  stage: GameStages.INIT,
  round: 0,
  trumpSuite: null,
  bidAmount: null,
  bidWinner: null, // Changed from bidder to bidWinner
  scores: { team1: 0, team2: 0 }, // Changed from [0, 0] to object format
  totalRounds: 0,
  teammateCard: null,
  currentBid: 0,
  biddingState: initialBiddingState(NUM_PLAYERS, 0, false),
  tableState: initialTableState(0, true),
  playerState: {
    startingPlayer: 0,
    playerAgents: {},
    playerNames: { 0: "You", 1: "", 2: "", 3: "" },
    players: {
      0: initPlayerObject([]),
      1: initPlayerObject([]),
      2: initPlayerObject([]),
      3: initPlayerObject([]),
    },
  },
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setStage: (state, action: PayloadAction<GameStage>) => {
      console.log(
        "GameSlice.setStage: CHANGING STATE: FROM",
        state.stage,
        "TO",
        action.payload
      );
      state.stage = action.payload;
    },

    startGame: state => {
      // todo - make it single shuffle
      const deck = shuffle(state.tableState.discardedCards);
      state.tableState.discardedCards = [];
      const distributedHands = distributeDeck(deck, NUM_PLAYERS);

      // Initialize each player's hand
      for (let i = 0; i < NUM_PLAYERS; i++) {
        state.playerState.players[i] = initPlayerObject(distributedHands[i]);
      }

      // Randomly assign bot agents to computer players (1, 2, 3)
      state.playerState.playerAgents = {};
      const sampledNames = selectRandomNames(
        PLAYER_NAME_POOL,
        state.playerState.playerNames
      );

      for (let i = 0; i < NUM_PLAYERS; i++) {
        if (i == FIRST_PLAYER_ID) continue;
        const AgentClass =
          agentClasses[Math.floor(Math.random() * agentClasses.length)];
        state.playerState.playerAgents[i] = new (AgentClass as any)();
        // Use the class name for the bot's display name
        const name = sampledNames.pop();
        state.playerState.playerNames[i] = name !== undefined ? name : "";
      }
      // Set total rounds based on cards per player
      state.totalRounds = distributedHands[0].length;
      // Randomly select starting player
      state.playerState.startingPlayer = Math.floor(
        Math.random() * NUM_PLAYERS
      );
      state.trumpSuite = null;
      state.bidAmount = null;
      state.bidWinner = null;
      state.round = 0;
      state.tableState = initialTableState(
        state.playerState.startingPlayer,
        false
      );
      state.scores = { team1: 0, team2: 0 };
    },

    playCard: (
      state,
      action: PayloadAction<{ playerIndex: number; cardIndex: number }>
    ) => {
      const { playerIndex, cardIndex } = action.payload;
      const playerHand = [...state.playerState.players[playerIndex].hand];
      const card = playerHand.splice(cardIndex, 1)[0];

      // Sort the remaining hand by position value to maintain card order
      playerHand.sort((a, b) => a.positionValue - b.positionValue);

      state.playerState.players[playerIndex].hand = playerHand;
      const tableCard = { ...card, player: playerIndex };

      state.tableState = playCardOnTable(
        state.tableState,
        tableCard,
        state.trumpSuite as Suite,
        NUM_PLAYERS
      );

      const roundWinner = state.tableState.roundWinner;
      if (roundWinner !== null) {
        const winningTeam = state.playerState.players[roundWinner.player].team;
        if (winningTeam === null) {
          throw Error("team id is null for player");
        }
        // Calculate total points from all cards in the table
        const roundPoints = state.tableState.tableCards.reduce(
          (sum, card) => sum + card.points,
          0
        );

        state.scores[getTeamScoreKey(winningTeam)] += roundPoints;
        state.playerState.players[roundWinner.player].score += roundPoints;
      }
    },

    startNewRound: state => {
      console.log(
        "GAME: Starting new round, previous winner:",
        state.tableState.roundWinner?.player
      );
      state.tableState = newRoundOnTable(state.tableState);
      state.round = state.round + 1;
      console.log(
        "GAME: Setting stage to PLAYING, current turn:",
        state.tableState.turn
      );
      state.stage = GameStages.PLAYING;

      // Check if game is over
      if (state.round >= state.totalRounds) {
        state.stage = GameStages.GAME_OVER;
      }
    },

    startCardCollection: state => {
      state.stage = GameStages.ROUND_COMPLETE;
    },

    setBidAndTrump: (
      state,
      action: PayloadAction<{
        trumpSuite: Suite;
        bidder: number;
        teammateCard: Card;
      }>
    ) => {
      const { trumpSuite, bidder, teammateCard } = action.payload;
      state.trumpSuite = trumpSuite;
      state.bidWinner = bidder;
      state.teammateCard = teammateCard;
      console.log(
        `Setting trump ${trumpSuite} and teammate: ${state.teammateCard}`
      );
      console.log(state.teammateCard);
      // Assign teams based on teammate card
      const updatedPlayers = assignTeamsByTeammateCard(
        state.playerState.players,
        bidder,
        teammateCard,
        NUM_PLAYERS
      );
      state.playerState.players = updatedPlayers;
      // todo - make this happen through setStage too.
      console.log(
        "CHANGING STATE: FROM ",
        state.stage,
        " TO ",
        GameStages.TRUMP_SELECTION_COMPLETE
      );
      state.stage = GameStages.TRUMP_SELECTION_COMPLETE;
    },

    startBiddingRound: state => {
      const newBiddingState = initialBiddingState(
        NUM_PLAYERS,
        state.tableState.turn,
        true
      );
      state.biddingState = newBiddingState;
    },

    placeBid: (
      state,
      action: PayloadAction<{ playerIndex: number; bidAmount: number }>
    ) => {
      const { playerIndex, bidAmount } = action.payload;
      state.biddingState.currentBid = bidAmount;
      state.biddingState.bidHistory.push({
        player: playerIndex,
        bid: bidAmount,
      });

      // Advance to next eligible bidder
      let nextBidder = (playerIndex + 1) % 4;
      while (state.biddingState.passedPlayers.includes(nextBidder)) {
        nextBidder = (nextBidder + 1) % 4;
      }
      state.biddingState.currentBidder = nextBidder;
      state.biddingState.bidTimer = 30;
    },

    passBid: (state, action: PayloadAction<{ playerIndex: number }>) => {
      const { playerIndex } = action.payload;
      state.biddingState.passedPlayers.push(playerIndex);

      // If only one player left, set winner
      const activePlayers = [0, 1, 2, 3].filter(
        idx => !state.biddingState.passedPlayers.includes(idx)
      );

      if (activePlayers.length === 1) {
        state.biddingState.bidWinner = activePlayers[0];
        state.bidAmount = state.biddingState.currentBid;
        console.log(
          "CHANGING STATE: FROM ",
          state.stage,
          " TO ",
          GameStages.BIDDING_COMPLETE
        );
        state.stage = GameStages.BIDDING_COMPLETE;
        console.log(
          "CHANGING STATE: FROM ",
          state.stage,
          " TO ",
          GameStages.TRUMP_SELECTION
        );
        state.stage = GameStages.TRUMP_SELECTION;
        console.log("Bid winner is ", state.biddingState.bidWinner);
      } else {
        // Advance to next eligible bidder
        let nextBidder = (playerIndex + 1) % 4;
        while (state.biddingState.passedPlayers.includes(nextBidder)) {
          nextBidder = (nextBidder + 1) % 4;
        }
        state.biddingState.currentBidder = nextBidder;
        state.biddingState.bidTimer = 30;
      }
    },

    updateBidTimer: (state, action: PayloadAction<number>) => {
      state.biddingState.bidTimer = action.payload;
    },

    setPlayerName: (
      state,
      action: PayloadAction<{ playerIndex: number; name: string }>
    ) => {
      const { playerIndex, name } = action.payload;
      state.playerState.playerNames[playerIndex] = name;
    },
  },
});

export const {
  setStage,
  startGame,
  playCard,
  startNewRound,
  setBidAndTrump,
  startBiddingRound,
  placeBid,
  passBid,
  updateBidTimer,
  startCardCollection,
  setPlayerName,
} = gameSlice.actions;

export default gameSlice.reducer;
