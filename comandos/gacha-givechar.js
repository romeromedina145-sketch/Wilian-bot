import fs from 'fs';
import path from 'path';
import { config } from '../config.js';
import { database, query } from '../database.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const baseGroup = "120363423871589037@g.us";

const givePjCommand = {
    name: 'givechar',
    alias: ['regalarpj', 'give'],
    category: 'gacha',
    desc: 'Transfiere la propiedad de uno de tus personajes a otro usuario del grupo.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        try {
            const group = m.chat;
            const giverJid = m.sender;
            const pjId = args[0];

            let rawTarget = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);

            if (!pjId || !rawTarget) {
                return m.reply(`*${config.visuals.emoji2}* \`Uso Incorrecto\`\n\nIndica el ID y menciona al destinatario.`);
            }

            const cleanGiver = giverJid.split('@')[0].split(':')[0].trim() + '@s.whatsapp.net';
            const cleanTarget = rawTarget.split('@')[0].split(':')[0].trim() + '@s.whatsapp.net';

            if (cleanGiver === cleanTarget) return m.reply(`*${config.visuals.emoji2}* No te lo puedes regalar a ti mismo.`);

            const infoPj = await database.getCharacterOwner(group, pjId);
            const rawOwner = infoPj?.user_jid ? infoPj.user_jid.split('@')[0].split(':')[0].trim() + '@s.whatsapp.net' : null;

            if (!infoPj || rawOwner !== cleanGiver) {
                return m.reply(`*${config.visuals.emoji2}* ¡Ese personaje no te pertenece o no existe!`);
            }

            await query("UPDATE gacha_ownership SET user_jid = ?, status = 'domado' WHERE group_jid = ? AND character_id = ?", [cleanTarget, group, pjId]);
            await query("DELETE FROM gacha_shop WHERE group_jid = ? AND character_id = ?", [group, pjId]);

            if (!fs.existsSync(gachaPath)) return m.reply(`*${config.visuals.emoji2}* Error: DB Gacha no encontrada.`);
            const rawData = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            const pjNombre = rawData[baseGroup][pjId]?.name || "Personaje";

            const giverId = cleanGiver.split('@')[0];
            const receiverId = cleanTarget.split('@')[0];

            let txt = `*${config.visuals.emoji3} \`TRANSFERENCIA EXITOSA\` ${config.visuals.emoji3}*\n\n`;
            txt += `» @${giverId} ha cedido la propiedad de un personaje.\n`;
            txt += `*✰ Personaje entregado »* *${pjNombre}* (\`${pjId}\`)\n`;
            txt += `*✰ Recibe »* @${receiverId}\n\n`;
            txt += `> ¡El harem de @${receiverId} acaba de crecer!`;

            return conn.sendMessage(m.chat, { 
                text: txt,
                mentions: [cleanGiver, cleanTarget]
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al procesar la donación.`);
        }
    }
};

export default givePjCommand;