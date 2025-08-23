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
  gameConfig: null,
  gameProgress: {
    stage: GameStages.INIT,
    round: 0,
    scores: { team1: 0, team2: 0 },
  },
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
        state.gameProgress.stage,
        "TO",
        action.payload
      );
      state.gameProgress.stage = action.payload;
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
      state.gameConfig = null;
      // Randomly select starting player
      state.playerState.startingPlayer = Math.floor(
        Math.random() * NUM_PLAYERS
      );
      state.gameProgress.round = 0;
      state.tableState = initialTableState(
        state.playerState.startingPlayer,
        false
      );
      state.gameProgress.scores = { team1: 0, team2: 0 };
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

      if (!state.gameConfig) {
        throw new Error("Game config is not initialized");
      }

      state.tableState = playCardOnTable(
        state.tableState,
        tableCard,
        state.gameConfig.trumpSuite,
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

        state.gameProgress.scores[getTeamScoreKey(winningTeam)] += roundPoints;
        state.playerState.players[roundWinner.player].score += roundPoints;
      }
    },

    startNewRound: state => {
      console.log(
        "GAME: Starting new round, previous winner:",
        state.tableState.roundWinner?.player
      );
      state.tableState = newRoundOnTable(state.tableState);
      state.gameProgress.round = state.gameProgress.round + 1;
      console.log(
        "GAME: Setting stage to PLAYING, current turn:",
        state.tableState.turn
      );
      state.gameProgress.stage = GameStages.PLAYING;

      // Check if game is over
      if (
        state.gameConfig &&
        state.gameProgress.round >= state.gameConfig.totalRounds
      ) {
        state.gameProgress.stage = GameStages.GAME_OVER;
      }
    },

    startCardCollection: state => {
      state.gameProgress.stage = GameStages.ROUND_COMPLETE;
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
      state.gameConfig = {
        bidAmount: state.biddingState.currentBid,
        bidWinner: bidder,
        teammateCard: teammateCard,
        trumpSuite: trumpSuite,
        totalRounds: 10,
      };
      // todo - remove hardcoded total rounds
      console.log(`Setting trump ${trumpSuite} and teammate: ${teammateCard}`);
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
        state.gameProgress.stage,
        " TO ",
        GameStages.TRUMP_SELECTION_COMPLETE
      );
      state.gameProgress.stage = GameStages.TRUMP_SELECTION_COMPLETE;
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
        console.log(
          "CHANGING STATE: FROM ",
          state.gameProgress.stage,
          " TO ",
          GameStages.BIDDING_COMPLETE
        );
        state.gameProgress.stage = GameStages.BIDDING_COMPLETE;
        console.log(
          "CHANGING STATE: FROM ",
          state.gameProgress.stage,
          " TO ",
          GameStages.TRUMP_SELECTION
        );
        state.gameProgress.stage = GameStages.TRUMP_SELECTION;
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
