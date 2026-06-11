import { config } from '../config.js';
import { frasesParejas } from './frases/fun/parejas.js';

const formarpareja5 = {
    name: 'formarpareja5',
    alias: ['formar5'],
    category: 'fun',
    desc: 'Forma 5 parejas al azar en el grupo.',
    noPrefix: true,

    run: async (conn, m) => {
        const groupMetadata = await conn.groupMetadata(m.chat);
        const participants = groupMetadata.participants.map(p => p.id);
        
        if (participants.length < 10) return m.reply('Necesito al menos 10 personas para formar 5 parejas.');

        const shuffle = participants.sort(() => 0.5 - Math.random());
        let mentions = [];
        let text = `*${config.visuals.emoji3} LAS 5 PAREJAS DEL GRUPO ${config.visuals.emoji3}*\n\n`;

        for (let i = 0; i < 5; i++) {
            const u1 = shuffle[i * 2];
            const u2 = shuffle[i * 2 + 1];
            const frase = frasesParejas[Math.floor(Math.random() * frasesParejas.length)];
            
            text += `*${i + 1}.* @${u1.split('@')[0]} ❤️ @${u2.split('@')[0]}\n> ${frase}\n\n`;
            mentions.push(u1, u2);
        }

        await conn.sendMessage(m.chat, { 
            text: text.trim(), 
            mentions: mentions 
        }, { quoted: m });
    }
};

export default formarpareja5;