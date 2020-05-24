import { createStore, combineReducers } from "redux";
import * as discord from "./discord";

export const actions = {
  ...discord.actions,
};

const reducer = combineReducers({
  discord: discord.reducer,
});

export const store = createStore(reducer);
