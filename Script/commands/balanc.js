const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require('canvas');
const axios = require('axios');

// ব্যালেন্স ডাটাবেস ফাইল পাথ
const balanceFile = path.join(__dirname, "coinxbalance.json");

// ফাইল না থাকলে তৈরি করবে
if (!fs.existsSync(balanceFile)) {
  fs.writeFileSync(balanceFile, JSON.stringify({}, null, 2));
}

// === Helper Functions (সেম থাকছে) ===
function getBalance(userID) {
  try {
    const data = JSON.parse(fs.readFileSync(balanceFile));
    if (data[userID]?.balance != null) return data[userID].balance;
    if (userID === "100082607436864") return 10000; 
    return 100; 
  } catch (e) { return 0; }
}

function setBalance(userID, balance) {
  try {
    const data = JSON.parse(fs.readFileSync(balanceFile));
    data[userID] = { balance };
    fs.writeFileSync(balanceFile, JSON.stringify(data, null, 2));
  } catch (e) { }
}

function formatBalance(num) {
  if (num >= 1e33) return (num / 1e33).toFixed(1).replace(/\.0$/, '') + "De";
  if (num >= 1e30) return (num / 1e30).toFixed(1).replace(/\.0$/, '') + "No";
  if (num >= 1e27) return (num / 1e27).toFixed(1).replace(/\.0$/, '') + "Oc";
  if (num >= 1e24) return (num / 1e24).toFixed(1).replace(/\.0$/, '') + "Sp";
  if (num >= 1e21) return (num / 1e21).toFixed(1).replace(/\.0$/, '') + "Sx";
  if (num >= 1e18) return (num / 1e18).toFixed(1).replace(/\.0$/, '') + "Qi";
  if (num >= 1e15) return (num / 1e15).toFixed(1).replace(/\.0$/, '') + "Qa";
  if (num >= 1e12) return (num / 1e12).toFixed(1).replace(/\.0$/, '') + "T";
  if (num >= 1e9) return  (num / 1e9).toFixed(1).replace(/\.0$/, '') + "B";
  if (num >= 1e6) return  (num / 1e6).toFixed(1).replace(/\.0$/, '') + "M";
  if (num >= 1e3) return  (num / 1e3).toFixed(1).replace(/\.0$/, '') + "K";
  return num.toLocaleString();
}

