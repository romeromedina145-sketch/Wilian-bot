import fs from 'fs';
import path from 'path';
import { config } from '../config.js';
import { database, query } from '../database.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const baseGroup = "120363423871589037@g.us";
const trades = new Map();

const tradeCommand = {
    name: 'trade',
    alias: ['intercambio', 'cambiar'],
    category: 'gacha',
    desc: 'Propón un intercambio de personajes con otro usuario del grupo.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        try {
            const group = m.chat;
            const user = m.sender.split('@')[0].split(':')[0].trim() + '@s.whatsapp.net';

            if (args[0] === 'accept') {
                if (!m.quoted) return m.reply(`*${config.visuals.emoji2}* Responde al mensaje de la propuesta para aceptar el intercambio.`);

                const proposalKey = `${group}-${m.quoted.id}`;
                const proposal = trades.get(proposalKey);

                if (!proposal) return m.reply(`*${config.visuals.emoji2}* Esta propuesta ya no existe o ha caducado.`);
                if (user !== proposal.toJid) return m.reply(`*${config.visuals.emoji2}* Solo la persona mencionada en la propuesta original puede aceptar este intercambio.`);

                const user1 = proposal.from;
                const user2 = user;
                const pj1 = proposal.myPjId;
                const pj2 = proposal.targetPjId;

                const infoPj1 = await database.getCharacterOwner(group, pj1);
                const infoPj2 = await database.getCharacterOwner(group, pj2);

                const rawOwner1 = infoPj1?.user_jid ? infoPj1.user_jid.split('@')[0].split(':')[0].trim() + '@s.whatsapp.net' : null;
                const rawOwner2 = infoPj2?.user_jid ? infoPj2.user_jid.split('@')[0].split(':')[0].trim() + '@s.whatsapp.net' : null;

                if (!infoPj1 || !infoPj2 || rawOwner1 !== user1 || rawOwner2 !== user2 || infoPj1.status === 'en_venta' || infoPj2.status === 'en_venta') {
                    trades.delete(proposalKey);
                    return m.reply(`*${config.visuals.emoji2}* El intercambio falló: uno de los personajes ya no está disponible, está en venta en el mercado o cambió de dueño.`);
                }

                if (!fs.existsSync(gachaPath)) return m.reply(`*${config.visuals.emoji2}* Error: DB Gacha no encontrada.`);
                const rawData = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
                const plantilla = rawData[baseGroup];

                await query("UPDATE gacha_ownership SET user_jid = ?, status = 'domado' WHERE group_jid = ? AND character_id = ?", [user2, group, pj1]);
                await query("UPDATE gacha_ownership SET user_jid = ?, status = 'domado' WHERE group_jid = ? AND character_id = ?", [user1, group, pj2]);

                const name1 = plantilla[pj1].name;
                const name2 = plantilla[pj2].name;

                trades.delete(proposalKey);

                const u1Id = user1.split('@')[0];
                const u2Id = user2.split('@')[0];

                let txt = `*${config.visuals.emoji3} \`INTERCAMBIO EXITOSO\` ${config.visuals.emoji3}*\n\n`;
                txt += `» ¡El trato se ha cerrado correctamente entre ambos usuarios!\n`;
                txt += `*✰ @${u1Id} recibió a »* *${name2}*\n`;
                txt += `*✰ @${u2Id} recibió a »* *${name1}*\n\n`;
                txt += `> ¡Disfruten de sus nuevas adquisiciones en el #harem!`;

                return conn.sendMessage(m.chat, { text: txt, mentions: [user1, user2] }, { quoted: m });
            }

            let rawTarget = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
            if (!rawTarget) return m.reply(`*${config.visuals.emoji2}* Menciona a un usuario del grupo para proponerle un intercambio.`);

            const targetJid = rawTarget.split('@')[0].split(':')[0].trim() + '@s.whatsapp.net';

            const myId = args[0];
            const hisId = args[1];
            if (!myId || !hisId) return m.reply(`*${config.visuals.emoji2}* Uso Incorrecto. Usa el comando de la siguiente forma:\n> .trade (Tu_ID) (Su_ID) @mención`);

            if (!fs.existsSync(gachaPath)) return m.reply(`*${config.visuals.emoji2}* Error: DB Gacha no encontrada.`);
            const rawData = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            const plantilla = rawData[baseGroup];

            if (!plantilla[myId] || !plantilla[hisId]) {
                return m.reply(`*${config.visuals.emoji2}* Uno de los IDs especificados no existe en la plantilla.`);
            }

            const myPjDb = await database.getCharacterOwner(group, myId);
            const hisPjDb = await database.getCharacterOwner(group, hisId);

            const cleanMyOwner = myPjDb?.user_jid ? myPjDb.user_jid.split('@')[0].split(':')[0].trim() + '@s.whatsapp.net' : null;
            const cleanHisOwner = hisPjDb?.user_jid ? hisPjDb.user_jid.split('@')[0].split(':')[0].trim() + '@s.whatsapp.net' : null;

            if (!myPjDb || cleanMyOwner !== user || myPjDb.status === 'en_venta') return m.reply(`*${config.visuals.emoji2}* El personaje *${plantilla[myId].name}* no es tuyo o se encuentra en venta en el mercado.`);
            if (!hisPjDb || cleanHisOwner !== targetJid || hisPjDb.status === 'en_venta') return m.reply(`*${config.visuals.emoji2}* El personaje *${plantilla[hisId].name}* no le pertenece a esa persona o está publicado en el mercado.`);

            const uId = user.split('@')[0];
            const sent = await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3} \`PROPUESTA DE INTERCAMBIO\` ${config.visuals.emoji3}*\n\n» @${uId} quiere ofrecerte un intercambio de personajes.\n*✰ Te ofrece a »* *${plantilla[myId].name}* (\`${myId}\`)\n*✰ A cambio de tu »* *${plantilla[hisId].name}* (\`${hisId}\`)\n\n> Tienes 5 minutos para responder respondiendo a este mensaje con: *.trade accept*`,
                mentions: [user, targetJid]
            }, { quoted: m });

            const proposalId = `${group}-${sent.key.id}`;
            trades.set(proposalId, { from: user, toJid: targetJid, myPjId: myId, targetPjId: hisId });

            setTimeout(async () => {
                if (trades.has(proposalId)) {
                    trades.delete(proposalId);
                }
            }, 300000);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al procesar la propuesta de intercambio.`);
        }
    }
};

export default tradeCommand;
