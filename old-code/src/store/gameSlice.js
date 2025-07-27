import { createSlice } from "@reduxjs/toolkit";
import {
  determineRoundWinner,
  distributeDeck,
  generateDeck,
  shuffle,
  assignTeamsByTeammateCard,
} from "../utils/gameUtils";
import { agentClasses } from "../agents";
import { GameStages } from "./gameStages";
import createCard from "../classes/Card";

const NUM_PLAYERS = 4;

const initialState = {
  stage: GameStages.INIT,
  players: {
    0: { hand: [], score: 0 },
    1: { hand: [], score: 0 },
    2: { hand: [], score: 0 },
    3: { hand: [], score: 0 },
  },
  round: 0,
  runningSuite: null,
  trumpSuite: null,
  bidAmount: null,
  bidder: null,
  tableCards: [],
  scores: [0, 0],
  turn: 0,
  roundWinner: null,
  isRoundEnding: false,
  totalRounds: 0,
  teams: {
    0: [], // Team 1 players
    1: [], // Team 2 players
  },
  playerTeamMap: null,
  teamColors: {
    0: "#fbbf24", // Team 1 color (amber)
    1: "#60a5fa", // Team 2 color (blue)
  },
  playerAgents: {}, // Map of player index to bot agent instance
  playerNames: { 0: "You", 1: "Nats", 2: "Prateek", 3: "Abhi" }, // Default names, will be set in startGame
  teammateCard: null, // NEW: stores the selected teammate card
  // Bidding state object
  biddingState: {
    biddingActive: false,
    currentBid: 165,
    currentBidder: 0,
    passedPlayers: [],
    bidStatusByPlayer: {
      0: "Bidding",
      1: "Bidding",
      2: "Bidding",
      3: "Bidding",
    },
    bidWinner: null,
    bidHistory: [], // Optional, for debugging
    bidTimer: 30,
  },
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setStage: (state, action) => {
      console.log(
        "GameSlice.setStage: CHANGING STATE: FROM ",
        state.stage,
        " TO ",
        action.payload
      );
      state.stage = action.payload;
    },
    startGame: (state) => {
      const deck = shuffle(generateDeck());
      const distributedHands = distributeDeck(deck, NUM_PLAYERS);

      // Initialize each player's hand
      for (let i = 0; i < NUM_PLAYERS; i++) {
        state.players[i].hand = distributedHands[i];
        state.players[i].score = 0;
      }

      // Randomly assign bot agents to computer players (1, 2, 3)
      state.playerAgents = {};
      for (let i = 1; i < NUM_PLAYERS; i++) {
        const AgentClass =
          agentClasses[Math.floor(Math.random() * agentClasses.length)];
        state.playerAgents[i] = new AgentClass();
        // Use the class name for the bot's display name
        state.playerNames[i] = AgentClass.name + " " + state.playerNames[i];
      }

      // Set total rounds based on cards per player
      state.totalRounds = distributedHands[0].length;
      state.trumpSuite = null;
      state.bidAmount = null;
      state.bidder = null;
      state.round = 0;
      state.tableCards = [];
      state.scores = [0, 0];
      state.turn = 0;
      state.roundWinner = null;
      state.isRoundEnding = false;
    },
    playCard: (state, action) => {
      const { playerIndex, cardIndex } = action.payload;
      const playerHand = [...state.players[playerIndex].hand];
      const card = playerHand.splice(cardIndex, 1)[0];
      state.players[playerIndex].hand = playerHand;
      state.tableCards.push({ ...card, player: playerIndex });

      if (state.tableCards.length === 1) {
        const updatedRoundState = {
          runningSuite: card.suite,
        };
        Object.assign(state, updatedRoundState);
      }
      if (state.tableCards.length === NUM_PLAYERS) {
        const winner = determineRoundWinner(
          state.tableCards,
          state.runningSuite,
          state.trumpSuite
        );
        const winningTeam = state.playerTeamMap[winner.player];

        // Calculate total points from all cards in the table
        const roundPoints = state.tableCards.reduce(
          (sum, card) => sum + card.points,
          0
        );

        state.scores[winningTeam] += roundPoints;
        state.players[winner.player].score += roundPoints;
        state.roundWinner = winner.player;
        state.isRoundEnding = true;
        console.log(
          "CHANGING STATE: FROM ",
          state.stage,
          " TO ",
          GameStages.ROUND_SUMMARY
        );
        state.stage = GameStages.ROUND_SUMMARY;
      } else {
        state.turn = (state.turn + 1) % NUM_PLAYERS;
      }
    },
    startNewRound: (state) => {
      // Reset state for new round
      state.tableCards = [];
      state.round = state.round + 1;
      state.turn = state.roundWinner; // Winner starts next round
      state.roundWinner = null;
      state.runningSuite = null;
      state.isRoundEnding = false;
      console.log(
        "CHANGING STATE: FROM ",
        state.stage,
        " TO ",
        GameStages.PLAYING
      );
      state.stage = GameStages.PLAYING;
      // Check if game is over based on total rounds
      if (state.round >= state.totalRounds) {
        console.log(
          "CHANGING STATE: FROM ",
          state.stage,
          " TO ",
          GameStages.GAME_OVER
        );
        state.stage = GameStages.GAME_OVER;
      }
    },
    setBidAndTrump: (state, action) => {
      const { trumpSuite, bidder, teammateCard } = action.payload;
      console.log(teammateCard);
      state.trumpSuite = trumpSuite;
      state.bidder = bidder;
      state.teammateCard = createCard(teammateCard.suite, teammateCard.number);
      // Assign teams based on teammate card
      const { teams, playerTeamMap } = assignTeamsByTeammateCard(
        state.players,
        bidder,
        teammateCard,
        NUM_PLAYERS
      );
      state.teams = teams;
      state.playerTeamMap = playerTeamMap;
      console.log(state.teams);
      console.log(state.playerTeamMap);
      // todo - make this happen through setStage too.
      console.log(
        "CHANGING STATE: FROM ",
        state.stage,
        " TO ",
        GameStages.TRUMP_SELECTION_COMPLETE
      );
      state.stage = GameStages.TRUMP_SELECTION_COMPLETE;
    },
    startBiddingRound: (state) => {
      state.biddingState = {
        biddingActive: true,
        currentBid: 165,
        currentBidder: 0,
        passedPlayers: [],
        bidStatusByPlayer: {
          0: "Bidding",
          1: "Bidding",
          2: "Bidding",
          3: "Bidding",
        },
        bidWinner: null,
        bidHistory: [],
        bidTimer: 30,
      };
    },
    placeBid: (state, action) => {
      const { playerIndex, bidAmount } = action.payload;
      state.biddingState.currentBid = bidAmount;
      state.biddingState.bidStatusByPlayer[
        playerIndex
      ] = `Current Bid: ${bidAmount}`;
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
    passBid: (state, action) => {
      const { playerIndex } = action.payload;
      state.biddingState.passedPlayers.push(playerIndex);
      state.biddingState.bidStatusByPlayer[playerIndex] = "Passed";
      // If only one player left, set winner
      const activePlayers = [0, 1, 2, 3].filter(
        (idx) => !state.biddingState.passedPlayers.includes(idx)
      );
      if (activePlayers.length === 1) {
        state.biddingState.bidWinner = activePlayers[0];
        state.biddingState.biddingActive = false;
        state.bidAmount = state.biddingState.currentBid;
        // todo - make this happen through setStage too.
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
    updateBidTimer: (state, action) => {
      state.biddingState.bidTimer = action.payload;
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
} = gameSlice.actions;

export default gameSlice.reducer;
