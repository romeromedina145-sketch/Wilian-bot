import { config } from '../config.js';
import { database } from '../database.js';

export default function welcomeHandler(conn) {
    conn.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;

        const dbChat = await database.getChat(id);
        if (dbChat && dbChat.welcome === 0) return;

        const metadata = await conn.groupMetadata(id).catch(() => null);
        if (!metadata) return;

        const prefix = config.allPrefixes ? config.allPrefixes[0] : '#';

        for (const user of participants) {
            let jid = typeof user === 'string' ? user : user.id;
            const userNumber = jid.split('@')[0].split(':')[0];

            let pp;
            try {
                pp = await conn.profilePictureUrl(jid, 'image');
            } catch {
                pp = 'https://files.catbox.moe/j2q1zj.png';
            }

            if (action === 'add') {
                let txt = `┏━━✿︎ *WELCOME USER* ✿︎━━╮\n\n`;
                txt += `❀ ¡Hola! @${userNumber} un gusto verte por aquí, `;
                txt += `estamos felices de que te hayas unido al grupo `;
                txt += `*${metadata.subject}* y nos encantaría conocerte!\n\n`;
                txt += `✰ para ver mi lista de comandos usa el comando \`${prefix}help\`\n`;
                txt += `> SaitamaBot-Sckt-MD\n`;
                txt += `> ©2026\n`; `╰━━━━━━━━━━━━━━━╯`;

                await conn.sendMessage(id, { 
                    image: { url: pp }, 
                    caption: txt, 
                    mentions: [jid] 
                });
            } else if (action === 'remove') {
                let txt = `┏━━✿︎ *BYE USER* ✿︎━━╮\n\n`;
                txt += `❀ ¡Adiós! @${userNumber} lamentamos que hayas dejado el grupo `;
                txt += `*${metadata.subject}*, ¡fue un gusto tenerte con nosotros!\n\n`;
                txt += `✰ esperamos que vuelvas pronto por aquí\n`;
                txt += `> SaitamaBot-Sckt-MD\n`;
                txt += `> ©2026\n`; `╰━━━━━━━━━━━━━━━╯`;

                await conn.sendMessage(id, { 
                    image: { url: pp }, 
                    caption: txt, 
                    mentions: [jid] 
                });
            }
        }
    });
}
