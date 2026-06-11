import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const sessionsPath = path.resolve('./sesiones_subbots');

const deleteSession = {
    name: 'deletesession',
    alias: ['dsession', 'purger'],
    category: 'owner',
    desc: 'Elimina sesiones específicas o totales de los sub-bots del sistema.',
    isOwner: true,
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const realOwnerNumber = (typeof config.owner[0] === 'string' ? config.owner[0] : config.owner[0][0]).replace(/\D/g, '');
            const senderNumber = m.sender.split('@')[0].replace(/\D/g, '');
            const isRealOwner = senderNumber === realOwnerNumber;

            if (!isRealOwner) {
                return m.reply(`*${config.visuals.emoji2}* \`ACCESO DENEGADO\` *${config.visuals.emoji2}*\n\nSolo el administrador principal tiene autoridad sobre este comando.`);
            }

            if (!args[0]) {
                return m.reply(`*${config.visuals.emoji2}* \`Uso Incorrecto\`\n\n> #deletesession (número)\n> #deletesession all`);
            }

            if (args[0].toLowerCase() === 'all') {
                const sessions = fs.readdirSync(sessionsPath);

                for (const [jid, sock] of global.subBots.entries()) {
                    try {
                        await sock.logout();
                    } catch (e) {}
                    global.subBots.delete(jid);
                }

                sessions.forEach(file => {
                    const fullPath = path.join(sessionsPath, file);
                    fs.rmSync(fullPath, { recursive: true, force: true });
                });

                return m.reply(`*${config.visuals.emoji3}* \`PURGA TOTAL COMPLETADA\`\n\nSe han eliminado todos los sub-bots y sus sesiones.`);
            }

            const target = args[0].replace(/[^0-9]/g, '');
            const targetJid = `${target}@s.whatsapp.net`;
            const userSessionPath = path.join(sessionsPath, target);

            if (!fs.existsSync(userSessionPath)) {
                return m.reply(`*${config.visuals.emoji2}* No se encontró ninguna sesión para el número: ${target}`);
            }

            if (global.subBots.has(targetJid)) {
                const sock = global.subBots.get(targetJid);
                try {
                    await sock.logout();
                } catch (e) {}
                global.subBots.delete(targetJid);
            }

            fs.rmSync(userSessionPath, { recursive: true, force: true });

            await m.reply(`*${config.visuals.emoji3}* Sesión del número \`${target}\` eliminada correctamente.`);

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al ejecutar la purga.`);
        }
    }
};

export default deleteSession;