import { config } from '../config.js';
import { database } from '../database.js';

const setAge = {
    name: 'setage',
    alias: ['estableceredad', 'miedad'],
    category: 'profile',
    desc: 'Registra tu edad en tu perfil de la base de datos.',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const edadInput = args[0];

            if (!edadInput) {
                return m.reply(`*${config.visuals.emoji2} \`FALTA EDAD\` ${config.visuals.emoji2}*\n\nIngresa tu edad después del comando.\n\n» Ejemplo: *setage 19*`);
            }

            const edad = parseInt(edadInput.replace(/[^0-9]/g, ''));

            if (isNaN(edad)) {
                return m.reply(`*${config.visuals.emoji2} \`DATO INVÁLIDO\` ${config.visuals.emoji2}*\n\nIngresa una cantidad numérica válida.`);
            }

            if (edad < 8) {
                return m.reply(`*${config.visuals.emoji2}* Eres muy chiquito para andar usando bots.`);
            }

            if (edad > 85) {
                return m.reply(`*${config.visuals.emoji2}* Eres muy mayor como para andar jugando con esto.`);
            }

            const cleanSenderJid = m.sender.split('@')[0].split(':')[0].trim() + '@s.whatsapp.net';

            let userDb = await database.getUser(cleanSenderJid);
            if (!userDb) {
                userDb = { wallet: 0, bank: 0, genre: 'No definido', marry: null, birthday: null };
            }

            let currentBirthdayData = { age: null, date: 'No definido' };

            if (userDb.birthday) {
                try {
                    currentBirthdayData = typeof userDb.birthday === 'string' ? JSON.parse(userDb.birthday) : userDb.birthday;
                } catch (e) {
                    currentBirthdayData = { age: null, date: 'No definido' };
                }
            }

            currentBirthdayData.age = edad;

            // Asegurar que guardamos el objeto actualizado como un string JSON en la propiedad correcta
            userDb.birthday = JSON.stringify(currentBirthdayData);
            
            // Forzar el guardado explícito
            await database.saveUser(cleanSenderJid, userDb);

            m.reply(`*${config.visuals.emoji3} \`EDAD REGISTRADA\` ${config.visuals.emoji3}*\n\nTu edad se ha guardado correctamente.\n\n*❁ Edad:* \`${edad} años\``);

        } catch (e) {
            console.error(e);
            m.reply('✘ Error interno al guardar la edad.');
        }
    }
};

export default setAge;