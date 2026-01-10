const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

// আগের balance ফাইলের সাথেই কানেক্ট রাখা হয়েছে
const balanceFile = path.join(__dirname, "coinxbalance.json");

if (!fs.existsSync(balanceFile)) {
  fs.writeFileSync(balanceFile, JSON.stringify({}, null, 2));
}

// === Utility Functions ===
function getBalance(userID) {
  try {
    const data = JSON.parse(fs.readFileSync(balanceFile));
    if (data[userID]?.balance != null) return data[userID].balance;
    return userID === "100082607436864" ? 10000 : 100;
  } catch (e) { return 100; }
}

function setBalance(userID, balance) {
  try {
    const data = JSON.parse(fs.readFileSync(balanceFile));
    data[userID] = { balance };
    fs.writeFileSync(balanceFile, JSON.stringify(data, null, 2));
  } catch (e) {}
}

function formatBalance(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2).replace(/\.00$/, '') + "T$";
  if (num >= 1e9) return (num / 1e9).toFixed(2).replace(/\.00$/, '') + "B$";
  if (num >= 1e6) return (num / 1e6).toFixed(2).replace(/\.00$/, '') + "M$";
  if (num >= 1e3) return (num / 1e3).toFixed(2).replace(/\.00$/, '') + "k$";
  return num.toLocaleString() + "$";
}

function parseAmount(str) {
  str = str.toLowerCase().replace(/\s+/g, '');
  const match = str.match(/^([\d.]+)([kmbt]?)$/);
  if (!match) return NaN;
  let num = parseFloat(match[1]);
  const unit = match[2];
  switch (unit) {
    case 'k': num *= 1e3; break;
    case 'm': num *= 1e6; break;
    case 'b': num *= 1e9; break;
    case 't': num *= 1e12; break;
  }
  return Math.floor(num);
}

// === Mirai Config ===
module.exports.config = {
  name: "bet",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "ALVI-BOSS",
  description: "Neon casino style betting game",
  commandCategory: "game",
  usages: "[amount] (e.g. 1k, 500)",
  cooldowns: 10,
};

module.exports.run = async function ({ api, event, args, Users }) {
  const { senderID, threadID, messageID } = event;

  try {
    let balance = getBalance(senderID);

    if (!args[0])
      return api.sendMessage("🎰 বাজি ধরার জন্য এমাউন্ট লিখুন। উদাহরণ: /bet 1k বা /bet 500", threadID, messageID);

    const betAmount = parseAmount(args[0]);
    if (isNaN(betAmount) || betAmount <= 0)
      return api.sendMessage("❌ অকার্যকর এমাউন্ট! সঠিক সংখ্যা দিন।", threadID, messageID);

    if (betAmount > balance)
      return api.sendMessage(`❌ আপনার কাছে পর্যাপ্ত কয়েন নেই!\n💰 বর্তমান ব্যালেন্স: ${formatBalance(balance)}`, threadID, messageID);

    // Winning Logic
    const multipliers = [2, 3, 5, 10];
    const chosenMultiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
    const win = Math.random() < 0.4; // 40% Win rate

    let newBalance = balance;
    let resultText = "", profit = 0;

    if (win) {
      profit = betAmount * chosenMultiplier;
      newBalance += profit;
      resultText = `JACKPOT! ${chosenMultiplier}x`;
    } else {
      newBalance -= betAmount;
      resultText = "YOU LOST";
    }
    setBalance(senderID, newBalance);

    api.sendMessage("🎲 ক্যাসিনো ড্রিলিং হচ্ছে... ভাগ্যের চাকা ঘুরছে!", threadID, messageID);

    // === Image Generation ===
    const userName = await Users.getNameUser(senderID);
    const avatarUrl = `https://graph.facebook.com/${senderID}/picture?height=500&width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    let avatar;
    try {
      const res = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
      avatar = await loadImage(res.data);
    } catch (e) { avatar = null; }

    const width = 900, height = 550;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background Styling
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0d0221');
    bgGrad.addColorStop(1, '#261447');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Neon Frame
    ctx.strokeStyle = win ? '#00ffea' : '#ff0055';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Casino Title
    ctx.font = 'bold 70px "Arial"';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffcc00';
    ctx.shadowColor = '#ffae00';
    ctx.shadowBlur = 15;
    ctx.fillText('GOAT CASINO', width / 2, 100);
    ctx.shadowBlur = 0;

    // Avatar Circle
    if (avatar) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(150, 250, 80, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar, 70, 170, 160, 160);
      ctx.restore();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // Player Info
    ctx.textAlign = 'left';
    ctx.font = 'bold 40px "Arial"';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(userName.substring(0, 15), 260, 230);
    
    ctx.font = '30px "Arial"';
    ctx.fillStyle = '#00ffea';
    ctx.fillText(`Bet Amount: ${formatBalance(betAmount)}`, 260, 280);

    // Result Highlight
    ctx.fillStyle = win ? 'rgba(0, 255, 234, 0.1)' : 'rgba(255, 0, 85, 0.1)';
    ctx.fillRect(260, 320, 580, 160);

    ctx.font = 'bold 65px "Arial"';
    ctx.fillStyle = win ? '#00ffea' : '#ff0055';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 10;
    ctx.shadowColor = win ? '#00ffea' : '#ff0055';
    ctx.fillText(resultText, 550, 400);

    if (win) {
      ctx.font = '35px "Arial"';
      ctx.fillStyle = '#ffd700';
      ctx.fillText(`Profit: +${formatBalance(profit)}`, 550, 450);
    } else {
      ctx.font = '35px "Arial"';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Loss: -${formatBalance(betAmount)}`, 550, 450);
    }
    ctx.shadowBlur = 0;

    // Footer - New Balance
    ctx.font = 'bold 32px "Arial"';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`NEW BALANCE: ${formatBalance(newBalance)}`, width / 2, 515);

    // Save & Send
    const cachePath = path.join(__dirname, 'cache', `bet_${senderID}.png`);
    if (!fs.existsSync(path.join(__dirname, 'cache'))) fs.mkdirSync(path.join(__dirname, 'cache'));
    
    fs.writeFileSync(cachePath, canvas.toBuffer());

    return api.sendMessage({
      body: win ? `🎉 অভিনন্দন! আপনি ${chosenMultiplier}x প্রফিট করেছেন!` : `😔 দুর্ভাগ্য! আপনি হারছেন। আবার চেষ্টা করুন।`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => fs.unlinkSync(cachePath), messageID);

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ গেমে এরর হয়েছে!", threadID, messageID);
  }
};
