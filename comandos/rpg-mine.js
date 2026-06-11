import { config } from '../config.js';
import { checkRankUpdate } from './rpg-avisos.js';

const mineCommand = {
    name: 'mine',
    alias: ['minar'],
    category: 'rpg',
    desc: 'Extrae minerales valiosos de las minas. Usa un imán para duplicar recursos.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const groupJid = m.chat;
            const userJid = m.sender.replace(/:.*@/g, '@');
            
            const userDb = global.db.data.users[userJid];
            const chatDb = global.db.data.chats[groupJid];

            if (!chatDb.rpg) chatDb.rpg = {};
            if (!chatDb.rpg[userJid]) {
                chatDb.rpg[userJid] = { 
                    minerals: { diamantes: 0, rubies: 0, esmeraldas: 0, zafiros: 0, amatistas: 0, perlas: 0, oro: 0 }, 
                    lastMine: 0,
                    rank: 'Novato de las Cuevas'
                };
            }

            const userData = chatDb.rpg[userJid];
            const cooldown = 5 * 60 * 1000; 
            const now = Date.now();
            const timePassed = now - (userData.lastMine || 0);

            if (timePassed < cooldown) {
                const timeLeft = cooldown - timePassed;
                const min = Math.floor(timeLeft / 60000);
                const sec = Math.floor((timeLeft % 60000) / 1000);
                return m.reply(`*${config.visuals.emoji2}* ¡Descansa! Podrás volver a minar en **${min}m ${sec}s**.`);
            }

            const tieneIman = userDb.inventory?.iman > 0;
            const rewards = {
                diamantes: Math.floor(Math.random() * 3),
                rubies: Math.floor(Math.random() * 5),
                esmeraldas: Math.floor(Math.random() * 4),
                zafiros: Math.floor(Math.random() * 6),
                amatistas: Math.floor(Math.random() * 8),
                perlas: Math.floor(Math.random() * 10),
                oro: Math.floor(Math.random() * 15),
                coins: Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000 
            };

            if (tieneIman) {
                for (let key in rewards) rewards[key] *= 2;
                userDb.inventory.iman -= 1;
            }

            for (let key in rewards) {
                if (key !== 'coins') userData.minerals[key] = (userData.minerals[key] || 0) + rewards[key];
            }
            
            userData.lastMine = now;
            userDb.wallet = (userDb.wallet || 0) + rewards.coins;

            await checkRankUpdate(conn, m, userJid, groupJid);

            const displayShortName = conn.user.shortName || config.botName;
            let extraInfo = tieneIman ? `\n🧲 *¡EFECTO IMÁN ACTIVADO!* Recursos duplicados.\n` : '';
            
            const textoExito = `*${config.visuals.emoji3}* \`MINERÍA ${displayShortName.toUpperCase()}\` *${config.visuals.emoji3}*\n${extraInfo}\nRecursos obtenidos:\n\n💎 *Diamantes:* ${rewards.diamantes}\n🌹 *Rubíes:* ${rewards.rubies}\n🍃 *Esmeraldas:* ${rewards.esmeraldas}\n🔹 *Zafiros:* ${rewards.zafiros}\n🔮 *Amatistas:* ${rewards.amatistas}\n⚪ *Perlas:* ${rewards.perlas}\n📀 *Oro:* ${rewards.oro}\n\n💰 *Extra:* ¥${rewards.coins.toLocaleString()} coins \n\n> ¡Sigue excavando para subir de rango!`;

            await conn.sendMessage(m.chat, { text: textoExito }, { quoted: m });
        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en el sistema de minas.`);
        }
    }
};

export default mineCommand;