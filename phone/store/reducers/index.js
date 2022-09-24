import { combineReducers } from "redux";
import msgReducer from "./msgReducer";

export const reducers = combineReducers({
  MessageReducer: msgReducer,
});
