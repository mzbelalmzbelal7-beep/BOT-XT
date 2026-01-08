const axios = require('axios');

module.exports.config = {
    name: "bby",
    version: "6.9.0",
    hasPermssion: 0,
    credits: "dipto",
    description: "Better than SimSimi (Mirai Version)",
    commandCategory: "chat",
    usages: "[anyMessage] OR teach [YourMessage] - [Reply]",
    cooldowns: 2,
};

const baseApiUrl = "https://noobs-api.top/dipto";

module.exports.run = async function ({ api, event, args, Users }) {
    const link = `${baseApiUrl}/baby`;
    const dipto = args.join(" ").toLowerCase();
    const uid = event.senderID;
    const { threadID, messageID } = event;
    let command, comd, final;

    try {
        if (!args[0]) {
            const ran = ["Bolo baby", "hum", "type help baby", "type !baby hi"];
            return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], threadID, messageID);
        }

        if (args[0] === 'remove') {
            const fina = dipto.replace("remove ", "");
            const dat = (await axios.get(`${link}?remove=${fina}&senderID=${uid}`)).data.message;
            return api.sendMessage(dat, threadID, messageID);
        }

        if (args[0] === 'rm' && dipto.includes('-')) {
            const [fi, f] = dipto.replace("rm ", "").split(/\s*-\s*/);
            const da = (await axios.get(`${link}?remove=${fi}&index=${f}`)).data.message;
            return api.sendMessage(da, threadID, messageID);
        }

        if (args[0] === 'list') {
            if (args[1] === 'all') {
                const data = (await axios.get(`${link}?list=all`)).data;
                const limit = parseInt(args[2]) || 10;
                const limited = data?.teacher?.teacherList?.slice(0, limit);
                
                let output = "";
                for (let i = 0; i < limited.length; i++) {
                    const number = Object.keys(limited[i])[0];
                    const value = limited[i][number];
                    const name = (await Users.getNameUser(number)) || number;
                    output += `${i + 1}/ ${name}: ${value}\n`;
                }
                return api.sendMessage(`Total Teach = ${data.length}\n👑 | List of Teachers\n${output}`, threadID, messageID);
            } else {
                const d = (await axios.get(`${link}?list=all`)).data;
                return api.sendMessage(`❇️ | Total Teach = ${d.length || "api off"}\n♻️ | Total Response = ${d.responseLength || "api off"}`, threadID, messageID);
            }
        }

        if (args[0] === 'msg') {
            const fuk = dipto.replace("msg ", "");
            const d = (await axios.get(`${link}?list=${fuk}`)).data.data;
            return api.sendMessage(`Message ${fuk} = ${d}`, threadID, messageID);
        }

        if (args[0] === 'edit') {
            const command = dipto.split(/\s*-\s*/)[1];
            if (!command) return api.sendMessage('❌ | Invalid format!', threadID, messageID);
            const dA = (await axios.get(`${link}?edit=${args[1]}&replace=${command}&senderID=${uid}`)).data.message;
            return api.sendMessage(`Changed: ${dA}`, threadID, messageID);
        }

        if (args[0] === 'teach' && args[1] !== 'amar' && args[1] !== 'react') {
            [comd, command] = dipto.split(/\s*-\s*/);
            final = comd.replace("teach ", "");
            if (!command) return api.sendMessage('❌ | Invalid format!', threadID, messageID);
            const re = await axios.get(`${link}?teach=${final}&reply=${command}&senderID=${uid}&threadID=${threadID}`);
            const teacherName = (await Users.getNameUser(re.data.teacher)) || "User";
            return api.sendMessage(`✅ Replies added: ${re.data.message}\nTeacher: ${teacherName}\nTeachs: ${re.data.teachs}`, threadID, messageID);
        }

        // Default Chat
        const res = await axios.get(`${link}?text=${encodeURIComponent(dipto)}&senderID=${uid}&font=1`);
        const reply = res.data.reply;
        
        return api.sendMessage(reply, threadID, (error, info) => {
            global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: event.senderID
            });
        }, messageID);

    } catch (e) {
        return api.sendMessage("API Error!", threadID, messageID);
    }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
    if (event.senderID == api.getCurrentUserID()) return;
    const link = `${baseApiUrl}/baby`;
    try {
        const res = await axios.get(`${link}?text=${encodeURIComponent(event.body)}&senderID=${event.senderID}&font=1`);
        return api.sendMessage(res.data.reply, event.threadID, (error, info) => {
            global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: event.senderID
            });
        }, event.messageID);
    } catch (e) {
        return api.sendMessage("Error occurred!", event.threadID);
    }
};

module.exports.handleEvent = async function ({ api, event, Users }) {
    if (event.senderID == api.getCurrentUserID() || !event.body) return;
    const { threadID, messageID, body } = event;
    const lowerBody = body.toLowerCase();
    const link = `${baseApiUrl}/baby`;

    if (lowerBody.startsWith("baby") || lowerBody.startsWith("bby") || lowerBody.startsWith("bot")) {
        const text = lowerBody.replace(/^(baby|bby|bot)\s*/, "");
        
        if (!text) {
            const randomReplies = ["😚", "Yes 😀, I am here", "What's up?", "Bolo jaan"];
            return api.sendMessage(randomReplies[Math.floor(Math.random() * randomReplies.length)], threadID, (error, info) => {
                global.client.handleReply.push({
                    name: this.config.name,
                    messageID: info.messageID,
                    author: event.senderID
                });
            }, messageID);
        }

        try {
            const res = await axios.get(`${link}?text=${encodeURIComponent(text)}&senderID=${event.senderID}&font=1`);
            return api.sendMessage(res.data.reply, threadID, (error, info) => {
                global.client.handleReply.push({
                    name: this.config.name,
                    messageID: info.messageID,
                    author: event.senderID
                });
            }, messageID);
        } catch (e) { /* ignore error */ }
    }
};
