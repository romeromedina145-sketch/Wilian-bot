import { config } from '../config.js';
import { checkRankUpdate } from './rpg-avisos.js';

const dungeonCommand = {
    name: 'mazmorra',
    alias: ['dungeon', 'explorar'],
    category: 'rpg',
    desc: 'Explora las profundidades para obtener materiales raros y tesoros.',
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
                    materials: { hierro: 0, obsidiana: 0, huesos: 0, pergaminos: 0 }, 
                    minerals: { diamantes: 0, rubies: 0, esmeraldas: 0, zafiros: 0, amatistas: 0, perlas: 0, oro: 0 },
                    lastDungeon: 0,
                    rank: 'Novato de las Cuevas'
                };
            }

            const userData = chatDb.rpg[userJid];
            const cooldown = 15 * 60 * 1000; 

            const now = Date.now();
            const timePassed = now - (userData.lastDungeon || 0);

            if (timePassed < cooldown) {
                const timeLeft = cooldown - timePassed;
                const min = Math.floor(timeLeft / 60000);
                const sec = Math.floor((timeLeft % 60000) / 1000);
                return m.reply(`*${config.visuals.emoji2}* ¡Tus heridas aún no sanan! Podrás volver a la mazmorra en **${min}m ${sec}s**.`);
            }

            const rewards = {
                hierro: Math.floor(Math.random() * 12),
                obsidiana: Math.floor(Math.random() * 5),
                huesos: Math.floor(Math.random() * 15),
                pergaminos: Math.floor(Math.random() * 3),
                coins: Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000 
            };

            if (!userData.materials) userData.materials = { hierro: 0, obsidiana: 0, huesos: 0, pergaminos: 0 };

            for (let key in rewards) {
                if (key !== 'coins') {
                    userData.materials[key] = (userData.materials[key] || 0) + rewards[key];
                }
            }
            
            userData.lastDungeon = now;
            userDb.wallet = (userDb.wallet || 0) + rewards.coins;

            await checkRankUpdate(conn, m, userJid, groupJid);

            const displayShortName = conn.user.shortName || config.botName;
            const textoExito = `*${config.visuals.emoji3}* \`MAZMORRA ${displayShortName.toUpperCase()}\` *${config.visuals.emoji3}*\n\n¡Has sobrevivido a las profundidades de la mazmorra! Botín obtenido:\n\n⛓️ *Hierro:* ${rewards.hierro}\n🏮 *Obsidiana:* ${rewards.obsidiana}\n🦴 *Huesos:* ${rewards.huesos}\n📜 *Pergaminos:* ${rewards.pergaminos}\n\n💰 *Tesoro hallado:* ¥${rewards.coins.toLocaleString()} coins \n\n> ¡El peligro aumenta, pero las recompensas también!`;

            await conn.sendMessage(m.chat, { text: textoExito }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en la mazmorra.`);
        }
    }
};

export default dungeonCommand;