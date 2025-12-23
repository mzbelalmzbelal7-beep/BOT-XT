const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const request = require('request');

module.exports.config = {
    name: '\n',
    version: '1.0.0',
    hasPermssion: 0,
    credits: 'BELAL BOTX666',
    description: 'This command is for using my bot in your group.',
    commandCategory: 'Info',
    usages: '/',
    cooldowns: 11,
    dependencies: {
        'request': '',
        'fs-extra': '',
        'axios': ''
    }
};

module.exports.run = async function({ api, event }) {
    const Stream = require('fs-extra');

    // একবারে পুরো লেখা
    const messageBody = `🌸 Assalamualaikum 🌸  
🌺🌼 আমি আশা করি আপনি এই বট ব্যবহার করে অনেক মজা পাবেন ✨
অন্যান্য বট থেকে আমার বট সব থেকে পাওয়ারফুল এইজন্যই এটা ব্যবহার করতে আপনি বেশি পছন্দ করবেন।
আপনি চাইলে এটি আপনার গ্রুপে ও নিয়ে যেতে পারেন !🎉🤗  

☢️ To view any command 📌  
☺️ Me AI chatbot ☢️ 
😈 My name Bot for baby 🍼 
⭐ model BOTX666 🖥️
🥰 My Admin চাঁদের পাহাড় ✡️ 
🪬 Owner Belal YT
📩 help for admin https://www.facebook.com/mahi.gaming.165
/Help  
/Bot  
/Info  

𝐁𝐨𝐭 𝐎𝐰𝐧𝐞𝐫➢ ┄┉❈✡️⋆⃝চাঁদেড়~পাহাড়✿⃝🪬❈┉┄`;

    // লোকাল ফাইল path
    const filePath = path.join(__dirname, 'cyber.jpg');

    // নতুন ইমেজ লিংকগুলো
    const images = [
        'https://i.imgur.com/IZZa8RL.jpeg',
        'https://i.imgur.com/eTxOTwc.jpeg',
        'https://i.imgur.com/qSjYag6.jpeg',
        'https://i.imgur.com/vpPt78y.jpeg',
        'https://i.imgur.com/CRPz9BU.jpeg',
        'https://i.imgur.com/qSjYag6.jpeg',
        'https://i.imgur.com/CNJi9p7.jpeg'
        
    ];

    // র্যান্ডম ইমেজ বেছে নেওয়া
    const imageUrl = images[Math.floor(Math.random() * images.length)];
    const imageStream = request.get(encodeURI(imageUrl)).pipe(Stream.createWriteStream(filePath));

    // ইমেজ ডাউনলোড শেষ হলে মেসেজ পাঠানো
    imageStream.on('close', () => {
        api.sendMessage(
            {
                body: messageBody,
                attachment: Stream.createReadStream(filePath)
            },
            event.threadID,
            () => Stream.unlinkSync(filePath) // পাঠানোর পরে ফাইল ডিলিট
        );
    });
};
