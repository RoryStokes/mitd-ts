import { Client } from "discord.js";
import { store, actions } from "./store";

const client = new Client();

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on("message", (msg) => {
  if (msg.content === "ping") {
    msg.reply("pong");
  }
  store.dispatch(actions.receivedMessage(msg));
});

client.login(process.env.TOKEN);
