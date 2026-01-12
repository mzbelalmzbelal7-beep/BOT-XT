const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "gemini",
  version: "15.0.0",
  hasPermssion: 0,
  credits: "Gemini AI Voice",
  description: "প্রথম প্রশ্ন এবং রিপ্লাই—সবই এখন ১০০% মিষ্টি ভয়েসে আসবে",
  commandCategory: "AI",
  usages: "[আপনার প্রশ্ন]",
  cooldowns: 1,
};

const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const prompt = args.join(" ");
  if (!prompt) return api.sendMessage("হুম জানু! ওভাবে চুপ করে থেকো না, কিছু বলো আমি শুনতেছি... 🥰", threadID, messageID);

  api.setMessageReaction("⏳", messageID, () => {}, true);

  try {
    const apiConfig = await axios.get(nix);
    const baseApi = apiConfig.data?.api;

    const humanPrompt = `তুমি একজন মিষ্টি হৃদয়ের মানুষ হিসেবে নমনীয় এবং আদুরে ভাষায় বিস্তারিত উত্তর দাও: ${prompt}`;
    const r = await axios.get(`${baseApi}/gemini?prompt=${encodeURIComponent(humanPrompt)}`);
    const reply = r.data?.response;
    
    if (reply) {
      return await startVoiceEngine(api, event, reply, baseApi);
    }
  } catch (error) {
    api.sendMessage("উফ সোনা! একটু সমস্যা হচ্ছে, আবার বলো তো? 🥺", threadID, messageID);
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, body, senderID } = event;
  if (!body) return;

  api.setMessageReaction("⏳", messageID, () => {}, true);

  try {
    // রিপ্লাই এর সময়ও একই API ব্যবহার করে মিষ্টি উত্তর আনা
    const r = await axios.get(`${handleReply.baseApi}/gemini?prompt=${encodeURIComponent("মিষ্টি করে উত্তর দাও: " + body)}`);
    const reply = r.data?.response;

    if (reply) {
      // রিপ্লাই এর উত্তরটিও ভয়েসে পাঠানো নিশ্চিত করা হলো
      return await startVoiceEngine(api, event, reply, handleReply.baseApi);
    }
  } catch (error) {
    api.setMessageReaction("❌", messageID, () => {}, true);
  }
};

// 🔊 মেইন ভয়েস ইঞ্জিন (এটিই প্রতিবার ভয়েস নিশ্চিত করবে)
async function startVoiceEngine(api, event, text, baseApi) {
  const { threadID, messageID, senderID } = event;
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);
  
  const cachePath = path.join(cacheDir, `${Date.now()}_voice.mp3`);

  try {
    // ক্লিয়ার এবং মিষ্টি ভয়েস প্রোটোকল
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=bn&client=tw-ob&ttsspeed=0.9`;
    
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    fs.writeFileSync(cachePath, Buffer.from(response.data));
    api.setMessageReaction("✅", messageID, () => {}, true);

    return api.sendMessage({
      body: `🎙️ 𝗚𝗲𝗺𝗶𝗻𝗶 𝗦𝘄𝗲𝗲𝘁 𝗩𝗼𝗶𝗰𝗲:\n\n${text}`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, (err, info) => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      
      // গুরুত্বপূর্ণ: এটি পরেরবার রিপ্লাই দেওয়ার জন্য বটকে রেডি রাখে
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
    
