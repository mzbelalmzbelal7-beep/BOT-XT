const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "animate",
  version: "11.0.0",
  hasPermssion: 0,
  credits: "Neoaz ゐ",
  description: "AI-এর মাধ্যমে ছবিকে ভিডিওতে রূপান্তর করুন (বাংলা ও ইংরেজি সাপোর্ট)।",
  commandCategory: "AI",
  usages: "[ছবি রিপ্লাই দিয়ে কমান্ড দিন]",
  cooldowns: 15,
};

const API_SOURCE = "https://sandipbaruwal.onrender.com/animate"; 

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, messageReply, type } = event;
  const startTime = Date.now();

  // ১. ইমেজ চেক
  let imageUrl = (type === "message_reply") ? messageReply.attachments[0]?.url : event.attachments[0]?.url;

  if (!imageUrl || (type === "message_reply" && messageReply.attachments[0]?.type !== "photo")) {
    return api.sendMessage("❌ ভিডিও তৈরি করতে একটি ছবি (Photo) রিপ্লাই দিন!\nযেমন: /animate নাচাও বা /animate dance", threadID, messageID);
  }

  // ২. ভাষা ও কমান্ড প্রসেসিং
  let inputAction = args.join(" ").toLowerCase().trim();
  if (!inputAction) inputAction = "animate this";

  // সহজ বাংলা কমান্ড ম্যাপিং
  const translations = {
    "নাচাও": "dance", "হাসাও": "smile", "দৌড়াও": "run", "উড়াও": "fly", 
    "কথা বলাও": "talk", "কাঁদাও": "cry", "জাদু": "magic", "বৃষ্টি": "rain"
  };

  let processedAction = inputAction;
  for (let key in translations) {
    if (processedAction.includes(key)) {
      processedAction = processedAction.replace(key, translations[key]);
    }
  }

  // ৩. লোডিং স্ট্যাটাস (React Component-এর মতো)
  api.setMessageReaction("⏳", messageID, () => {}, true);
  api.sendMessage("✨ ভিডিও তৈরি হচ্ছে...\nএতে কয়েক মিনিট সময় লাগতে পারে।", threadID, messageID);

  const CACHE_DIR = path.join(__dirname, 'cache');
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  const tempFilePath = path.join(CACHE_DIR, `anim_${Date.now()}.mp4`);

  try {
    // API Call
    const res = await axios.get(`${API_SOURCE}?prompt=${encodeURIComponent(processedAction)}&url=${encodeURIComponent(imageUrl)}`, { timeout: 300000 });

    // রেজাল্ট হ্যান্ডলিং (আপনার React Logic অনুযায়ী)
    const videoUrl = res.data.video_url || res.data.url || res.data.data;

    if (videoUrl) {
      const vidRes = await axios({ url: videoUrl, method: 'GET', responseType: 'stream' });
      const writer = fs.createWriteStream(tempFilePath);
      vidRes.data.pipe(writer);

      writer.on('finish', () => {
        const endTime = Date.now();
        const processingTime = ((endTime - startTime) / 1000).toFixed(2);

        api.setMessageReaction("✅", messageID, () => {}, true);
        api.sendMessage({
          body: `✅ সফলভাবে তৈরি হয়েছে!\n\n🎬 কমান্ড: ${inputAction}\n⏱ সময় লেগেছে: ${processingTime}s\n🐦 ডাউনলোড করে উপভোগ করুন!`,
          attachment: fs.createReadStream(tempFilePath)
        }, threadID, () => {
          if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        }, messageID);
      });
    } else {
      throw new Error("API সফল হলেও ভিডিও লিঙ্ক পাওয়া যায়নি।");
    }

  } catch (err) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    api.sendMessage(`❌ ত্রুটি: এআই সার্ভার এখন আপনার অনুরোধটি প্রসেস করতে পারছে না।\n\nবার্তা: ${err.message}`, threadID, messageID);
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
  }
};
