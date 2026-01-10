const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
    name: "youai",
    version: "2.5",
    hasPermssion: 0,
    credits: "nexo_here",
    description: "AI চ্যাট এবং ছবি থেকে এনিমেশন ভিডিও তৈরি",
    commandCategory: "ai",
    usages: "[প্রশ্ন অথবা ছবির রিপ্লাই]",
    cooldowns: 10,
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, type, messageReply } = event;
    const input = args.join(" ");

    // ১. ছবি থেকে এনিমেশন করার সিস্টেম (যদি ছবির রিপ্লাই দেওয়া হয়)
    if (type === "message_reply" && messageReply.attachments[0]?.type === "photo") {
        const imageUrl = encodeURIComponent(messageReply.attachments[0].url);
        const path = __dirname + `/cache/anime_video_${event.senderID}.mp4`;

        api.sendMessage("⏳ আপনার ছবি থেকে এনিমেশন ভিডিও তৈরি করছি, একটু অপেক্ষা করুন...", threadID, messageID);

        try {
            // এনিমেশন API (ছবির ইউআরএল পাঠিয়ে ভিডিও নেওয়া)
            const videoUrl = `https://betadash-api-swordslush-production.up.railway.app/anime?url=${imageUrl}`;
            
            const response = await axios.get(videoUrl, { responseType: "arraybuffer" });
            fs.writeFileSync(path, Buffer.from(response.data, "utf-8"));

            return api.sendMessage({
                body: "✅ আপনার এনিমেশন ভিডিও তৈরি হয়ে গেছে!",
                attachment: fs.createReadStream(path)
            }, threadID, () => fs.unlinkSync(path), messageID);

        } catch (err) {
            return api.sendMessage("❌ দুঃখিত! এই মুহূর্তে ভিডিও তৈরি করা সম্ভব হচ্ছে না।", threadID, messageID);
        }
    }

    // ২. সাধারণ চ্যাট সিস্টেম (যদি শুধু টেক্সট থাকে)
    if (!input) {
        return api.sendMessage("⚠️ দয়া করে কিছু লিখুন অথবা একটি ছবির রিপ্লাইয়ে কমান্ডটি দিন।", threadID, messageID);
    }

    api.sendMessage("🧠 ভাবছি...", threadID, messageID);

    try {
        const res = await axios.get(`https://betadash-api-swordslush-production.up.railway.app/you?chat=${encodeURIComponent(input)}`);
        const data = res.data;

        if (!data || !data.response) return api.sendMessage("❌ AI কোনো উত্তর দিতে পারছে না।", threadID, messageID);

        const related = data.relatedSearch?.length > 0 
            ? "\n\n💡 সম্পর্কিত:\n" + data.relatedSearch.map(r => `• ${r}`).join("\n") 
            : "";

        return api.sendMessage(`🧠 **You AI:**\n\n${data.response}${related}`, threadID, messageID);

    } catch (err) {
        return api.sendMessage("❌ সার্ভার সমস্যা! আবার চেষ্টা করুন।", threadID, messageID);
    }
};
