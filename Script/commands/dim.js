const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: 'dim',
  aliases: ['anda', 'egg'],
  version: '2.1.0',
  hasPermssion: 0,
  credits: 'Meheraz (Mirai Version)',
  description: 'কাউকে ডিম (Egg Meme) বানিয়ে দিন।',
  commandCategory: 'fun',
  usages: '[Mention/Reply]',
  cooldowns: 5
};

// প্রোফাইল পিকচার ফেচ করার ফাংশন
const fetchAvatar = async (uid) => {
  try {
    const avatarUrl = `https://graph.facebook.com/${uid}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const finalUrl = `${avatarUrl}&t=${Date.now()}`;

    const response = await axios.get(finalUrl, {
      responseType: "arraybuffer",
      timeout: 15000,
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    return Buffer.from(response.data);
  } catch (error) {
    throw new Error(`Failed to fetch avatar: ${error.message}`);
  }
};

module.exports.run = async function ({ event, api, Users }) {
  const { threadID, messageID, senderID, mentions, messageReply } = event;

  try {
    // টার্গেট আইডি নির্ধারণ
    const targetID = (messageReply && messageReply.senderID) || 
                     (Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : null);

    if (!targetID) 
      return api.sendMessage('🔹 কাউকে mention বা reply দাও!', threadID, messageID);
    
    if (targetID === senderID) 
      return api.sendMessage('😂 নিজেকে dim বানানো নিষেধ!', threadID, messageID);

    api.sendMessage('⏳ Dim বানানো হচ্ছে...', threadID, messageID);

    const avatarBuffer = await fetchAvatar(targetID);
    const avatar = await loadImage(avatarBuffer);

    // ব্যাকগ্রাউন্ড ইমেজ ম্যানেজমেন্ট
    const cacheDir = path.join(__dirname, 'cache', 'dim');
    await fs.ensureDir(cacheDir);
    const bgPath = path.join(cacheDir, 'bg.jpg');

    let bg;
    if (!fs.existsSync(bgPath)) {
      const bgRes = await axios.get(
        'https://i.postimg.cc/Wbt5GLY7/5674fba3a393f7578a73919569b5147f.jpg',
        { responseType: 'arraybuffer' }
      );
      await fs.writeFile(bgPath, bgRes.data);
      bg = await loadImage(bgRes.data);
    } else {
      bg = await loadImage(await fs.readFile(bgPath));
    }

    // ক্যানভাস তৈরি
    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bg, 0, 0);

    // অবতার পজিশন
    const size = 150;
    const x = 100;
    const y = 60;

    // অবতার ড্রয়িং (Circular Clip)
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, x, y, size, size);
    ctx.restore();

    // সাদা বর্ডার
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2 + 3, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 5;
    ctx.stroke();

    // ফানি টেক্সট যোগ করা
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;

    const text = 'PURE DIM 😂';
    ctx.strokeText(text, bg.width / 2, bg.height - 40);
    ctx.fillText(text, bg.width / 2, bg.height - 40);

    // আউটপুট সেভ
    const outputPath = path.join(cacheDir, `${targetID}_${Date.now()}.png`);
    await fs.writeFile(outputPath, canvas.toBuffer());

    // ইউজারের নাম সংগ্রহ
    const name = await Users.getNameUser(targetID);

    // মেসেজ পাঠানো
    await api.sendMessage({
      body: `🥚🤣 ${name} এখন একদম DIM LEVEL MAX!`,
      attachment: fs.createReadStream(outputPath)
    }, threadID, () => {
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    }, messageID);

  } catch (e) {
    console.error(e);
    api.sendMessage('❌ Dim বানাতে সমস্যা হয়েছে! সার্ভার বা এপিআই চেক করুন।', threadID, messageID);
  }
};
