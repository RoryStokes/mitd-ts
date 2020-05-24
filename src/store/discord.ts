import { createAction, getType } from "typesafe-actions";
import { Message } from "discord.js";

// Actions
export const actions = {
  receivedMessage: createAction("RECEIVED_MESSAGE", (x: Message) => x)(),
  sendMessage: createAction("SEND_MESSAGE", (x) => x)(),
};

type DiscordAction = ReturnType<typeof actions[keyof typeof actions]>;
type DiscordState = {};

export const reducer = (state: DiscordState = {}, action: DiscordAction) => {
  switch (action.type) {
    case getType(actions.receivedMessage):
      console.log("RECEIVED MESSAGE!");
      return state;
    default:
      return state;
  }
};
