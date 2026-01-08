const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "Tik Tok",
  version: "2.1",
  hasPermssion: 0,
  credits: "Mahi-- (Mirai Version)",
  description: "TikTok থেকে অ্যানিমে এডিট ভিডিও সার্চ করুন",
  commandCategory: "fun",
  usages: "[query]",
  cooldowns: 5,
};

// ভিডিও স্ট্রিম পাওয়ার ফাংশন
async function getStreamFromURL(url, filePath) {
  const response = await axios({
    method: 'get',
    url: url,
    responseType: 'stream'
  });
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// টিকটক ভিডিও ফেচ করার ফাংশন
async function fetchTikTokVideos(query) {
  try {
    const response = await axios.get(`https://mahi-apis.onrender.com/api/tiktok?search=${encodeURIComponent(query)}`);
    return response.data.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(' ');

  if (!query) {
    return api.sendMessage("❌ দয়া করে একটি সার্চ কুয়েরি দিন।\nউদাহরণ: /anisearch naruto", threadID, messageID);
  }

  api.setMessageReaction("✨", messageID, (err) => {}, true);

  // কুয়েরির সাথে "anime edit" যুক্ত করা
  const modifiedQuery = `${query} anime edit`;
  const cachePath = path.join(__dirname, "cache", `ani_${Date.now()}.mp4`);

  try {
    const videos = await fetchTikTokVideos(modifiedQuery);

    if (!videos || videos.length === 0) {
      return api.sendMessage(`❌ "${query}" এর জন্য কোনো ভিডিও পাওয়া যায়নি।`, threadID, messageID);
    }

    // র‍্যান্ডম একটি ভিডিও সিলেক্ট করা
    const selectedVideo = videos[Math.floor(Math.random() * videos.length)];
    const videoUrl = selectedVideo.video;
    const title = selectedVideo.title || "No title available";

    if (!videoUrl) {
      return api.sendMessage('❌ এপিআই রেসপন্সে ভিডিও পাওয়া যায়নি।', threadID, messageID);
    }

    // ভিডিও ডাউনলোড এবং ক্যাশ ফোল্ডারে সেভ করা
    if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));
    await getStreamFromURL(videoUrl, cachePath);

    // ভিডিও পাঠানো
    await api.sendMessage({
      body: `🎥 ভিডিও টাইটেল: ${title}\n\nআপনার অনুরোধ করা ভিডিওটি নিচে দেওয়া হলো!`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath); // পাঠানোর পর ফাইল ডিলিট
    }, messageID);

  } catch (error) {
    console.error(error);
    api.sendMessage('❌ ভিডিওটি প্রসেস করার সময় একটি এরর হয়েছে। দয়া করে আবার চেষ্টা করুন।', threadID, messageID);
    if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
  }
};
