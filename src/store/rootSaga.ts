import { all } from "redux-saga/effects";
import gameSaga from "./gameSaga";
import botAISaga from "./sagas/botAISaga";
import gameFlowSaga from "./sagas/gameFlowSaga";

export default function* rootSaga() {
  yield all([gameSaga(), botAISaga(), gameFlowSaga()]);
}
