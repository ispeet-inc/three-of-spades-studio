# Redux-Saga Integration Design

This document outlines a clear, actionable plan for integrating redux-saga into the codebase. It is written for an LLM agent to follow and implement the migration, ensuring all side effects and async logic are moved from React components to sagas.

---

## 1. **Install and Set Up Redux-Saga**

- Add `redux-saga` to project dependencies.
- In `src/store/index.js`, set up saga middleware and run the root saga.
- Create `src/store/rootSaga.js` to combine all sagas.

---

## 2. **File Structure**

```
src/
  store/
    index.js           # Store setup, saga middleware
    rootReducer.js     # Combines all reducers
    rootSaga.js        # Combines all sagas
    gameSlice.js       # Game reducer (state only)
    gameSaga.js        # Sagas for game logic (timers, bots, etc)
  components/
    GameContent.js     # Refactored to remove useEffects
    GameContentv2.js   # Refactored to remove useEffects
    ThreeOfSpades.js   # Refactored to remove useBotMoves and round end timer
  ...
```

---

## 3. **Side Effects and Async Logic to Move to Sagas**

### **A. GameContent.js**
- Stage transitions (DISTRIBUTE_CARDS → BIDDING)
- Bidding timer countdown and auto-pass
- Bot bidding logic (delayed bot actions)
- Bot trump/teammate selection

### **B. ThreeOfSpades.js**
- Bot card play during PLAYING stage (delayed)
- Round end timer (delayed start of new round)

### **C. GameContentv2.js**
- Stage transitions (DISTRIBUTE_CARDS → BIDDING)

---

## 4. **Saga Design**

### **A. gameSaga.js**
Implement the following sagas:

1. **Stage Transition Saga**
   - Listen for `GameStages.DISTRIBUTE_CARDS` and dispatch `setStage(GameStages.BIDDING)`.

2. **Bidding Timer Saga**
   - Listen for bidding start (e.g., `startBiddingRound` or entering BIDDING stage).
   - Every second, decrement timer and dispatch `updateBidTimer`.
   - If timer reaches 0, dispatch `passBid` for the current bidder.
   - Cancel timer if bidding ends.

3. **Bot Bidding Saga**
   - When it's a bot's turn during bidding, wait 1.2-2s, then invoke bot agent logic.
   - Dispatch `placeBid` or `passBid` based on bot decision.

4. **Bot Trump/Teammate Selection Saga**
   - When a bot wins the bid, wait briefly, then invoke bot agent logic to select trump and teammate.
   - Dispatch `setBidAndTrump` with the bot's choices.

5. **Bot Card Play Saga**
   - During PLAYING stage, when it's a bot's turn, wait 1-2s, then invoke bot agent logic to select a card.
   - Dispatch `playCard` with the bot's choice.

6. **Round End Timer Saga**
   - When `isRoundEnding` becomes true, wait (e.g., 10s), then dispatch `startNewRound`.

### **B. rootSaga.js**
- Combine all sagas from `gameSaga.js` (and any future sagas).

---

## 5. **Component Refactoring**

- Remove all `useEffect` hooks and custom hooks that handle side effects or timers from `GameContent.js`, `GameContentv2.js`, and `ThreeOfSpades.js`.
- Components should only dispatch actions and select state.
- All side effects and async logic should be handled in sagas.

---

## 6. **Testing and Validation**

- Ensure all game flows (bidding, bot actions, round transitions, etc.) work as before.
- Confirm that no side effects remain in React components.
- All async/timer/bot logic should be in sagas.

---

## 7. **References**

- [Redux-Saga Getting Started](https://redux-saga.js.org/docs/introduction/GettingStarted/)
- [Redux Toolkit with Redux-Saga Example](https://dev.to/rammyblog/redux-toolkit-with-redux-saga-3g6g)
- [Redux Folder Structure Best Practices](https://redux.js.org/style-guide/style-guide#structure-files-as-feature-folders-or-ducks)

---

**This design is ready for an LLM agent to implement the migration.** 