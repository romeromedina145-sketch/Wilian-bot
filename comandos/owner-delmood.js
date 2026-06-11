import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const moodPath = path.resolve('./sesiones_moods');

const deleteMood = {
    name: 'delmood',
    alias: ['purgemood', 'deletemood'],
    category: 'owner',
    desc: 'Elimina sesiones específicas o totales de los SubMoods instalados.',
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
                return m.reply(`*${config.visuals.emoji2}* \`Uso Incorrecto\`\n\n> #delmood (número)\n> #delmood all`);
            }

            if (args[0].toLowerCase() === 'all') {
                if (!fs.existsSync(moodPath)) return m.reply(`*${config.visuals.emoji2}* No hay sesiones de Moods para eliminar.`);

                const sessions = fs.readdirSync(moodPath);

                for (const [jid, sock] of global.moodBots.entries()) {
                    try {
                        await sock.logout();
                    } catch (err) {}
                    global.moodBots.delete(jid);
                }

                sessions.forEach(file => {
                    const fullPath = path.join(moodPath, file);
                    if (fs.lstatSync(fullPath).isDirectory()) {
                        fs.rmSync(fullPath, { recursive: true, force: true });
                    }
                });

                return m.reply(`*${config.visuals.emoji3}* \`PURGA DE MOODS COMPLETADA\`\n\nSe han eliminado todos los SubMoods y sus carpetas de sesión.`);
            }

            const target = args[0].replace(/[^0-9]/g, '');
            const targetJid = `${target}@s.whatsapp.net`;
            const userSessionPath = path.join(moodPath, target);

            if (!fs.existsSync(userSessionPath)) {
                return m.reply(`*${config.visuals.emoji2}* No existe sesión de Mood para el número: ${target}`);
            }

            if (global.moodBots.has(targetJid)) {
                const sock = global.moodBots.get(targetJid);
                try {
                    await sock.logout();
                } catch (err) {}
                global.moodBots.delete(targetJid);
            }

            fs.rmSync(userSessionPath, { recursive: true, force: true });

            await m.reply(`*${config.visuals.emoji3}* La sesión Mood del número \`${target}\` ha sido eliminada del sistema.`);

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al procesar la eliminación del Mood.`);
        }
    }
};

export default deleteMood;
