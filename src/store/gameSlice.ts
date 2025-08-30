import { agentClasses } from "@/agents";
import { Card, GameError, GameState, Suite, TeamScores } from "@/types/game";
import {
  BID_TIMER_DURATION,
  FIRST_PLAYER_ID,
  NUM_PLAYERS,
  PLAYER_NAME_POOL,
} from "@/utils/constants";
import {
  initialBiddingState,
  initPlayerNames,
  initPlayerObject,
  resetGameStateForNewGame,
} from "@/utils/gameSetupUtils";
import {
  assignTeamsByTeammateCard,
  calculateGameScores,
  rotateStartingPlayer,
  selectRandomNames,
} from "@/utils/gameUtils";
import {
  initialTableState,
  newTrickOnTable,
  playCardOnTable,
} from "@/utils/tableUtils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GameStages, type GameStage } from "./gameStages";

// Helper function to convert team number to scores key
const getTeamScoreKey = (team: number): keyof TeamScores => {
  return team === 1 ? "team1" : "team2";
};

const initialState: GameState = {
  gameConfig: null,
  gameProgress: {
    stage: GameStages.INIT,
    trick: 0,
    scores: { team1: 0, team2: 0 },
  },
  biddingState: initialBiddingState(NUM_PLAYERS, 0, false),
  tableState: initialTableState(0, true),
  playerState: {
    startingPlayer: 0,
    playerAgents: {},
    playerNames: initPlayerNames(NUM_PLAYERS, FIRST_PLAYER_ID, "You"),
    players: {
      0: initPlayerObject([]),
      1: initPlayerObject([]),
      2: initPlayerObject([]),
      3: initPlayerObject([]),
    },
  },
  seriesProgress: {
    currentGame: 1,
    totalGames: 1,
    gameScores: {},
    seriesScores: { 0: 0, 1: 0, 2: 0, 3: 0 },
    startingPlayerIndex: 0,
    seriesWinner: null,
  },
  gameMode: "single",
  error: null,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setStage: (state, action: PayloadAction<GameStage>) => {
      console.log(
        "[Game Flow] GameSlice.setStage: CHANGING STATE: FROM",
        state.gameProgress.stage,
        "TO",
        action.payload
      );
      state.gameProgress.stage = action.payload;
    },

    playerSetup: state => {
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
    },

    startGame: (state, action: PayloadAction<{ startingPlayer: number }>) => {
      console.log(
        "Starting game with starting player: ",
        action.payload.startingPlayer
      );
      const resetState = resetGameStateForNewGame(
        state,
        NUM_PLAYERS,
        action.payload.startingPlayer
      );
      Object.assign(state, resetState);
    },

    playCard: (
      state,
      action: PayloadAction<{ playerIndex: number; cardIndex: number }>
    ) => {
      const { playerIndex, cardIndex } = action.payload;
      const playerHand = [...state.playerState.players[playerIndex].hand];
      const card = playerHand.splice(cardIndex, 1)[0];

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

      const trickWinner = state.tableState.trickWinner;
      if (trickWinner !== null) {
        const winningTeam = state.playerState.players[trickWinner.player].team;
        if (winningTeam === null) {
          throw Error("team id is null for player");
        }
        // Calculate total points from all cards in the table
        const trickPoints = state.tableState.tableCards.reduce(
          (sum, card) => sum + card.points,
          0
        );

        state.gameProgress.scores[getTeamScoreKey(winningTeam)] += trickPoints;
        state.playerState.players[trickWinner.player].score += trickPoints;
      }
    },

    startNewTrick: state => {
      console.log(
        "GAME: Starting new trick, previous winner:",
        state.tableState.trickWinner?.player
      );
      state.tableState = newTrickOnTable(state.tableState);
      state.gameProgress.trick = state.gameProgress.trick + 1;
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
        totalTricks: 10,
      };
      // todo - remove hardcoded total tricks
      console.log(`Setting trump ${trumpSuite} and teammate: ${teammateCard}`);
      // Assign teams based on teammate card
      const updatedPlayers = assignTeamsByTeammateCard(
        state.playerState.players,
        bidder,
        teammateCard,
        NUM_PLAYERS
      );
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
      state.biddingState.bidHistory[playerIndex] = bidAmount;

      // Advance to next eligible bidder
      let nextBidder = (playerIndex + 1) % NUM_PLAYERS;
      while (state.biddingState.passedPlayers.includes(nextBidder)) {
        nextBidder = (nextBidder + 1) % NUM_PLAYERS;
      }
      state.biddingState.currentBidder = nextBidder;
      state.biddingState.bidTimer = BID_TIMER_DURATION;
    },

    passBid: (state, action: PayloadAction<{ playerIndex: number }>) => {
      const { playerIndex } = action.payload;
      state.biddingState.passedPlayers.push(playerIndex);

      // If only one player left, set winner but don't transition stages yet
      const activePlayers = [0, 1, 2, 3].filter(
        idx => !state.biddingState.passedPlayers.includes(idx)
      );

      if (activePlayers.length === 1) {
        state.biddingState.bidWinner = activePlayers[0];
        // Don't transition stages immediately - let the saga handle the delay
        console.log(
          "Bidding complete, winner set. Waiting for delay before stage transition."
        );
        console.log("Bid winner is ", state.biddingState.bidWinner);
      } else {
        // Advance to next eligible bidder
        let nextBidder = (playerIndex + 1) % NUM_PLAYERS;
        while (state.biddingState.passedPlayers.includes(nextBidder)) {
          nextBidder = (nextBidder + 1) % NUM_PLAYERS;
        }
        state.biddingState.currentBidder = nextBidder;
        state.biddingState.bidTimer = BID_TIMER_DURATION;
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

    // Bot action triggers - these actions trigger the bot AI saga
    botShouldPlayCard: (
      state,
      action: PayloadAction<{ playerIndex: number }>
    ) => {
      // This action triggers the bot AI saga
      // No state changes needed, just a trigger
    },

    botShouldBid: (state, action: PayloadAction<{ playerIndex: number }>) => {
      // This action triggers the bot bidding saga
      // No state changes needed, just a trigger
    },

    botShouldSelectTrump: (
      state,
      action: PayloadAction<{ playerIndex: number }>
    ) => {
      // This action triggers the bot trump selection saga
      // No state changes needed, just a trigger
    },

    // Game flow action triggers - these actions trigger the game flow saga
    gameInitialize: state => {
      // This action triggers the game initialization saga
      // No state changes needed, just a trigger
    },

    gameStageTransition: (state, action: PayloadAction<GameStage>) => {
      // This action triggers the game stage transition saga
      // No state changes needed, just a trigger
    },

    // Error handling actions
    setGameError: (state, action: PayloadAction<GameError>) => {
      state.error = action.payload;
    },

    clearGameError: state => {
      state.error = null;
    },

    // NEW: Series management actions
    setGameMode: (state, action: PayloadAction<"single" | "series">) => {
      state.gameMode = action.payload;
      if (action.payload === "series") {
        state.seriesProgress.totalGames = 4; // Default for series
      } else {
        state.seriesProgress.totalGames = 1; // Single game
      }
    },

    startNextGame: state => {
      // 1. Rotate starting player
      state.seriesProgress.startingPlayerIndex = rotateStartingPlayer(
        state.seriesProgress.startingPlayerIndex,
        NUM_PLAYERS
      );

      state.seriesProgress.currentGame += 1;

      const resetState = resetGameStateForNewGame(
        state,
        NUM_PLAYERS,
        state.seriesProgress.startingPlayerIndex
      );
      Object.assign(state, resetState);
    },

    completeGame: state => {
      // 1. Calculate final game scores (existing logic)
      if (state.biddingState.bidWinner === null) {
        throw new Error("Bid winner is null");
      }
      const gameScores = calculateGameScores(
        state.gameProgress.scores,
        state.playerState.players,
        state.biddingState.currentBid,
        state.biddingState.bidWinner
      );

      // 2. Update series scores
      Object.entries(gameScores).forEach(([playerId, score]) => {
        const playerIndex = parseInt(playerId);
        state.seriesProgress.seriesScores[playerIndex] += score;
      });

      // 3. Store game scores for history
      state.seriesProgress.gameScores[state.seriesProgress.currentGame] =
        gameScores;

      // 4. Check if series complete
      if (state.seriesProgress.currentGame >= state.seriesProgress.totalGames) {
        state.gameProgress.stage = GameStages.SERIES_SUMMARY;
      } else {
        state.gameProgress.stage = GameStages.GAME_SUMMARY;
      }
    },

    completeSeries: state => {
      // Determine series winner
      const winner = Object.entries(state.seriesProgress.seriesScores).reduce(
        (max, [playerId, score]) =>
          score > max.score ? { playerId: parseInt(playerId), score } : max,
        { playerId: 0, score: -1 }
      );

      state.seriesProgress.seriesWinner = winner.playerId;
    },

    // NEW: State restoration actions for observer mode
    restoreGameState: (state, action: PayloadAction<GameState>) => {
      const savedState = action.payload;

      // Restore game progress
      state.gameProgress = savedState.gameProgress;

      // Restore bidding state
      state.biddingState = savedState.biddingState;

      // Restore table state
      state.tableState = savedState.tableState;

      // Restore player state
      state.playerState = savedState.playerState;

      // Restore game config
      state.gameConfig = savedState.gameConfig;

      // Clear any errors
      state.error = null;
    },
  },
});

export const {
  setStage,
  playerSetup,
  startGame,
  playCard,
  startNewTrick,
  setBidAndTrump,
  startBiddingRound,
  placeBid,
  passBid,
  updateBidTimer,
  setPlayerName,
  botShouldPlayCard,
  botShouldBid,
  botShouldSelectTrump,
  gameInitialize,
  gameStageTransition,
  setGameError,
  clearGameError,
  restoreGameState,
  // NEW: Series management actions
  setGameMode,
  startNextGame,
  completeGame,
  completeSeries,
} = gameSlice.actions;

export default gameSlice.reducer;
