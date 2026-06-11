import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const prefixPath = path.resolve('./jsons/prefix.json');

const resetPrefix = {
    name: 'resetprefix',
    alias: ['delprefix', 'rprefix'],
    category: 'owner',
    desc: 'Elimina el prefijo personalizado y restaura los prefijos de fábrica.',
    isOwner: true,
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const realOwnerNumber = (typeof config.owner[0] === 'string' ? config.owner[0] : config.owner[0][0]).replace(/\D/g, '');
            const senderNumber = m.sender.split('@')[0].replace(/\D/g, '');
            const isRealOwner = senderNumber === realOwnerNumber;

            if (!isRealOwner) {
                return m.reply(`*${config.visuals.emoji2}* \`ACCESO DENEGADO\` *${config.visuals.emoji2}*\n\nSolo el administrador principal tiene autoridad sobre este comando.`);
            }

            if (fs.existsSync(prefixPath)) {
                fs.unlinkSync(prefixPath);
                await m.reply(`*${config.visuals.emoji3}* \`CONFIGURACIÓN RESETEADA\`\n\nSe han restaurado todos los prefijos de fábrica correctamente.`);
            } else {
                await m.reply(`*${config.visuals.emoji2}* No hay ningún prefijo personalizado para eliminar.`);
            }
        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al resetear el prefijo.`);
        }
    }
};

export default resetPrefix;