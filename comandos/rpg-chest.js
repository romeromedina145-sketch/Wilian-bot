import { config } from '../config.js';
import { chestPhrases } from './frases/rpg/chest.js';
import { checkRankUpdate } from './rpg-avisos.js';

const chestCommand = {
    name: 'cofre',
    alias: ['chest', 'baul', 'botin'],
    category: 'rpg',
    desc: 'Busca tesoros marinos para obtener minerales y coins extra.',
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
                    lastChest: 0,
                    rank: 'Novato de las Cuevas'
                };
            }

            const userData = chatDb.rpg[userJid];
            const tieneEscudo = userDb.inventory?.escudo > 0;
            const cooldown = tieneEscudo ? 5 * 60 * 1000 : 10 * 60 * 1000; 

            const now = Date.now();
            const timePassed = now - (userData.lastChest || 0);

            if (timePassed < cooldown) {
                const timeLeft = cooldown - timePassed;
                const min = Math.floor(timeLeft / 60000);
                const sec = Math.floor((timeLeft % 60000) / 1000);
                return m.reply(`*${config.visuals.emoji2}* ¡Cofre vacío! Debes esperar *${min}m ${sec}s* para buscar otro.${!tieneEscudo ? '\n\n🛡️ *Tip:* El Escudo de Mazmorra reduce este tiempo a la mitad.' : ''}`);
            }

            if (tieneEscudo) {
                userDb.inventory.escudo -= 1;
            }

            const rewards = {
                diamantes: Math.floor(Math.random() * 6),
                rubies: Math.floor(Math.random() * 8),
                esmeraldas: Math.floor(Math.random() * 7),
                zafiros: Math.floor(Math.random() * 10),
                amatistas: Math.floor(Math.random() * 12),
                perlas: Math.floor(Math.random() * 15),
                oro: Math.floor(Math.random() * 20),
                coins: Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000 
            };

            const randomPhrase = chestPhrases[Math.floor(Math.random() * chestPhrases.length)];

            for (let key in rewards) {
                if (key !== 'coins') {
                    userData.minerals[key] = (userData.minerals[key] || 0) + rewards[key];
                }
            }
            userData.lastChest = now;
            userDb.wallet = (userDb.wallet || 0) + rewards.coins;

            await checkRankUpdate(conn, m, userJid, groupJid);

            const displayShortName = conn.user.shortName || config.botName;
            const textoExito = `*${config.visuals.emoji3}* \`COFRE ${displayShortName.toUpperCase()}\` *${config.visuals.emoji3}*\n${tieneEscudo ? '🛡️ *¡ESCUDO ACTIVADO!* Tiempo de espera reducido.\n' : ''}\n${randomPhrase}\n\n💎 *Diamantes:* ${rewards.diamantes}\n🌹 *Rubíes:* ${rewards.rubies}\n🍃 *Esmeraldas:* ${rewards.esmeraldas}\n🔹 *Zafiros:* ${rewards.zafiros}\n🔮 *Amatistas:* ${rewards.amatistas}\n⚪ *Perlas:* ${rewards.perlas}\n📀 *Oro:* ${rewards.oro}\n\n💰 *Extra:* ¥${rewards.coins.toLocaleString()} coins \n\n> ¡El mar siempre tiene tesoros para quienes saben buscar!`;

            await conn.sendMessage(m.chat, { text: textoExito }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al abrir el cofre.`);
        }
    }
};

export default chestCommand;