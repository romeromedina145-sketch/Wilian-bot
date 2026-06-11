import fs from 'fs-extra';
import path from 'path';
import { config } from '../config.js';

const selfCommand = {
    name: 'self',
    alias: ['privado', 'soloyo'],
    category: 'sockets',
    desc: 'Activa o desactiva el modo self para que la sesión solo responda a sí misma.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix) => {
        if (!m.key.fromMe) return;

        const myJid = conn.user.id.split('@')[0].split(':')[0].replace(/\D/g, '');
        const subSessionsPath = path.resolve('./sesiones_subbots');
        const moodSessionsPath = path.resolve('./sesiones_moods');

        let sessionFolder = '';
        if (fs.existsSync(path.join(subSessionsPath, myJid))) {
            sessionFolder = path.join(subSessionsPath, myJid);
        } else if (fs.existsSync(path.join(moodSessionsPath, myJid))) {
            sessionFolder = path.join(moodSessionsPath, myJid);
        } else {
            return m.reply(`*${config.visuals.emoji2}* No se encontró la carpeta de configuración para esta sesión.`);
        }

        const selfFilePath = path.join(sessionFolder, 'self_status.json');

        if (!fs.existsSync(selfFilePath)) {
            await fs.writeJson(selfFilePath, { selfMode: false });
        }

        let data = await fs.readJson(selfFilePath);
        const action = args[0]?.toLowerCase();

        if (action === 'on') {
            if (data.selfMode) return m.reply(`*${config.visuals.emoji2}* El modo self ya se encuentra activado actualmente.`);
            
            data.selfMode = true;
            await fs.writeJson(selfFilePath, data);
            const textoOn = `*${config.visuals.emoji3}* \`MODO SELF ACTIVADO\` *${config.visuals.emoji3}*\n\n> Ignorando todos los mensajes externos.\n> Actividad de terceros oculta en consola.`;
            return m.reply(textoOn);
        } else if (action === 'off') {
            if (!data.selfMode) return m.reply(`*${config.visuals.emoji2}* El modo self ya se encuentra desactivado actualmente.`);
            
            data.selfMode = false;
            await fs.writeJson(selfFilePath, data);
            const textoOff = `*${config.visuals.emoji2}* \`MODO SELF DESACTIVADO\` *${config.visuals.emoji2}*\n\n> El bot ahora responderá a todos los usuarios normalmente.`;
            return m.reply(textoOff);
        } else {
            return m.reply(`*${config.visuals.emoji2}* Uso incorrecto. Utiliza:\n» *${usedPrefix}self on*\n» *${usedPrefix}self off*`);
        }
    }
};

export default selfCommand;
