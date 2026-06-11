import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const baseGroup = "120363423871589037@g.us";

const waifuInfoCommand = {
    name: 'wi',
    alias: ['gachainfo', 'pjsinfo'],
    category: 'gacha',
    desc: 'Muestra el historial de actividad gacha de un usuario.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const group = m.chat;
            let rawTarget = m.sender;

            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                rawTarget = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.quoted) {
                rawTarget = m.quoted.sender;
            }

            const targetJid = rawTarget.replace(/:.*@/g, '@');
            const userDb = global.db.data.users[targetJid];

            if (!userDb) {
                return m.reply(`*${config.visuals.emoji2}* El usuario no tiene registros en el sistema.`);
            }

            if (!fs.existsSync(gachaPath)) return m.reply('*⚠️* Error: DB Gacha no encontrada.');
            const rawData = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            const plantillaPersonajes = rawData[baseGroup];

            const dbGrupoGacha = global.db.data.chats[group]?.gacha || {};
            let totalPjs = 0;

            for (let id in dbGrupoGacha) {
                const ownerClean = dbGrupoGacha[id].owner.replace(/:.*@/g, '@');
                if (ownerClean === targetJid && plantillaPersonajes[id]) {
                    totalPjs++;
                }
            }

            const ahora = Date.now();

            const formatTime = (lastUsed) => {
                if (!lastUsed || lastUsed === 0) return "*nunca*";
                const diff = ahora - lastUsed;
                const segundos = Math.floor(diff / 1000);
                const minutos = Math.floor(segundos / 60);
                const horas = Math.floor(minutos / 60);
                const dias = Math.floor(horas / 24);

                if (dias > 0) return `hace *${dias}d*`;
                if (horas > 0) return `hace *${horas}h*`;
                if (minutos > 0) return `hace *${minutos}m*`;
                return `hace *${segundos}s*`;
            };

            const lastRw = formatTime(userDb.lastGachaRoll);
            const lastClaim = formatTime(userDb.lastClaimRoll);
            const lastVote = formatTime(userDb.lastVote);
            const lastSell = formatTime(userDb.lastSell);
            const lastBuy = formatTime(userDb.lastBuy);

            const userId = targetJid.split('@')[0];

            let message = `*${config.visuals.emoji3}* \`Gacha de\` *${config.visuals.emoji3}*\n\n`;
            message += `› @${userId}\n\n`;
            message += `ⴵ Último Roll » ${lastRw}\n`;
            message += `ⴵ Último Claim » ${lastClaim}\n`;
            message += `ⴵ Último Voto » ${lastVote}\n`;
            message += `ⴵ Última Venta » ${lastSell}\n`;
            message += `ⴵ Última Compra » ${lastBuy}\n\n`;
            message += `*🎴* Personajes totales » *${totalPjs}*`;

            await conn.sendMessage(m.chat, { 
                text: message,
                mentions: [targetJid]
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply('Error al obtener la información gacha.');
        }
    }
};

export default waifuInfoCommand;