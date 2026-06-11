import { config } from '../config.js';

const delGenre = {
    name: 'delgenre',
    alias: ['borrargenero'],
    category: 'profile',
    desc: 'Elimina tu género registrado de la base de datos.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const userJid = m.sender.replace(/:.*@/g, '@');
            const userDb = global.db.data.users[userJid];

            if (!userDb || !userDb.genre) {
                return m.reply(`*${config.visuals.emoji2} \`DATO INEXISTENTE\` ${config.visuals.emoji2}*\n\nNo posees un género establecido para borrar.\n\n> ¡Usa #setgenre para registrarte!`);
            }

            delete userDb.genre;

            m.reply(`*${config.visuals.emoji3} \`GÉNERO PURGADO\` ${config.visuals.emoji3}*\n\nTu identidad ha sido eliminada de la base de datos 🗑️\n\n> ¡Puedes volver a elegir un género cuando gustes!`);
        } catch (e) {
            console.error(e);
            m.reply('✘ Error al purgar identidad.');
        }
    }
};

export default delGenre;