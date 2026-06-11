import { config } from '../config.js';

const sadAction = {
    name: 'sad',
    alias: ['triste', 'llorar'],
    category: 'reactions',
    desc: 'Expresa tristeza o llora.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.key.participant || m.quoted.key.remoteJid : null;

        const videos = [
            'https://upload.yotsuba.giize.com/u/Mrw-uFZA.mp4',
            'https://upload.yotsuba.giize.com/u/33qHGcRe.mp4',
            'https://upload.yotsuba.giize.com/u/5nZ-oHnZ.mp4',
            'https://upload.yotsuba.giize.com/u/P2jFWg2d.mp4',
            'https://upload.yotsuba.giize.com/u/CJpO-vLB.mp4'
        ];

        const randomVideo = videos[Math.floor(Math.random() * videos.length)];

        const sender = m.sender.split('@')[0].split(':')[0];
        let caption = '';
        let mentions = [m.sender];

        if (who) {
            const receiver = who.split('@')[0].split(':')[0];
            const cleanTargetJid = receiver + '@s.whatsapp.net';
            caption = `*${config.visuals.emoji3}* @${sender} está muy triste por @${receiver}... 😭`;
            mentions.push(cleanTargetJid);
        } else {
            caption = `*${config.visuals.emoji3}* @${sender} está muy triste... 😭`;
        }

        await conn.sendMessage(m.chat, { 
            video: { url: randomVideo }, 
            caption: caption,
            gifPlayback: true,
            mentions: mentions
        }, { quoted: m });
    }
};

export default sadAction;