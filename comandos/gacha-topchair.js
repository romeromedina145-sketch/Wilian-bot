import fs from 'fs';
import path from 'path';
import { config } from '../config.js';
import { query } from '../database.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const baseGroup = "120363423871589037@g.us";

const topPjsCommand = {
    name: 'topchair',
    alias: ['pjetop', 'topwaifu', 'topersonaje'],
    category: 'gacha',
    desc: 'Muestra el ranking de los personajes más valiosos dentro de este grupo.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        try {
            const group = m.chat;

            if (!fs.existsSync(gachaPath)) return m.reply(`*${config.visuals.emoji2}* Error: Base de datos no encontrada.`);
            const rawData = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            const plantillaPersonajes = rawData[baseGroup];

            let page = 1;
            if (args && args[0] && !isNaN(args[0])) {
                page = parseInt(args[0]);
            }

            const res = await query('SELECT character_id, user_jid, status FROM gacha_ownership WHERE group_jid = ?', [group]);
            const dbOwners = res.rows || [];

            const ownershipMap = {};
            dbOwners.forEach(row => {
                ownershipMap[row.character_id] = {
                    owner: row.user_jid,
                    status: row.status
                };
            });

            let allPjs = Object.keys(plantillaPersonajes).map(id => {
                const infoDb = ownershipMap[id] || { status: 'libre', owner: null };
                return {
                    id,
                    name: plantillaPersonajes[id].name,
                    value: plantillaPersonajes[id].value,
                    status: infoDb.status,
                    owner: infoDb.owner
                };
            });

            allPjs.sort((a, b) => b.value - a.value);

            const itemsPerPage = 10;
            const totalPages = Math.ceil(allPjs.length / itemsPerPage);

            if (page > totalPages || page <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`PÁGINA NO ENCONTRADA\`\n\nSolo existen **${totalPages}** páginas de ranking.`);
            }

            const start = (page - 1) * itemsPerPage;
            const currentTop = allPjs.slice(start, start + itemsPerPage);

            let txt = `*${config.visuals.emoji3} \`RANKING DE PERSONAJES\` ${config.visuals.emoji3}*\n\n`;
            txt += `*✰ Página »* ${page} de ${totalPages}\n\n`;

            let mentions = [];
            currentTop.forEach((pj, index) => {
                const ranking = start + index + 1;
                let statusText = '_Libre_';

                if (pj.owner) {
                    const ownerId = pj.owner.split('@')[0].split(':')[0];
                    if (pj.status === 'en_venta') {
                        statusText = `En el mercado (@${ownerId})`;
                    } else {
                        statusText = `Domado por @${ownerId}`;
                    }
                    if (!mentions.includes(pj.owner)) mentions.push(pj.owner);
                }

                txt += `*${ranking}.* ${pj.name} \`[${pj.id}]\`\n`;
                txt += `  ᗒ *Valor:* $${pj.value.toLocaleString()} coins\n`;
                txt += `  ᗒ *Estado:* ${statusText}\n\n`;
            });

            txt += `> ¡Usa .rw para intentar conseguir a los mejores de la lista!`;

            await conn.sendMessage(m.chat, { 
                text: txt, 
                mentions: mentions 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al generar el top de personajes.`);
        }
    }
};

export default topPjsCommand;