import { combineReducers } from "redux";
import mediaReducer from "./mediaReducer";

export const reducers = combineReducers({
  MediaReducer: mediaReducer,
});
