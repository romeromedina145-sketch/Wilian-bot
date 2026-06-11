import fs from 'fs';
import path from 'path';
import { config } from '../config.js';
import { database } from '../database.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const baseGroup = "120363423871589037@g.us";

const haremCommand = {
    name: 'harem',
    alias: ['mis-pjs'],
    category: 'gacha',
    desc: 'Visualiza la colección de personajes que has reclamado en este grupo.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        try {
            const group = m.chat;
            let targetJid = m.sender;
            let page = 1;

            if (args && args.length > 0) {
                const lastArg = args[args.length - 1];
                if (!isNaN(lastArg)) page = parseInt(lastArg);
            }

            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.quoted) {
                targetJid = m.quoted.sender || m.quoted.key.participant;
            }

            if (!fs.existsSync(gachaPath)) return m.reply(`*${config.visuals.emoji2}* Error: Base de datos no encontrada.`);
            const rawData = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            const plantillaPersonajes = rawData[baseGroup];

            const userPjs = await database.getHarem(group, targetJid);

            if (!userPjs || userPjs.length === 0) {
                const isMe = targetJid === m.sender;
                return m.reply(isMe ? `*${config.visuals.emoji2}* Aún no tienes personajes reclamados.` : `*${config.visuals.emoji2}* El usuario no tiene personajes.`);
            }

            let misPjs = userPjs.map(dbPj => ({
                ...plantillaPersonajes[dbPj.character_id],
                id_db: dbPj.character_id
            })).filter(pj => pj && pj.name);

            misPjs.sort((a, b) => b.value - a.value);

            const itemsPerPage = 5;
            const totalPages = Math.ceil(misPjs.length / itemsPerPage);
            if (page > totalPages || page <= 0) page = 1;

            const start = (page - 1) * itemsPerPage;
            const currentPjs = misPjs.slice(start, start + itemsPerPage);

            const mentionId = targetJid.split('@')[0].split(':')[0];
            let txt = `*${config.visuals.emoji3} \`HAREM DEL USUARIO\` ${config.visuals.emoji3}*\n\n`;
            txt += `» @${mentionId} (${misPjs.length} personajes)\n`;
            txt += `*✰ Página »* ${page} de ${totalPages}\n\n`;

            currentPjs.forEach((pj) => {
                txt += `› ${pj.name} \`[${pj.id_db}]\` - $${pj.value.toLocaleString()} coins\n`;
            });

            txt += `\n> ¡Presume tu gran colección ante todo el servidor!`;

            await conn.sendMessage(m.chat, { 
                text: txt, 
                mentions: [targetJid] 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al mostrar el harem.`);
        }
    }
};

export default haremCommand;