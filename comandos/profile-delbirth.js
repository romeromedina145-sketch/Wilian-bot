import { config } from '../config.js';
import { database } from '../database.js';

const delBirth = {
    name: 'delbirth',
    alias: ['borrarcumple'],
    category: 'profile',
    desc: 'Elimina tu fecha de nacimiento registrada en el sistema.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            let userDb = await database.getUser(m.sender);

            if (!userDb || !userDb.birthday) {
                return m.reply(`*${config.visuals.emoji2} \`DATO INEXISTENTE\` ${config.visuals.emoji2}*\n\nNo hay fecha para borrar.`);
            }

            userDb.birthday = null;
            await database.saveUser(m.sender, userDb);

            m.reply(`*${config.visuals.emoji3} \`REGISTRO PURGADO\` ${config.visuals.emoji3}*\n\nFecha eliminada.\n\n> ¡Has vuelto a ser un ser sin tiempo!`);
        } catch (e) {
            console.error(e);
            m.reply('✘ Error al purgar cronología.');
        }
    }
};

export default delBirth;