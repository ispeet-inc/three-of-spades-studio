import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GameState, Card, Player, TableCard } from "@/types/game";
import { GameStages, type GameStage } from "./gameStages";
import { generateDeck, shuffle, distributeDeck, createCard } from "@/utils/cardUtils";
import { determineRoundWinner, assignTeamsByTeammateCard, selectRandomNames } from "@/utils/gameUtils";
import { agentClasses } from "@/agents";
import { PLAYER_NAME_POOL } from "@/utils/constants";
import { initialBiddingState } from "@/utils/gameSetupUtils";

const NUM_PLAYERS = 4;

const initialState: GameState = {
  stage: GameStages.INIT,
  players: {
    0: { hand: [], score: 0 },
    1: { hand: [], score: 0 },
    2: { hand: [], score: 0 },
    3: { hand: [], score: 0 },
  },
  startingPlayer: 0,
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
  playerTeamMap: null,
  playerAgents: {},
  playerNames: { 0: "You", 1: "", 2: "", 3: "" },
  teammateCard: null,
  isCollectingCards: false,
  showCardsPhase: false,
  collectionWinner: null,
  biddingState: initialBiddingState(NUM_PLAYERS, 0, false),
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setStage: (state, action: PayloadAction<GameStage>) => {
      console.log("GameSlice.setStage: CHANGING STATE: FROM", state.stage, "TO", action.payload);
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
      const sampledNames = selectRandomNames(PLAYER_NAME_POOL, state.playerNames);

      for (let i = 1; i < NUM_PLAYERS; i++) {
        const AgentClass = agentClasses[Math.floor(Math.random() * agentClasses.length)];
        state.playerAgents[i] = new (AgentClass as any)();
        // Use the class name for the bot's display name
        state.playerNames[i] = sampledNames.pop();
      }

      // Set total rounds based on cards per player
      state.totalRounds = distributedHands[0].length;
      // Randomly select starting player
      state.startingPlayer = Math.floor(Math.random() * NUM_PLAYERS);
      state.trumpSuite = null;
      state.bidAmount = null;
      state.bidder = null;
      state.round = 0;
      state.tableCards = [];
      state.scores = [0, 0];
      state.turn = state.startingPlayer;
      state.biddingState.currentBidder = state.startingPlayer;
      state.roundWinner = null;
    },

    playCard: (state, action: PayloadAction<{ playerIndex: number; cardIndex: number }>) => {
      const { playerIndex, cardIndex } = action.payload;
      const playerHand = [...state.players[playerIndex].hand];
      const card = playerHand.splice(cardIndex, 1)[0];
      
      // Sort the remaining hand by position value to maintain card order
      playerHand.sort((a, b) => a.positionValue - b.positionValue);
      
      state.players[playerIndex].hand = playerHand;
      state.tableCards.push({ ...card, player: playerIndex });

      if (state.tableCards.length === 1) {
        state.runningSuite = card.suite;
      }

      if (state.tableCards.length === NUM_PLAYERS) {
        console.log("GAME: All 4 cards played, determining winner");
        const winner = determineRoundWinner(
          state.tableCards,
          state.runningSuite!,
          state.trumpSuite!
        );
        const winningTeam = state.playerTeamMap![winner.player];

        // Calculate total points from all cards in the table
        const roundPoints = state.tableCards.reduce((sum, card) => sum + card.points, 0);

        state.scores[winningTeam] += roundPoints;
        state.players[winner.player].score += roundPoints;
        state.roundWinner = winner.player;
      } else {
        state.turn = (state.turn + 1) % NUM_PLAYERS;
      }
    },

    startNewRound: (state) => {
      console.log("GAME: Starting new round, previous winner:", state.roundWinner);
      state.tableCards = [];
      state.round = state.round + 1;
      state.turn = state.roundWinner!;
      state.roundWinner = null;
      state.runningSuite = null;
      state.collectionWinner = null;
      console.log("GAME: Setting stage to PLAYING, current turn:", state.turn);
      state.stage = GameStages.PLAYING;

      // Check if game is over
      if (state.round >= state.totalRounds) {
        state.stage = GameStages.GAME_OVER;
      }
    },

    startCardCollection: (state) => {
      state.collectionWinner = state.roundWinner;
      state.stage = GameStages.ROUND_COMPLETE;
    },

    setBidAndTrump: (state, action: PayloadAction<{ trumpSuite: number; bidder: number; teammateCard: Card }>) => {
      const { trumpSuite, bidder, teammateCard } = action.payload;
      state.trumpSuite = trumpSuite;
      state.bidder = bidder;
      state.teammateCard = teammateCard;
      console.log(`Setting trump ${trumpSuite} and teammate: ${state.teammateCard}`)
      console.log(state.teammateCard);
      // Assign teams based on teammate card
      const playerTeamMap = assignTeamsByTeammateCard(
        state.players,
        bidder,
        teammateCard,
        NUM_PLAYERS
      );
      state.playerTeamMap = playerTeamMap;
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
      const newBiddingState = initialBiddingState(NUM_PLAYERS, state.startingPlayer, true);
      state.biddingState = newBiddingState;
    },

    placeBid: (state, action: PayloadAction<{ playerIndex: number; bidAmount: number }>) => {
      const { playerIndex, bidAmount } = action.payload;
      state.biddingState.currentBid = bidAmount;
      state.biddingState.bidHistory.push({ player: playerIndex, bid: bidAmount });

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
        (idx) => !state.biddingState.passedPlayers.includes(idx)
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

    setPlayerName: (state, action: PayloadAction<{ playerIndex: number; name: string }>) => {
      const { playerIndex, name } = action.payload;
      state.playerNames[playerIndex] = name;
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