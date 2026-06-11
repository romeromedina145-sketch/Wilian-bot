import { config } from '../config.js';

const kickCommand = {
    name: 'kick',
    alias: ['sacar', 'ban', 'eliminar'],
    category: 'admins',
    desc: 'Expulsa a un miembro del grupo mediante una mención o respondiendo a su mensaje.',
    isAdmin: true,
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const groupMetadata = await conn.groupMetadata(m.chat);
            const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            const isBotAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin;

            if (!isBotAdmin) {
                return m.reply(`*${config.visuals.emoji2}* El bot no posee rango de Administrador. No tengo poder para eliminar miembros del grupo.\n\n> ¡Solicita el rango si deseas automatizar esta función!`);
            }

            let targetJid;
            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.quoted) {
                targetJid = m.quoted.key.participant || m.quoted.key.remoteJid;
            }

            if (!targetJid) {
                return m.reply(`*${config.visuals.emoji2}* Debes mencionar a alguien o responder a su mensaje para ejecutar la purga.\n\n> ¡Indica a quién debemos eliminar del grupo!`);
            }

            const userToKick = targetJid.split('@')[0].split(':')[0] + '@s.whatsapp.net';
            const ownerNumber = config.owner[0][0] + '@s.whatsapp.net';

            const participants = groupMetadata.participants;
            const targetData = participants.find(p => p.id === userToKick);
            const isTargetAdmin = targetData?.admin || targetData?.isSuperAdmin;

            if (userToKick === m.sender) {
                return m.reply(`*${config.visuals.emoji2}* No puedes eliminarte a ti mismo de la existencia.\n\n> ¡Si deseas irte, hazlo manualmente!`);
            }

            if (userToKick === ownerNumber) {
                return m.reply(`*${config.visuals.emoji2}* Has intentado atacar al Creador. La acción ha sido bloqueada.\n\n> ¡Nadie toca al Owner en este servidor!`);
            }

            if (isTargetAdmin) {
                return m.reply(`*${config.visuals.emoji2}* El objetivo posee privilegios de Administrador. No puedo procesar esta orden.\n\n> ¡Debes quitarle el rango primero si deseas expulsarlo!`);
            }

            if (userToKick === botNumber) {
                return m.reply(`*${config.visuals.emoji2}* ¿Intentas sacarme a mí? Qué atrevido...`);
            }

            await conn.groupParticipantsUpdate(m.chat, [userToKick], 'remove');

            m.reply(`*${config.visuals.emoji3} \`PURGA COMPLETADA\` ${config.visuals.emoji3}*\n\nEl usuario @${userToKick.split('@')[0]} ha sido desterrado con éxito.\n\n> ¡El orden ha sido restaurado en el grupo!`, { mentions: [userToKick] });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al ejecutar la expulsión.`);
        }
    }
};

export default kickCommand;