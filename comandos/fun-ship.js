import { config } from '../config.js';

const shipCommand = {
    name: 'ship',
    alias: ['pareja', 'shipear'],
    category: 'fun',
    desc: 'El bot elige una pareja al azar en el grupo.',
    noPrefix: true,

    run: async (conn, m) => {
        const groupMetadata = await conn.groupMetadata(m.chat);
        const participants = groupMetadata.participants.map(p => p.id);
        
        if (participants.length < 2) return m.reply('No hay suficientes personas aquí.');

        const user1 = participants[Math.floor(Math.random() * participants.length)];
        let user2 = participants[Math.floor(Math.random() * participants.length)];

        while (user1 === user2) {
            user2 = participants[Math.floor(Math.random() * participants.length)];
        }

        const tag1 = user1.split('@')[0].split(':')[0];
        const tag2 = user2.split('@')[0].split(':')[0];

        const caption = `*${config.visuals.emoji3} LA PAREJA DEL DÍA ${config.visuals.emoji3}*\n\n@${tag1} ❤️ @${tag2}\n\n¡Hacen una pareja increíble! 🥂`;

        await conn.sendMessage(m.chat, { 
            text: caption,
            mentions: [user1, user2]
        }, { quoted: m });
    }
};

export default shipCommand;