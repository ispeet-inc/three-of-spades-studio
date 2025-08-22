import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import gameReducer from "./gameSlice";
import rootSaga from "./rootSaga";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    game: gameReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["game/startGame"],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ["payload.playerAgents"],
        // Ignore these paths in the state
        ignoredPaths: ["game.playerAgents"],
      },
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
