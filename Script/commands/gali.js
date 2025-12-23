const fs = require("fs");
module.exports.config = {
	name: "gali",
    version: "1.0.1",
	hasPermssion: 0,
	credits: "BELAL BOTX666", 
	description: "no prefix",
	commandCategory: "no prefix",
	usages: "abal",
    cooldowns: 5, 
};

module.exports.handleEvent = function({ api, event, client, __GLOBAL }) {
	var { threadID, messageID } = event;
	if (event.body.indexOf("fuck")==0 || event.body.indexOf("সাওয়া")==0 || event.body.indexOf("বোকাচোদা")==0 || event.body.indexOf("শাওয়া")==0 || event.body.indexOf("খানকির পোলা")==0 || event.body.indexOf("ভালোবাসার মাকে চুদি")==0 || event.body.indexOf("আবাল")==0 || event.body.indexOf("behen chod")==0 || event.body.indexOf("কুত্তার বাচ্চা")==0 || event.body.indexOf("মাদারচোদ")==0 || event.body.indexOf("chudi")==0 || event.body.indexOf("gala gali")==0) {
		var msg = {
				body: "*[ Warning]* 👋 Hey দয়া করে অশালীন ভাষা ব্যবহার করবেন না!⛔ এই মেসেজটি এখনি আনসেন্ড করুন৷🔰 আরও একবার অশালীন ভাষা ব্যবহার করলে আপনি সমস্যায় পড়বেন!)",
			}
			api.sendMessage(msg, threadID, messageID);
		}
	}
	module.exports.run = function({ api, event, client, __GLOBAL }) {

  }
