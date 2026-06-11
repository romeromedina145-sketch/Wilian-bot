import { database, query } from '../database.js';

export default async function antiLinkHandler(conn, m) {
    if (!m.chat.endsWith('@g.us')) return;

    const botJid = conn.user.id.split(':')[0].trim() + '@s.whatsapp.net';
    const senderJid = m.sender.split('@')[0].split(':')[0].trim() + '@s.whatsapp.net';

    if (senderJid === botJid || m.sender.includes('@g.us') || !m.sender.includes('@s.whatsapp.net')) return;

    const dbChat = await database.getChat(m.chat);
    if (dbChat && dbChat.antilink === 0) return;

    const body = (
        m.message?.conversation || 
        m.message?.extendedTextMessage?.text || 
        m.message?.imageMessage?.caption || 
        m.message?.videoMessage?.caption || ""
    ).trim();

    const forbiddenLinks = [
        'web.whatsapp.com',
        'chat.whatsapp.com',
        'whatsapp.com/channel/',
        'api.whatsapp.com/send/',
        'whatsapp.com'
    ];

    const containsForbidden = forbiddenLinks.some(link => {
        const regex = new RegExp(link.replace('.', '\\.'), 'i');
        return regex.test(body);
    });

    if (containsForbidden) {
        const { isAdmin, isBotAdmin } = await conn.getAdminStatus(m.chat, m.sender);

        if (isAdmin) return; 
        if (!isBotAdmin) return;

        const userNumber = senderJid.split('@')[0];
        const metadata = await conn.groupMetadata(m.chat).catch(() => null);
        const participants = metadata ? metadata.participants.map(p => p.id) : [];

        await conn.sendMessage(m.chat, { delete: m.key });

        if (dbChat.warn === 1) {
            let warnCheck = await query("SELECT count FROM warnings WHERE group_jid = ? AND user_jid = ?", [m.chat, senderJid]);
            let currentCount = warnCheck.rows && warnCheck.rows.length > 0 ? warnCheck.rows[0].count : 0;
            
            currentCount += 1;

            if (currentCount >= 3) {
                await query("DELETE FROM warnings WHERE group_jid = ? AND user_jid = ?", [m.chat, senderJid]);
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');

                let txt = `*✿︎ \`ANTILINK - BAN TOTAL\` ✿︎*\n\n`;
                txt += `» El usuario @${userNumber} acumuló *3/3 advertencias* por enviar enlaces.\n`;
                txt += `» Ha sido expulsado de la comunidad de forma automática.\n\n`;
                txt += `> ✰ ¡Fin del juego! Las normas del grupo se respetan.`;

                await conn.sendMessage(m.chat, { 
                    text: txt, 
                    mentions: [...participants, m.sender] 
                });
            } else {
                if (currentCount === 1) {
                    await query("INSERT INTO warnings (group_jid, user_jid, count) VALUES (?, ?, 1)", [m.chat, senderJid]);
                } else {
                    await query("UPDATE warnings SET count = ? WHERE group_jid = ? AND user_jid = ?", [currentCount, m.chat, senderJid]);
                }

                let restantes = 3 - currentCount;
                let txt = `*✿︎ \`ADVERTENCIA POR ENLACE\` ✿︎*\n\n`;
                txt += `» @${userNumber} ha sido advertido por mandar un link prohibido.\n`;
                txt += `» *Historial:* \`[${currentCount}/3]\` advertencias.\n`;
                txt += `» *Oportunidades restantes:* Le quedan exactamente ${restantes}.\n\n`;
                txt += `> ✰ ¡El mensaje ha sido eliminado para proteger al grupo!`;

                await conn.sendMessage(m.chat, { 
                    text: txt, 
                    mentions: [m.sender] 
                });
            }
        } else {
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');

            let txt = `*✿︎ \`ANTILINK DETECTED\` ✿︎*\n\n`;
            txt += `» Se ha eliminado a @${userNumber} por enviar un link no permitido.\n\n`;
            txt += `> ✰ ¡En este grupo no se permiten enlaces externos!`;

            await conn.sendMessage(m.chat, { 
                text: txt, 
                mentions: [...participants, m.sender] 
            });
        }
    }
}