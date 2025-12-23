module.exports.config = {
  name: "Facebook",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "YourName",
  description: "মেসেঞ্জারে ফেসবুকের লিংক শেয়ার করে ইউজারকে ফেসবুক খুলতে সাহায্য করে",
  commandCategory: "other",
  usages: "/facebook",
  cooldowns: 5,
};

module.exports.run = async ({ api, event }) => {
  const fbLink = "https://www.facebook.com/";

  return api.sendMessage(
    `🌐 ফেসবুক খুলতে নিচের লিংকে ক্লিক করুন:\n${fbLink}`,
    event.threadID,
    event.messageID
  );
};
