const axios = require("axios");

module.exports.config = {
  name: "gemini",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ArYAN",
  description: "Ask Gemini AI",
  commandCategory: "AI",
  usages: "[your question]",
  cooldowns: 3,
};

const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  let e;

  try {
    const apiConfig = await axios.get(nix);
    e = apiConfig.data && apiConfig.data.api;
    if (!e) throw new Error("Configuration Error");
  } catch (error) {
    return api.sendMessage("❌ Failed to fetch API configuration from GitHub.", threadID, messageID);
  }

  const p = args.join(" ");
  if (!p) return api.sendMessage("❌ Please provide a question or prompt.", threadID, messageID);

  api.setMessageReaction("⏳", messageID, () => {}, true);

  try {
    const r = await axios.get(`${e}/gemini?prompt=${encodeURIComponent(p)}`);
    const reply = r.data?.response; 
    if (!reply) throw new Error("No response");

    api.setMessageReaction("✅", messageID, () => {}, true);

    api.sendMessage(reply, threadID, (err, info) => {
      if (err) return;
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        baseApi: e
      });
    }, messageID);

  } catch (error) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    api.sendMessage("⚠ Gemini API theke response pawa jachchhe na.", threadID, messageID);
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, body } = event;
  const { baseApi: e } = handleReply;

  if (!body) return;
  api.setMessageReaction("⏳", messageID, () => {}, true);

  try {
    const r = await axios.get(`${e}/gemini?prompt=${encodeURIComponent(body)}`);
    const reply = r.data?.response; 
    if (!reply) throw new Error("No response");

    api.setMessageReaction("✅", messageID, () => {}, true);

    api.sendMessage(reply, threadID, (err, info) => {
      if (err) return;
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        baseApi: e
      });
    }, messageID);

  } catch (error) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    api.sendMessage("⚠ Gemini API er response dite somossa hocchhe.", threadID, messageID);
  }
};
