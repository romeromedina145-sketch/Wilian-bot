import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const pfpCommand = {
    name: 'pfp',
    alias: ['pfp'],
    category: 'tools',
    desc: 'Obtiene la foto de perfil de un usuario mencionado o del que ejecuta el comando.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            let targetJid = m.sender;
            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.quoted) {
                targetJid = m.quoted.key.participant || m.quoted.key.remoteJid;
            }

            const user = targetJid.split('@')[0].split(':')[0];
            const mentions = [targetJid];

            let pp;
            try { 
                pp = await conn.profilePictureUrl(targetJid, 'image'); 
            } catch { 
                pp = 'https://i.ibb.co/mJR6NBs/avatar.png'; 
            }

            await conn.sendMessage(m.chat, { 
                image: { url: pp }, 
                caption: `*${config.visuals.emoji3} \`FOTO DE PERFIL\` ${config.visuals.emoji3}*\n\n> ➪ *Usuario:* @${user}`, 
                mentions: mentions
            }, { quoted: m });
        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al obtener la foto de perfil.`);
        }
    }
};

export default pfpCommand;
