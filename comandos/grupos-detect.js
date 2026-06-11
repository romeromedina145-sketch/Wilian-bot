import { database } from '../database.js';

export const detectHandler = (conn) => {
    conn.ev.on('group-participants.update', async (anu) => {
        try {
            const id = anu.id;
            const dbChat = await database.getChat(id);
            if (dbChat && dbChat.detect === 0) return;

            const metadata = await conn.groupMetadata(id).catch(() => null);
            if (!metadata) return;
            const participants = metadata.participants.map(p => p.id);

            for (const p of anu.participants) {
                let jid = typeof p === 'string' ? p : p.id || p.jid;
                const userNumber = jid.split('@')[0].split(':')[0];

                if (anu.action === 'promote') {
                    const author = anu.author || id;
                    let txt = `*✿︎ \`NUEVO ADMIN\` ✿︎*\n\n`;
                    txt += `» @${userNumber} ha sido ascendido de rango por @${author.split('@')[0]}.\n\n`;
                    txt += `> ✰ ¡Esperamos que no abuses de tu poder!`;
                    await conn.sendMessage(id, { text: txt, mentions: [...participants, jid, author] });
                }

                if (anu.action === 'demote') {
                    const author = anu.author || id;
                    let txt = `*✿︎ \`ADMIN REMOVIDO\` ✿︎*\n\n`;
                    txt += `» @${userNumber} ha sido degradado de su cargo por @${author.split('@')[0]}.\n\n`;
                    txt += `> ❀ ¡Un admin menos en la lista!`;
                    await conn.sendMessage(id, { text: txt, mentions: [...participants, jid, author] });
                }
            }
        } catch (e) {}
    });

    conn.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.messageStubType) return;

        const id = m.key.remoteJid;
        const dbChat = await database.getChat(id);
        if (dbChat && dbChat.detect === 0) return;

        const metadata = await conn.groupMetadata(id).catch(() => null);
        const participants = metadata ? metadata.participants.map(p => p.id) : [];

        const actor = m.key?.participant || m.participant || id;
        const actorNumber = actor.split('@')[0];

        const getStubText = (type, params) => {
            let txt = '';
            if (type == 21) {
                txt = `*✿︎ \`NAME UPDATE\` ✿︎*\n\n`;
                txt += `» @${actorNumber} acaba de cambiar el *nombre* del grupo a:\n`;
                txt += `> *${params[0]}*`;
            } else if (type == 22) {
                txt = `*✿︎ \`ICON UPDATE\` ✿︎*\n\n`;
                txt += `» @${actorNumber} acaba de cambiar la *foto* del grupo.\n\n`;
                txt += `> ❀ ¡Nueva imagen para la comunidad!`;
            } else if (type == 23) {
                txt = `*✿︎ \`LINK UPDATE\` ✿︎*\n\n`;
                txt += `» @${actorNumber} acaba de restablecer el *enlace* del grupo.\n\n`;
                txt += `> ✰ El link anterior ya no funciona.`;
            } else if (type == 24) {
                txt = `*✿︎ \`DESCRIPTION UPDATE\` ✿︎*\n\n`;
                txt += `» @${actorNumber} acaba de cambiar la *descripción* del grupo.\n\n`;
                txt += `> ❀ ¡Pueden verla en la información del grupo!`;
            } else if (type == 25) {
                txt = `*✿︎ \`CONFIG UPDATE\` ✿︎*\n\n`;
                txt += `» @${actorNumber} cambió los ajustes: ahora *${params[0] == 'on' ? 'solo admins' : 'todos'}* pueden editar el grupo.`;
            } else if (type == 26) {
                txt = `*✿︎ \`CHAT STATUS\` ✿︎*\n\n`;
                txt += `» @${actorNumber} ha ${params[0] == 'on' ? '*cerrado*' : '*abierto*'} el grupo.\n\n`;
                txt += `> ✰ ${params[0] == 'on' ? 'Solo administradores pueden escribir.' : 'Todos los miembros pueden escribir.'}`;
            }
            return txt;
        };

        const responseText = getStubText(m.messageStubType, m.messageStubParameters);
        if (responseText) {
            await conn.sendMessage(id, { text: responseText, mentions: [...participants, actor] });
        }
    });
};