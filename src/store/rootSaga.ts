import { all } from "redux-saga/effects";
import gameSaga from "./gameSaga";

export default function* rootSaga() {
  yield all([gameSaga()]);
}