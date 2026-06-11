import { config } from '../config.js';

const setGenreCommand = {
    name: 'setgenre',
    alias: ['genero', 'setgenero'],
    category: 'profile',
    desc: 'Define tu género como hombre o mujer.',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const userJid = m.sender.replace(/:.*@/g, '@');
            const userDb = global.db.data.users[userJid];

            if (!args[0]) {
                return m.reply(`*${config.visuals.emoji2}* Indica tu género.\nUso: *#setgenre hombre* o *#setgenre mujer*`);
            }

            const input = args[0].toLowerCase();

            if (input !== 'hombre' && input !== 'mujer') {
                return m.reply(`*${config.visuals.emoji2}* Solo se permite el género *hombre* o *mujer*.`);
            }

            const generoFinal = input === 'hombre' ? 'Hombre' : 'Mujer';
            userDb.genre = generoFinal;

            await m.reply(`*${config.visuals.emoji3}* \`GÉNERO ACTUALIZADO\`\n\n> Ahora tu perfil mostrará: *${generoFinal}*`);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al procesar el género.`);
        }
    }
};

export default setGenreCommand;