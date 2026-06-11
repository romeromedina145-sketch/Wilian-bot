import { config } from '../config.js';

const totalCommands = {
    name: 'totalcommands',
    alias: ['commands', 'total', 'cmdtotal'],
    category: 'owner',
    desc: 'Muestra la cantidad total de comandos cargados actualmente en el sistema.',
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

            const total = global.commands.size;

            let txt = `*${config.visuals.emoji3} \`ESTADÍSTICAS DE COMANDOS\` ${config.visuals.emoji3}*\n\n`;
            txt += `Actualmente el bot tiene un arsenal de:\n`;
            txt += `> *${total}* comandos cargados.\n\n`;
            txt += `» Todos los módulos han sido verificados y están operativos en el sistema.\n\n`;
            txt += `> *${config.visuals.emoji4}* kazuma.giize.com`;

            await conn.sendMessage(m.chat, { text: txt }, { quoted: m });
        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al contabilizar los comandos.`);
        }
    }
};

export default totalCommands;
