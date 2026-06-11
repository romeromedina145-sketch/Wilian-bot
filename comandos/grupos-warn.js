import { database, query } from '../database.js';

const warnConfigCommand = {
    name: 'warn',
    alias: ['warnings', 'advertencias'],
    category: 'grupos',
    desc: 'Activa las advertencias en el grupo.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, args) => {
        const { isAdmin } = await conn.getAdminStatus(m.chat, m.sender);
        if (!isAdmin) {
            return m.reply('Necesitas ser administrador del grupo para usar este comando.');
        }

        let dbChat = await database.getChat(m.chat);
        if (!dbChat) {
            dbChat = { welcome: 1, antilink: 1, detect: 1, warn: 0 };
            await database.saveChat(m.chat, dbChat);
        }

        let action = args[0]?.toLowerCase();

        if (!action || !['on', 'off', 'reset'].includes(action)) {
            let currentStatus = (dbChat.warn === 1) ? 'Activado' : 'Desactivado';
            let txt = `*✿︎ \`SISTEMA DE ADVERTENCIAS\` ✿︎*\n\n`;
            txt += `» *Estado actual:* \`${currentStatus}\`\n\n`;
            txt += `> ✰ Usa *warn on* para activar el sistema de 3 avisos antes del ban.\n`;
            txt += `> ✰ Usa *warn off* para que el antilink elimine directo sin avisar.\n`;
            txt += `> ✰ Usa *warn reset* para limpiar las faltas de todos en este grupo.`;
            return m.reply(txt);
        }

        if (action === 'reset') {
            await query("DELETE FROM warnings WHERE group_jid = ?", [m.chat]);
            return m.reply(`*✿︎ \`REINICIO EXITOSO\` ✿︎*\n\n» Se han limpiado las advertencias de todos los usuarios en este grupo.`);
        }

        const intValue = action === 'on' ? 1 : 0;

        if ((dbChat.warn || 0) === intValue) {
            return m.reply(`*✿︎* El sistema de advertencias ya se encuentra ${intValue === 1 ? '*activado*' : '*desactivado*'}.`);
        }

        await query("ALTER TABLE chats ADD COLUMN warn INTEGER DEFAULT 0").catch(() => {});

        dbChat.warn = intValue;
        await database.saveChat(m.chat, dbChat);

        let res = `*✿︎ \`CONFIG UPDATE\` ✿︎*\n\n`;
        res += `» Has ${intValue === 1 ? 'Activado' : 'Desactivado'} el sistema de *WARNS*\n\n`;
        res += `> ✰ ${intValue === 1 ? 'Los usuarios recibirán 2 advertencias y al 3er link serán eliminados.' : 'El antilink ahora expulsará directamente.'}`;

        return m.reply(res);
    }
};

export default warnConfigCommand;