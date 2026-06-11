import fs from 'fs';
import path from 'path';
import { config } from '../config.js';
import { database, query } from '../database.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const baseGroup = "120363423871589037@g.us";

const voteCommand = {
    name: 'vote',
    alias: ['despedir', 'votar'],
    category: 'gacha',
    desc: 'Libera a un personaje de tu inventario para que vuelva a estar disponible en el grupo.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        try {
            const group = m.chat;
            const userJid = m.sender;
            const pjId = args[0];

            if (!pjId) return m.reply(`*${config.visuals.emoji2}* Indica el ID del personaje que deseas votar.`);

            if (!fs.existsSync(gachaPath)) return m.reply(`*${config.visuals.emoji2}* Error: DB Gacha no encontrada.`);
            const rawData = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            const plantillaPersonajes = rawData[baseGroup];

            if (!plantillaPersonajes[pjId]) {
                return m.reply(`*${config.visuals.emoji2}* El personaje no existe.`);
            }

            const infoPj = await database.getCharacterOwner(group, pjId);
            
            const rawUser = userJid.split('@')[0].split(':')[0].trim() + '@s.whatsapp.net';
            const rawOwner = infoPj?.user_jid ? infoPj.user_jid.split('@')[0].split(':')[0].trim() + '@s.whatsapp.net' : null;

            if (!infoPj || rawOwner !== rawUser) {
                return m.reply(`*${config.visuals.emoji2}* ¡No puedes votar a un personaje que no te pertenece!`);
            }

            const pjName = plantillaPersonajes[pjId].name;

            await query("DELETE FROM gacha_ownership WHERE group_jid = ? AND character_id = ?", [group, pjId]);
            await query("DELETE FROM gacha_shop WHERE group_jid = ? AND character_id = ?", [group, pjId]);

            let txt = `*${config.visuals.emoji3} \`LIBERACIÓN DE PERSONAJE\` ${config.visuals.emoji3}*\n\n`;
            txt += `» Has liberado a *${pjName}* correctamente.\n`;
            txt += `*✰ ID Único »* \`${pjId}\`\n\n`;
            txt += `> Ahora es libre y ha sido retirado de cualquier mercado en este grupo.`;

            return m.reply(txt);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al procesar el voto.`);
        }
    }
};

export default voteCommand;