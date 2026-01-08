const axios = require('axios');
const fs = require('fs-extra'); 
const path = require('path');

module.exports.config = {
  name: "artv2",
  version: "1.0", 
  hasPermssion: 0,
  credits: "NeoKEX (Mirai Version)",
  description: "ArtV1 মডেল ব্যবহার করে ছবি তৈরি করুন।",
  commandCategory: "AI-Image",
  usages: "[prompt]",
  cooldowns: 15,
};

const API_ENDPOINT = "https://dev.oculux.xyz/api/artv1"; 

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;
    let prompt = args.join(" ");

    // ১. ইনপুট চেক (শুধুমাত্র ইংরেজি প্রম্পট সাপোর্ট করবে)
    if (!prompt || !/^[\x00-\x7F]*$/.test(prompt)) {
        return api.sendMessage("❌ ছবি তৈরি করতে দয়া করে ইংরেজিতে প্রম্পট দিন।", threadID, messageID);
    }

    api.setMessageReaction("⏳", messageID, (err) => {}, true);
    
    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) {
        await fs.mkdirp(cacheDir); 
    }
    const tempFilePath = path.join(cacheDir, `artv1_${Date.now()}.png`);

    try {
      // এপিআই প্রম্পট হিসেবে 'p' প্যারামিটার গ্রহণ করে
      const fullApiUrl = `${API_ENDPOINT}?p=${encodeURIComponent(prompt.trim())}`;
      
      const response = await axios({
          method: 'get',
          url: fullApiUrl,
          responseType: 'stream',
          timeout: 45000 
      });

      const writer = fs.createWriteStream(tempFilePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", (err) => {
          writer.close();
          reject(err);
        });
      });

      api.setMessageReaction("✅", messageID, (err) => {}, true);
      
      // ২. ছবি পাঠানো
      await api.sendMessage({
        body: `ArtV1 image generated ✨`,
        attachment: fs.createReadStream(tempFilePath)
      }, threadID, () => {
          // পাঠানোর পর ফাইল ডিলিট
          if (fs.existsSync(tempFilePath)) {
              fs.unlinkSync(tempFilePath); 
          }
      }, messageID);

    } catch (error) {
      api.setMessageReaction("❌", messageID, (err) => {}, true);
      
      let errorMessage = "ছবি তৈরি করার সময় একটি সমস্যা হয়েছে।";
      if (error.response) {
          errorMessage = `HTTP Error: ${error.response.status}`;
      } else if (error.code === 'ETIMEDOUT') {
          errorMessage = `সময় শেষ হয়ে গেছে। ছোট প্রম্পট দিয়ে আবার চেষ্টা করুন।`;
      }

      console.error("ArtV1 Error:", error);
      api.sendMessage(`❌ ${errorMessage}`, threadID, messageID);
      
      if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath); 
      }
    }
};