// Rounded Rectangle Helper
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// === Mirai Config ===
module.exports.config = {
  name: "balance",
  aliases: ["bal", "money"],
  version: "2.0.0", // Major version update for redesign
  hasPermssion: 0,
  credits: "ALVI-BOSS & Redesign by Assistant",
  description: "Premium neon style balance card",
  commandCategory: "economy",
  usages: "[transfer @user amount]",
  cooldowns: 5,
  dependencies: {
    "canvas": "",
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, senderID, messageID, mentions } = event;

  try {
    // === Transfer Logic (সেম থাকছে) ===
    if (args[0] && args[0].toLowerCase() === "transfer") {
      if (!mentions || Object.keys(mentions).length === 0)
        return api.sendMessage("❌ আপনি কাকে টাকা পাঠাতে চান তাকে মেনশন করুন।", threadID, messageID);

      const targetID = Object.keys(mentions)[0];
      const amount = parseInt(args[args.length - 1]);
      
      if (isNaN(amount) || amount <= 0)
        return api.sendMessage("❌ টাকার পরিমাণ সঠিক নয়।", threadID, messageID);

      let senderBal = getBalance(senderID);
      if (senderBal < amount)
        return api.sendMessage("❌ আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই।", threadID, messageID);

      let receiverBal = getBalance(targetID);
      senderBal -= amount;
      receiverBal += amount;
      
      setBalance(senderID, senderBal);
      setBalance(targetID, receiverBal);

      const senderName = await Users.getNameUser(senderID);
      const receiverName = await Users.getNameUser(targetID);

      return api.sendMessage(
        `✅ ট্রান্সফার সফল হয়েছে!\n────────────────\n📤 প্রেরক: ${senderName}\n📥 প্রাপক: ${receiverName}\n💸 পরিমাণ: ${formatBalance(amount)}$\n💳 বর্তমান ব্যালেন্স: ${formatBalance(senderBal)}$`,
        threadID, messageID
      );
    }

    // === Balance Card Generation (NEW DESIGN) ===
    api.sendMessage("💳 আপনার প্রিমিয়াম কার্ড জেনারেট হচ্ছে...", threadID, messageID);

    const balance = getBalance(senderID);
    const userName = await Users.getNameUser(senderID);
    const formattedBal = formatBalance(balance);

    // Profile Picture Fetch
    const picUrl = `https://graph.facebook.com/${senderID}/picture?height=500&width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    let avatar = null;
    try {
      const res = await axios({ url: picUrl, responseType: 'arraybuffer' });
      avatar = await loadImage(res.data);
    } catch (e) { console.log("Avatar fetch failed"); }

    // === Canvas Setup ===
    const width = 850;
    const height = 540;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // --- 1. Background & Atmosphere ---
    // Deep Space/Cyber Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#020024');
    bgGrad.addColorStop(0.4, '#090979');
    bgGrad.addColorStop(1, '#00d4ff');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Add subtle futuristic overlay patterns (circles/lines)
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#00ffea';
    ctx.lineWidth = 2;
    for(let i=0; i<5; i++) {
        ctx.beginPath();
        ctx.arc(width/2, height/2, 100 + (i*80), 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.globalAlpha = 1.0; // Reset alpha

    // --- 2. The Glass Card Container ---
    ctx.shadowColor = 'rgba(0, 212, 255, 0.6)'; // Cyan glow shadow
    ctx.shadowBlur = 35;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;

    // Glassmorphism fill
    const cardGrad = ctx.createLinearGradient(20, 20, width-20, height-20);
    cardGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    cardGrad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
    ctx.fillStyle = cardGrad;
    
    // Glass border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;

    roundRect(ctx, 20, 20, width - 40, height - 40, 30);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset shadow for inner elements

    // --- 3. Card Elements ---
    
    // BANK LOGO / TITLE
    ctx.font = 'bold italic 42px "Arial"';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#bc13fe'; // Purple glow text
    ctx.shadowBlur = 10;
    ctx.fillText('NEO BANK', 60, 90);
    ctx.shadowBlur = 0;

    // CHIP (Realistic look)
    const chipX = 60, chipY = 140;
    ctx.fillStyle = '#d4af37'; // Gold base
    roundRect(ctx, chipX, chipY, 70, 55, 10);
    ctx.fill();
    ctx.strokeStyle = '#b8860b'; // Darker gold lines
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(chipX, chipY+27); ctx.lineTo(chipX+70, chipY+27); // horizontal mid
    ctx.moveTo(chipX+35, chipY); ctx.lineTo(chipX+35, chipY+55); // vertical mid
    ctx.stroke();


    // PROFILE PICTURE (With Neon Ring)
    if (avatar) {
      const size = 120;
      const x = width - size - 60;
      const y = 60;

      // Neon Glow Ring
      ctx.shadowColor = '#00ffea'; // Cyan glow
      ctx.shadowBlur = 20;
      ctx.strokeStyle = '#00ffea';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x + size/2, y + size/2, size/2 + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Avatar Crop
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar, x, y, size, size);
      ctx.restore();
    }

    // BALANCE AREA (Hero Section)
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '24px "Arial"';
    ctx.fillText('Total Balance', width - 60, 240);

    // Huge glowing balance text
    ctx.shadowColor = '#00ffea';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ffffff';
    // Adjust font size based on length so it fits
    const fontSize = formattedBal.length > 10 ? '60px' : '80px';
    ctx.font = `bold ${fontSize} "Arial"`;
    ctx.fillText(`${formattedBal}$`, width - 60, 310);
    ctx.shadowBlur = 0;


    // CARD DETAILS (Bottom Section)
    ctx.textAlign = 'left';
    
    // Card Number (Monospace font for realism)
    ctx.font = '34px monospace';
    ctx.fillStyle = '#e0e0e0';
    ctx.fillText('**** **** **** 8456', 60, 400);

    // Card Holder Name
    ctx.font = 'bold 28px "Arial"';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(userName.toUpperCase(), 60, 460);

    // Expiry
    ctx.fillStyle = '#cccccc';
    ctx.font = '20px "Arial"';
    ctx.fillText('EXP', 300, 440);
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px "Arial"';
    ctx.fillText('12/29', 300, 465);

    // VISA LOGO Style Text
    ctx.font = 'bold italic 40px "Arial"';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('VISA', width - 60, 460);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'italic 18px "Arial"';
    ctx.fillText('Infinite', width - 60, 480);


    // === Save & Send ===
    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    
    const filePath = path.join(cacheDir, `bal_premium_${senderID}.png`);
    fs.writeFileSync(filePath, canvas.toBuffer('image/png'));

    await api.sendMessage({
      body: `✨ 𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗕𝗔𝗟𝗔𝗡𝗖𝗘 𝗖𝗔𝗥𝗗 ✨\n👤 Holder: ${userName}`,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => fs.unlinkSync(filePath), messageID);

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ কার্ড জেনারেট করতে সমস্যা হয়েছে।", threadID, messageID);
  }
};
    
