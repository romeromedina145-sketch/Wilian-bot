import { config } from '../config.js';
import { database, query } from '../database.js';

const profileCommand = {
    name: 'profile',
    alias: ['perfil'],
    category: 'profile',
    desc: 'Muestra tu ficha de perfil con info de economía, RPG, gacha y estado civil.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            let rawTarget = m.sender;
            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                rawTarget = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.quoted) {
                rawTarget = m.quoted.key.participant || m.quoted.key.remoteJid;
            }

            const targetJid = rawTarget.split('@')[0].split(':')[0].trim() + '@s.whatsapp.net';
            const userShortId = targetJid.split('@')[0];
            const group = m.chat;

            let userDb = await database.getUser(targetJid);
            if (!userDb) {
                userDb = { wallet: 0, bank: 0, genre: 'No definido', marry: null, birthday: null };
            }

            const haremResult = await database.getHarem(group, targetJid);
            const totalPjs = haremResult ? haremResult.length : 0;

            let rpgCheck = await query("SELECT rank, diamantes, rubies, oro, esmeraldas, zafiros, amatistas, perlas FROM rpg WHERE group_jid = ? AND user_jid = ?", [group, targetJid]);
            let rpgData = rpgCheck.rows && rpgCheck.rows.length > 0 ? rpgCheck.rows[0] : {
                rank: 'Novato de las Cuevas',
                diamantes: 0,
                rubies: 0,
                oro: 0,
                esmeraldas: 0,
                zafiros: 0,
                amatistas: 0,
                perlas: 0
            };

            const genero = userDb.genre || 'No definido';
            
            let age = 'No definida';
            let cumple = 'No definido';
            if (userDb.birthday) {
                try {
                    const parsedBirth = typeof userDb.birthday === 'string' ? JSON.parse(userDb.birthday) : userDb.birthday;
                    age = parsedBirth.age || 'No definida';
                    cumple = parsedBirth.date || 'No definido';
                } catch {
                    if (userDb.birthday?.age) age = userDb.birthday.age;
                    if (userDb.birthday?.date) cumple = userDb.birthday.date;
                }
            }

            const parejaJid = userDb.marry ? userDb.marry.split('@')[0].split(':')[0].trim() + '@s.whatsapp.net' : null;
            const pareja = parejaJid ? `@${parejaJid.split('@')[0]}` : 'Soltero/a';

            const mentions = [targetJid];
            if (parejaJid) mentions.push(parejaJid);

            const wallet = Number(userDb.wallet) || 0;
            const bank = Number(userDb.bank) || 0;

            const rank = rpgData.rank || 'Novato de las Cuevas';
            const totalGemas = Number(rpgData.esmeraldas || 0) + Number(rpgData.zafiros || 0) + Number(rpgData.amatistas || 0) + Number(rpgData.perlas || 0);

            let pp;
            try { 
                pp = await conn.profilePictureUrl(targetJid, 'image'); 
            } catch { 
                pp = 'https://i.ibb.co/mJR6NBs/avatar.png'; 
            }

            let txt = `*${config.visuals.emoji3} \`PERFIL DE USUARIO\` ${config.visuals.emoji3}*\n\n`;
            txt += `*✿︎ Usuario:* @${userShortId}\n\n`;
            txt += `*✿︎ Género:* ${genero}\n`;
            txt += `*✿︎ Edad:* ${age}\n`;
            txt += `*✿︎ Cumpleaños:* ${cumple}\n`;
            txt += `*✿︎ Pareja:* ${pareja}\n\n`;

            txt += `*✿︎ INFO ECONOMY* ✿︎\n`;
            txt += `> ⴵ Cartera: *¥${wallet.toLocaleString()}*\n`;
            txt += `> ⴵ Banco: *¥${bank.toLocaleString()}*\n`;
            txt += `> ⴵ Patrimonio: *¥${(wallet + bank).toLocaleString()}*\n\n`;

            txt += `*✿︎ INFO GACHA* ✿︎\n`;
            txt += `> ⴵ Colección: *${totalPjs} personajes*\n\n`;

            txt += `*✿︎ INFO RPG ✿︎*\n`;
            txt += `> ⴵ Rango: *${rank}*\n`;
            txt += `> ⴵ Diamantes: *${rpgData.diamantes || 0}*\n`;
            txt += `> ⴵ Rubíes: *${rpgData.rubies || 0}*\n`;
            txt += `> ⴵ Oro: *${rpgData.oro || 0}*\n`;
            txt += `> ⴵ Gemas: *${totalGemas}*`;

            await conn.sendMessage(m.chat, { 
                image: { url: pp }, 
                caption: txt, 
                mentions: mentions
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al cargar el perfil.`);
        }
    }
};

export default profileCommand;