import { config } from '../config.js';

const happyAction = {
    name: 'happy',
    alias: ['feliz', 'alegre'],
    category: 'reactions',
    desc: 'Expresa felicidad.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.key.participant || m.quoted.key.remoteJid : null;

        const videos = [
            'https://upload.yotsuba.giize.com/u/QioL0YX9.mp4',
            'https://upload.yotsuba.giize.com/u/eMMFd626.mp4',
            'https://upload.yotsuba.giize.com/u/egzV035O.mp4',
            'https://upload.yotsuba.giize.com/u/k6uePKPj.mp4',
            'https://upload.yotsuba.giize.com/u/DI9xdna4.mp4'
        ];

        const randomVideo = videos[Math.floor(Math.random() * videos.length)];

        const sender = m.sender.split('@')[0].split(':')[0];
        let caption = '';
        let mentions = [m.sender];

        if (who) {
            const receiver = who.split('@')[0].split(':')[0];
            const cleanTargetJid = receiver + '@s.whatsapp.net';
            caption = `*${config.visuals.emoji3}* @${sender} está muy feliz por @${receiver}! ✨`;
            mentions.push(cleanTargetJid);
        } else {
            caption = `*${config.visuals.emoji3}* @${sender} está muy feliz! ✨`;
        }

        await conn.sendMessage(m.chat, { 
            video: { url: randomVideo }, 
            caption: caption,
            gifPlayback: true,
            mentions: mentions
        }, { quoted: m });
    }
};

export default happyAction;