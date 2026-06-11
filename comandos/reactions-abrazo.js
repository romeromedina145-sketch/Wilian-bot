import { config } from '../config.js';

const kissAction = {
    name: 'kiss',
    alias: ['beso', 'besar'],
    category: 'reactions',
    desc: 'Le da un beso a alguien.',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            let who;
            if (m.mentionedJid && m.mentionedJid[0]) {
                who = m.mentionedJid[0];
            } else if (m.quoted) {
                who = m.quoted.sender;
            } else if (args[0] && args[0].includes('@')) {
                who = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            }

            const videos = [
                'https://upload.yotsuba.giize.com/u/mFLRwpm4.mp4',
                'https://upload.yotsuba.giize.com/u/nRPuGbY4.mp4',
                'https://upload.yotsuba.giize.com/u/EoSVahci.mp4',
                'https://upload.yotsuba.giize.com/u/6rJY7zg-.mp4',
                'https://upload.yotsuba.giize.com/u/oV99Gb24.mp4'
            ];

            const randomVideo = videos[Math.floor(Math.random() * videos.length)];
            const sender = m.sender.split('@')[0].split(':')[0];
            let caption = '';
            let mentions = [m.sender];

            if (who) {
                const receiver = who.split('@')[0].split(':')[0];
                const cleanTargetJid = receiver + '@s.whatsapp.net';
                caption = `*${config.visuals.emoji3}* ¡@${sender} le dio un tierno beso a @${receiver}! 😘`;
                mentions.push(cleanTargetJid);
            } else {
                caption = `*${config.visuals.emoji3}* @${sender} está repartiendo besos! 💋`;
            }

            await conn.sendMessage(m.chat, { 
                video: { url: randomVideo }, 
                caption: caption,
                gifPlayback: true,
                mentions: mentions
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al enviar el beso.`);
        }
    }
};

export default kissAction;