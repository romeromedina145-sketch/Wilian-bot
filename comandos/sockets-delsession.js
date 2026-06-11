import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const subSessionsPath = path.resolve('./sesiones_subbots');
const moodSessionsPath = path.resolve('./sesiones_moods');

const delSession = {
    name: 'delsession',
    alias: ['cerrarsesion', 'out', 'deletesession'],
    category: 'sockets',
    desc: 'Elimina permanentemente la sesión del usuario del sistema.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const botNumber = conn.user.id.split(':')[0].replace(/\D/g, '');
            const isOwner = config.owner.some(o => o.includes(user));

            const pathSub = path.join(subSessionsPath, user);
            const pathMood = path.join(moodSessionsPath, user);
            const existsInSub = fs.existsSync(pathSub);
            const existsInMood = fs.existsSync(pathMood);

            if (botNumber === user && (!existsInSub && !existsInMood)) {
                return m.reply(`*${config.visuals.emoji2}* \`Operación Denegada\`\n\nNo puedes eliminar la sesión del bot principal desde aquí.`);
            }

            if (conn.user.id.split(':')[0] !== user && !existsInSub && !existsInMood && !isOwner) {
                return m.reply(`*${config.visuals.emoji2}* No tienes ninguna sesión de socket activa en el sistema.`);
            }

            await m.reply(`*${config.visuals.emoji3}* Procesando eliminación de sesión para @${user}...`, { mentions: [m.sender] });

            if (global.subBots && global.subBots.has(m.sender.split(':')[0] + '@s.whatsapp.net')) {
                global.subBots.delete(m.sender.split(':')[0] + '@s.whatsapp.net');
            }

            if (existsInSub) fs.rmSync(pathSub, { recursive: true, force: true });
            if (existsInMood) fs.rmSync(pathMood, { recursive: true, force: true });

            if (conn.user.id.split(':')[0] === user) {
                await conn.logout().catch(() => {});
                await conn.end().catch(() => {});
            } else {
                m.reply(`*${config.visuals.emoji3}* La sesión de @${user} ha sido eliminada. Ya puedes solicitar un nuevo código.`);
            }

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al intentar eliminar los datos de sesión.`);
        }
    }
};

export default delSession;