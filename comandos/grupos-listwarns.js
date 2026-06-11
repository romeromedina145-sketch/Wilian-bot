import { config } from '../config.js';
import { query } from '../database.js';

const listWarnsCommand = {
    name: 'listwarns',
    alias: ['listwarn', 'warns'],
    category: 'grupo',
    desc: 'Mira la lista de usuarios advertidos.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m) => {
        try {
            const group = m.chat;

            const result = await query("SELECT user_jid, count FROM warnings WHERE group_jid = ? AND count > 0 ORDER BY count DESC", [group]);
            const warnedUsers = result.rows || [];

            if (warnedUsers.length === 0) {
                return m.reply(`*${config.visuals.emoji3}* ¡Excelente! No hay ningún usuario advertido en este grupo actualmente.`);
            }

            let txt = `*✿︎ \`USUARIOS ADVERTIDOS\` ✿︎*\n\n`;
            txt += `» Aquí tienes el historial de faltas vigentes:\n\n`;

            const mentions = [];

            warnedUsers.forEach((user, index) => {
                const userNumber = user.user_jid.split('@')[0];
                txt += `${index + 1}. @${userNumber} » *[${user.count}/3]* advertencias\n`;
                mentions.push(user.user_jid);
            });

            txt += `\n> ✰ Recuerda que al llegar a 3 advertencias serán expulsados de forma automática.`;

            return conn.sendMessage(group, {
                text: txt,
                mentions: mentions
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al consultar la lista de advertencias.`);
        }
    }
};

export default listWarnsCommand;