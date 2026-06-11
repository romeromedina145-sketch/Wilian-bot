import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const jsonDir = path.resolve('./jsons');
const prefixPath = path.join(jsonDir, 'prefix.json');

const prefixCommand = {
    name: 'setprefix',
    alias: ['prefix', 'prefijo'],
    category: 'owner',
    desc: 'Establece un prefijo único para que el bot responda globalmente.',
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

            if (fs.existsSync(prefixPath)) {
                const current = JSON.parse(fs.readFileSync(prefixPath, 'utf-8'));
                if (current.selected) {
                    return m.reply(`*${config.visuals.emoji2}* \`ACCIÓN DENEGADA\`\n\nYa hay un prefijo establecido: \`${current.selected}\`\n\n> Usa el comando *#resetprefix* para volver a la configuración de fábrica.`);
                }
            }

            if (!fs.existsSync(jsonDir)) fs.mkdirSync(jsonDir, { recursive: true });

            const newPrefix = args[0];
            const availablePrefixes = config.allPrefixes || ['#', '!', '.'];

            if (!newPrefix || !availablePrefixes.includes(newPrefix)) {
                return m.reply(`*${config.visuals.emoji2}* \`Prefijo Inválido\`\n\nElige uno permitido: \`${availablePrefixes.join(' ')}\``);
            }

            fs.writeFileSync(prefixPath, JSON.stringify({ selected: newPrefix }, null, 2));
            await m.reply(`*${config.visuals.emoji3}* \`PREFIJO ESTABLECIDO\`\n\nAhora solo responderé a: \`${newPrefix}\``);

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al configurar.`);
        }
    }
};

export default prefixCommand;
