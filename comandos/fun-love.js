import { config } from '../config.js';

const loveCommand = {
    name: 'love',
    alias: ['amor', 'afinidad'],
    category: 'fun',
    desc: 'Calcula el amor entre tú y otra persona.',
    noPrefix: true,

    run: async (conn, m, args) => {
        const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.key.participant || m.quoted.key.remoteJid : null;

        if (!who) return m.reply(`*${config.visuals.emoji2}* Menciona a alguien para calcular el amor.`);

        const lovePercentage = Math.floor(Math.random() * 100);
        const sender = m.sender.split('@')[0].split(':')[0];
        const target = who.split('@')[0].split(':')[0];
        const cleanTargetJid = target + '@s.whatsapp.net';

        let message = '';
        if (lovePercentage >= 80) message = '¡Una pareja perfecta! ❤️';
        else if (lovePercentage >= 50) message = 'Hay una buena conexión. ✨';
        else if (lovePercentage >= 20) message = 'Podría funcionar, tal vez... 🤔';
        else message = 'Mejor queden como amigos. 🧊';

        const caption = `*${config.visuals.emoji3} MEDIDOR DE AMOR ${config.visuals.emoji3}*\n\n*De:* @${sender}\n*Para:* @${target}\n\nEl nivel de amor es del *${lovePercentage}%*\n\n> ${message}`;

        await conn.sendMessage(m.chat, { 
            text: caption,
            mentions: [m.sender, cleanTargetJid]
        }, { quoted: m });
    }
};

export default loveCommand;