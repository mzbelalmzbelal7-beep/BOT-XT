const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "gemini",
  version: "10.0.0",
  hasPermssion: 0,
  credits: "Gemini AI Voice",
  description: "এখন গিমিনি কোনো শর্টকাট ছাড়াই বিস্তারিত ভয়েস উত্তর দেবে",
  commandCategory: "AI",
  usages: "[আপনার প্রশ্ন]",
  cooldowns: 1,
};

const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const prompt = args.join(" ");
  if (!prompt) return api.sendMessage("❌ জানু, কিছু তো জিজ্ঞেস করো! 🥰", threadID, messageID);

  api.setMessageReaction("⏳", messageID, () => {}, true);

  try {
    const apiConfig = await axios.get(nix);
    const baseApi = apiConfig.data?.api;

    // কোনো শর্টকাট ছাড়াই বিস্তারিত উত্তর দেওয়ার নির্দেশ
    const r = await axios.get(`${baseApi}/gemini?prompt=${encodeURIComponent("নিচের বিষয়টির উত্তর কোনো শর্টকাট বা কাটাকাটি ছাড়া একদম বিস্তারিত এবং সুন্দরভাবে গুছিয়ে দাও: " + prompt)}`);
    const reply = r.data?.response;
    
    if (reply) {
      return await generateAndSendVoice(api, event, reply, baseApi);
    }
  } catch (error) {
    api.sendMessage("⚠ উত্তর দিতে সমস্যা হচ্ছে জানু।", threadID, messageID);
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, body, senderID } = event;
  if (!body) return;

  api.setMessageReaction("⏳", messageID, () => {}, true);

  try {
    // রিপ্লাইতেও বিস্তারিত আলোচনা করার নির্দেশ
    const r = await axios.get(`${handleReply.baseApi}/gemini?prompt=${encodeURIComponent("আগের কথার প্রেক্ষিতে কোনো কিছু বাদ না দিয়ে বিস্তারিত বুঝিয়ে বলো: " + body)}`);
    const reply = r.data?.response;

    if (reply) {
      return await generateAndSendVoice(api, event, reply, handleReply.baseApi);
    }
  } catch (error) {
    api.setMessageReaction("❌", messageID, () => {}, true);
  }
};

async function generateAndSendVoice(api, event, text, baseApi) {
  const { threadID, messageID, senderID } = event;
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);
  
  const cachePath = path.join(cacheDir, `${Date.now()}_gemini.mp3`);

  try {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=bn&client=tw-ob&ttsspeed=1`;
    
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer'
    });

    fs.writeFileSync(cachePath, Buffer.from(response.data));
    api.setMessageReaction("✅", messageID, () => {}, true);

    return api.sendMessage({
      body: `🎙️ 𝗚𝗲𝗺𝗶𝗻𝗶 𝗩𝗼𝗶𝗰𝗲 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲:\n\n${text}`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, (err, info) => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: senderID,
        baseApi: baseApi
      });
    }, messageID);

  } catch (e) {
    return api.sendMessage(text, threadID, messageID);
  }
    }
