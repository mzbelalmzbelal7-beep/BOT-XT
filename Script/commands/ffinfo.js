const axios = require("axios");

module.exports.config = {
name: "ff",
version: "1.0.0",
hasPermssion: 0,
credits: "SHAHADAT SAHU", //Don't Change Credit ✅
description: "Free Fire info",
commandCategory: "FreeFire",
usages: "ff <UID>",
cooldowns: 3
};

const rankNames = ["Bronze","Silver","Gold","Platinum","Diamond","Heroic","Grandmaster"];

module.exports.run = async function({ api, event, args }) {
const { threadID } = event;
const uid = args[0];
if (!uid) return api.sendMessage("একটি UID দিন! Example: ff 1795909601", threadID);

let msg;  
try {   
    msg = await api.sendMessage("🔍 Searching Free Fire player...", threadID);   
} catch {   
    msg = { messageID: null };   
}  
const msgID = msg.messageID;  

const regions = ["BD","IN","SG","ID","BR","VN","TH"];  
let found = false, data, usedRegion;  

for (const region of regions) {  
    try {  
        const res = await axios.get(`https://info-ob49.vercel.app/api/account/?uid=${uid}&region=${region}`);  
        if (res.data.basicInfo && !res.data.error) {  
            data = res.data;  
            usedRegion = region;  
            found = true;  
            break;  
        }  
    } catch {}  
}  

if (!found) {  
    try { await api.editMessage("Player পাওয়া যায়নি! সঠিক UID দিন!✔️", msgID); }   
    catch { await api.sendMessage("Player পাওয়া যায়নি! সঠিক UID দিন!✔️", threadID); }  
    return;  
}  

const b = data.basicInfo || {};  
const p = data.profileInfo || {};  
const c = data.clanBasicInfo || {};  


const totalMatches = b.totalMatches || 0;  
const wins = b.wins || 0;  
const totalKills = b.totalKills || 0;  
const totalDeaths = b.totalDeaths || 0;  

const winRate = totalMatches > 0 ? ((wins/totalMatches)*100).toFixed(2) : "0.00";  
const kdRatio = totalDeaths > 0 ? (totalKills/totalDeaths).toFixed(2) : "∞";  
const headshotRate = b.headshotRate != null ? b.headshotRate.toFixed(2) : "N/A";  
const created = b.createTime ? new Date(b.createTime).toLocaleString() : "N/A";  

const csRankName = (b.csRank > 0 && b.csRank <= rankNames.length) ? rankNames[b.csRank-1] : "N/A";  
const brRankName = (b.brRank > 0 && b.brRank <= rankNames.length) ? rankNames[b.brRank-1] : "N/A";  

const loadingSteps = [  
    "✨ Preparing profile data...",  
    "⚡ Fetching stats...",  
    "📊 Calculating K/D, Win Rate...",  
    "🎯 Almost done..."  
];  

async function safeEditMessage(api, msgID, text) {  
    try {  
        if (!msgID) return api.sendMessage(text, threadID);  
        await Promise.race([  
            api.editMessage(text, msgID),  
            new Promise((_, reject) => setTimeout(() => reject("timeout"), 3000))  
        ]);  
    } catch (err) {  
        console.warn("Edit message failed or timeout:", err);  
        if (!msgID) await api.sendMessage(text, threadID);  
    }  
}  

 
for (const step of loadingSteps) {  
    await new Promise(r => setTimeout(r, 800));  
    if (msgID) await safeEditMessage(api, msgID, `🔄 ${step}`);  
}  

await new Promise(r => setTimeout(r, 200));  

const finalMsg = `┏━━[ 𝐅𝐅 𝐏𝐋𝐀𝐘𝐄𝐑 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 ]━━┓

┃
┃ ✦ 𝐏𝐄𝐑𝐒𝐎𝐍𝐀𝐋 𝐈𝐍𝐅𝐎
┃ 𝐔𝐈𝐃 ⤷ ${b.accountId || uid}
┃ 𝐍𝐀𝐌𝐄 ⤷ ${b.nickname || "N/A"}
┃ 𝐑𝐄𝐆𝐈𝐎𝐍 ⤷ ${usedRegion || "N/A"}
┃ 𝐋𝐄𝐕𝐄𝐋 ⤷ ${b.level || 0}
┃ 𝐋𝐈𝐊𝐄𝐃 ⤷ ${b.likes || 0}
┃ 𝐒𝐈𝐆𝐍𝐀𝐓𝐔𝐑𝐄 ⤷ ${p.signature || "N/A"}
┃
┃ ✦ 𝐒𝐓𝐀𝐓𝐒
┃ 𝐌𝐀𝐓𝐂𝐇𝐄𝐒 ⤷ ${totalMatches}
┃ 𝐖𝐈𝐍𝐒 ⤷ ${wins}
┃ 𝐊𝐈𝐋𝐋𝐒 ⤷ ${totalKills}
┃ 𝐃𝐄𝐀𝐓𝐇𝐒 ⤷ ${totalDeaths}
┃ 𝐇𝐄𝐀𝐃𝐒𝐇𝐎𝐓 𝐑𝐀𝐓𝐄 ⤷ ${headshotRate}%
┃ 𝐖𝐈𝐍 𝐑𝐀𝐓𝐄 ⤷ ${winRate}%
┃ 𝐊/𝐃 𝐑𝐀𝐓𝐈𝐎 ⤷ ${kdRatio}
┃
┃ ✦ 𝐑𝐀𝐍𝐊𝐈𝐍𝐆
┃ 𝐂𝐒 𝐑𝐀𝐍𝐊 ⤷ ${csRankName} (${b.csRankPoints || 0} RP)
┃ 𝐁𝐑 𝐑𝐀𝐍𝐊 ⤷ ${brRankName} (${b.brRankPoints || 0} RP)
┃
┃ ✦ 𝐏𝐄𝐓 & 𝐂𝐇𝐀𝐑𝐀𝐂𝐓𝐄𝐑
┃ 𝐏𝐄𝐓 ⤷ ${p.petId || "N/A"}
┃ 𝐂𝐇𝐀𝐑𝐀𝐂𝐓𝐄𝐑 ⤷ ${p.characterId || "N/A"}
┃
┃ ✦ 𝐆𝐔𝐈𝐋𝐃
┃ 𝐍𝐀𝐌𝐄 ⤷ ${c.clanName || "N/A"}
┃ 𝐋𝐄𝐕𝐄𝐋 ⤷ ${c.clanLevel || 0}
┃ 𝐌𝐄𝐌𝐁𝐄𝐑𝐒 ⤷ ${c.membersCount || 0}/${c.maxMembers || 0}
┃
┃ ✦ 𝐀𝐂𝐂𝐎𝐔𝐍𝐓 𝐓𝐈𝐌𝐄
┃ 𝐂𝐑𝐄𝐀𝐓𝐄𝐃 ⤷ ${created}
┃
👑 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿:❈⋆⃝চাঁদেড়~পাহাড়✿⃝
┗━━━━━━━━━━━━━━━━━━━━━━┛`;

await safeEditMessage(api, msgID, finalMsg);

};
