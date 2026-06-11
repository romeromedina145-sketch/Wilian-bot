import { exec } from 'child_process';
import { promisify } from 'util';
import { config } from '../config.js';

const execPromise = promisify(exec);

const updateCommand = {
    name: 'update',
    alias: ['actualizar', 'gitpull', 'up'],
    category: 'owner',
    desc: 'Sincroniza el bot con los últimos cambios del repositorio en GitHub.',
    isOwner: true, 
    noPrefix: true,

    run: async (conn, m) => {
        const from = m.key.remoteJid;

        try {
            const realOwnerNumber = (typeof config.owner[0] === 'string' ? config.owner[0] : config.owner[0][0]).replace(/\D/g, '');
            const senderNumber = m.sender.split('@')[0].replace(/\D/g, '');
            const isRealOwner = senderNumber === realOwnerNumber;

            if (!isRealOwner) {
                return m.reply(`*${config.visuals.emoji2}* \`ACCESO DENEGADO\` *${config.visuals.emoji2}*\n\nSolo el administrador principal tiene autoridad sobre este comando.`);
            }

            await conn.sendMessage(from, { react: { text: '⌚', key: m.key } });

            const { stdout } = await execPromise('git pull');

            if (stdout.includes('Already up to date')) {
                await conn.sendMessage(from, { react: { text: '⏸️', key: m.key } });
                return await conn.sendMessage(from, { 
                    text: '✅ *Sincronización Completa*\n\nEl repositorio y el servidor ya están en la misma versión.' 
                }, { quoted: m });
            }

            const filesChangedMatch = stdout.match(/(\d+)\s+file[s]?\s+changed/);
            const totalFiles = filesChangedMatch ? filesChangedMatch[1] : '0';

            if (global.loadCommands) {
                await global.loadCommands(); 
            }

            await conn.sendMessage(from, { react: { text: '☑️', key: m.key } });

            let updateMsg = `✅ *Actualización realizada exitosamente*\n\n`;
            updateMsg += `*${config.visuals.emoji} Archivos actualizados* » ${totalFiles} Archivos.\n\n`;
            updateMsg += `*Detalles del Update:* \n`;
            updateMsg += `\`\`\`${stdout}\`\`\``;

            await conn.sendMessage(from, { text: updateMsg }, { quoted: m });

        } catch (error) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            await conn.sendMessage(from, { text: `❌ *Error al actualizar:* \n\n${error.message}` }, { quoted: m });
        }
    }
};

export default updateCommand;