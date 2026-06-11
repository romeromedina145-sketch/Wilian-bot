import { config } from '../config.js';

const proposals = new Map();

const marry = {
    name: 'marry',
    alias: ['casar', 'acceptmarry'],
    category: 'profile',
    desc: 'Propón matrimonio a otro usuario o acepta una propuesta respondiendo al mensaje.',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const userJid = m.sender.replace(/:.*@/g, '@');
            const userDb = global.db.data.users[userJid];

            if (args[0] === 'accept') {
                if (!m.quoted || !proposals.has(m.quoted.id)) {
                    return m.reply(`*${config.visuals.emoji2} \`SIN PROPUESTAS\` ${config.visuals.emoji2}*\n\nNo tienes peticiones de matrimonio pendientes.`);
                }
                
                const prop = proposals.get(m.quoted.id);
                if (userJid !== prop.to) return m.reply(`*${config.visuals.emoji2}* No puedes aceptar un pacto ajeno.`);

                userDb.marry = prop.from;
                if (global.db.data.users[prop.from]) {
                    global.db.data.users[prop.from].marry = userJid;
                }
                
                proposals.delete(m.quoted.id);
                return m.reply(`*${config.visuals.emoji3} \`VÍNCULO SELLADO\` ${config.visuals.emoji3}*\n\n¡Felicidades! Ahora estás casado con @${prop.from.split('@')[0]}.\n\n> ¡Que este pacto dure por siempre! 💍`, { mentions: [userJid, prop.from] });
            }

            if (userDb?.marry) return m.reply(`*${config.visuals.emoji2} \`VÍNCULO ACTIVO\` ${config.visuals.emoji2}*\n\nYa posees un matrimonio registrado.`);

            const targetJid = (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null))?.replace(/:.*@/g, '@');
            
            if (!targetJid || targetJid === userJid) return m.reply(`*${config.visuals.emoji2} \`ERROR DE OBJETIVO\` ${config.visuals.emoji2}*\n\nDebes mencionar a un usuario válido.`);

            const targetDb = global.db.data.users[targetJid];
            if (targetDb?.marry) return m.reply(`*${config.visuals.emoji2}* El objetivo ya posee un vínculo activo.`);

            const userGenre = userDb?.genre;
            const targetGenre = targetDb?.genre;

            if (!userGenre || !targetGenre) return m.reply(`*${config.visuals.emoji2} \`REGISTRO NECESARIO\` ${config.visuals.emoji2}*\n\nAmbos requieren definir su identidad (#setgenre).`);
            
            if (userGenre === targetGenre) return m.reply(`*${config.visuals.emoji2} \`PACTO DENEGADO\` ${config.visuals.emoji2}*\n\nSolo se permite la unión de géneros opuestos.`);

            const sent = await conn.sendMessage(m.chat, { 
                text: `*💍 \`PROPUESTA DE MATRIMONIO\` 💍*\n\n@${userJid.split('@')[0]} solicita un pacto eterno contigo. Responde a este mensaje con *#marry accept* para sellarlo.`,
                mentions: [userJid, targetJid]
            }, { quoted: m });

            proposals.set(sent.key.id, { from: userJid, to: targetJid });
        } catch (e) {
            console.error(e);
            m.reply('✘ Error en el sistema de vínculos.');
        }
    }
};

export default marry;