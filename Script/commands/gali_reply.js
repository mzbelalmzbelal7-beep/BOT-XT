const fs = require("fs");
module.exports.config = {
	name: "gali",
    version: "1.0.1",
	hasPermssion: 0,
	credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️", 
	description: "no prefix",
	commandCategory: "no prefix",
	usages: "abal",
    cooldowns: 5, 
};

module.exports.handleEvent = function({ api, event, client, __GLOBAL }) {
	var { threadID, messageID } = event;
	if (event.body.indexOf("চাঁদের পাহাড় কে চুদি")==0 || event.body.indexOf("🖕")==0 || event.body.indexOf("🖕🖕")==0 || event.body.indexOf(" চাঁদের পাহাড় লুচ্চা")==0 || event.body.indexOf("বোকাচোদা")==0 || event.body.indexOf("এই শালা")==0 || event.body.indexOf("মাগির পোলা")==0 || event.body.indexOf("বালের গ্রুপ")==0 || event.body.indexOf("এই শালা চুপ")==0 || event.body.indexOf("তুই একটা বোকাচোদা")==0 || event.body.indexOf("তোর মাকে চুদি")==0 || event.body.indexOf("বট রে কিক মার")==0) {
		var msg = {
				body: "তোর মতো বোকাচোদা রে আমার বস চাঁদের পাহাড় চু*দা বাদ দিছে🤣\n চাঁদের পাহাড় এখন আর hetars চুষে না🥱 তোরে ওপেনে ভরে দেব 😈",
			}
			api.sendMessage(msg, threadID, messageID);
		}
	}
	module.exports.run = function({ api, event, client, __GLOBAL }) {

}
