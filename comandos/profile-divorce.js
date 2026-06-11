import { config } from '../config.js';

const divorce = {
    name: 'divorce',
    alias: ['divorcio', 'separarse'],
    category: 'profile',
    desc: 'Disuelve tu matrimonio actual y vuelve al estado de soltería.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const userJid = m.sender.replace(/:.*@/g, '@');
            const userDb = global.db.data.users[userJid];

            if (!userDb || !userDb.marry) {
                return m.reply(`*${config.visuals.emoji2} \`SOLTERÍA DETECTADA\` ${config.visuals.emoji2}*\n\nNo existe un vínculo activo en tu cuenta.\n\n> ¡No puedes romper lo que no existe!`);
            }

            const parejaJid = userDb.marry.replace(/:.*@/g, '@');
            
            delete userDb.marry;
            if (global.db.data.users[parejaJid]) {
                delete global.db.data.users[parejaJid].marry;
            }

            await conn.sendMessage(m.chat, { 
                text: `*☹︎ \`DIVORCIO CONFIRMADO\` ☹︎*\n\n@${userJid.split('@')[0]} ha decidido terminar el matrimonio. Ahora ambos están solteros.\n\n> ¡Espero que ambos encuentren un mejor camino!`, 
                mentions: [userJid, parejaJid] 
            }, { quoted: m });
        } catch (e) {
            console.error(e);
            m.reply('✘ Error al disolver el vínculo.');
        }
    }
};

export default divorce;