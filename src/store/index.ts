import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['game/startGame'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['payload.playerAgents'],
        // Ignore these paths in the state
        ignoredPaths: ['game.playerAgents'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;