import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import gameReducer from "./gameSlice";
import rootSaga from "./rootSaga";
import { websocketMiddleware } from "./websocketMiddleware";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    game: gameReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: {
        // All state and actions are now fully serializable
        // No need to ignore any paths
      },
    })
      .concat(sagaMiddleware)
      .concat(websocketMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
