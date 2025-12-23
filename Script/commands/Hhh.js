var mysterious = "Siegfried Sama";
const request = require("request");
const fs = require("fs")
const axios = require("axios")
module.exports.config = {
  name: "hhh",
  version: "3.0.0",
  hasPermssion: 0,
  credits: `${mysterious}`,
  description: "girl to boy slap",
  commandCategory: "...",
  usages: "[tag]",
  cooldowns: 5,
};

module.exports.run = async({ api, event, Threads, global }) => {
  var link = [
"https://i.imgur.com/AOsqr9I.gif",
"https://i.imgur.com/AjBUT46.gif",
"https://i.imgur.com/nAAnaT6.gif",
"https://i.imgur.com/KFVJ7f0.gif",
"https://i.imgur.com/iDh2fpc.gif",
"https://i.imgur.com/k8kTWL3.gif",
"https://i.imgur.com/XjkgvlV.gif",
"https://i.imgur.com/LUZG4Kr.gif",
"https://i.imgur.com/VCbqfmW.gif",
"https://i.imgur.com/ABd46Qp.gif",
"https://i.imgur.com/MH6qoWl.gif",
"https://i.imgur.com/ojj62z0.gif",
"https://i.imgur.com/3qmpK79.gif",
"https://i.imgur.com/FctLFUH.gif",
"https://i.imgur.com/HUS7pKS.gif",
"https://i.imgur.com/PAxal0O.gif",
"https://i.imgur.com/3TOzKPE.gif",
"https://i.imgur.com/Xy4RD4b.gif",
"https://i.imgur.com/npOzDPs.gif",
"https://i.imgur.com/9aBtiwE.gif",
"https://i.imgur.com/BizXRvm.gif",
"https://i.imgur.com/lmnnGBg.gif",
"https://i.imgur.com/j10gZv3.gif",
"https://i.imgur.com/lKgtja5.gif",
"https://i.imgur.com/IjINErh.gif",
"https://i.imgur.com/buQCZJx.gif",
"https://i.imgur.com/kDpH2DN.gif",
"https://i.imgur.com/N7p6H5A.gif",
"https://i.imgur.com/dQUd3Zh.gif",
"https://i.imgur.com/oQf1iwl.gif",
"https://i.imgur.com/l8EpeGm.gif",
"https://i.imgur.com/p9aGjlu.gif",
"https://i.imgur.com/XoUfM1L.gif",
"https://i.imgur.com/AN64ISY.gif",
"https://i.imgur.com/gxuefLX.gif",
"https://i.imgur.com/nivOa3P.gif",
"https://i.imgur.com/VWfwWs0.gif",
"https://i.imgur.com/uJZbULR.gif",
"https://i.imgur.com/vnOInOk.gif",
"https://i.imgur.com/FyftWV3.gif",
"https://i.imgur.com/OOMPEtQ.gif",
"https://i.imgur.com/xSvwdlh.gif",
"https://i.imgur.com/4GwjZlh.gif",
"https://i.imgur.com/dSlZzkV.gif",
"https://i.imgur.com/GQNmfYF.gif",
"https://i.imgur.com/BApeRez.gif",
"https://i.imgur.com/dABPaKh.gif",
"https://i.imgur.com/6pwEjg1.gif",
"https://i.imgur.com/nkarRdc.gif",
"https://i.imgur.com/2UjXCYz.gif",
"https://i.imgur.com/SfvtcBZ.gif",
];
   var mention = Object.keys(event.mentions);
     let tag = event.mentions[mention].replace("@", "");
    if (!mention) return api.sendMessage("Mention 1 person that you want to f*** you ", threadID, messageID);
   var callback = () => api.sendMessage({body:`╭──────•◈•───────╮\n  \n\n 🖕🖕 ${tag}` + `\n\n  এই হাত মারা মাগি আই খেলব  🥵 🤏\n\n \n╰──────•◈•───────╯`,mentions: [{tag: tag,id: Object.keys(event.mentions)[0]}],attachment: fs.createReadStream(__dirname + "/cache/slap.gif")}, event.threadID, () => fs.unlinkSync(__dirname + "/cache/slap.gif"));  
      return request(encodeURI(link[Math.floor(Math.random() * link.length)])).pipe(fs.createWriteStream(__dirname+"/cache/slap.gif")).on("close",() => callback());
              }
