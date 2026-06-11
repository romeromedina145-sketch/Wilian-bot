import { config } from '../config.js';
import { database } from '../database.js';

const setBirth = {
    name: 'setbirth',
    alias: ['setcumple', 'micumple'],
    category: 'profile',
    desc: 'Registra tu fecha de cumpleaños (DD/MM) en tu perfil.',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const fechaInput = args[0];

            if (!fechaInput) {
                return m.reply(`*${config.visuals.emoji2} \`FALTA FECHA\` ${config.visuals.emoji2}*\n\nIngresa tu fecha de nacimiento en formato Día/Mes.\n\n» Ejemplo: *setbirth 14/02*`);
            }

            const regexFecha = /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])$/;
            if (!regexFecha.test(fechaInput)) {
                return m.reply(`*${config.visuals.emoji2} \`FORMATO ERRÓNEO\` ${config.visuals.emoji2}*\n\nUsa el formato exacto de dos dígitos para el día y dos para el mes (DD/MM).\n\n» Ejemplo: *setbirth 05/09*`);
            }

            let userDb = await database.getUser(m.sender);
            if (!userDb) {
                userDb = { wallet: 0, bank: 0, genre: 'No definido', marry: null, birthday: null };
            }

            let currentBirthdayData = { age: 'No definida', date: null };

            if (userDb.birthday) {
                try {
                    currentBirthdayData = typeof userDb.birthday === 'string' ? JSON.parse(userDb.birthday) : userDb.birthday;
                } catch (e) {
                    currentBirthdayData = { age: 'No definida', date: null };
                }
            }

            currentBirthdayData.date = fechaInput;

            userDb.birthday = JSON.stringify(currentBirthdayData);
            await database.saveUser(m.sender, userDb);

            m.reply(`*${config.visuals.emoji3} \`CUMPLEAÑOS REGISTRADO\` ${config.visuals.emoji3}*\n\nTu fecha de nacimiento ha sido configurada en el sistema de manera global.\n\n*❁ Fecha:* \`${fechaInput}\``);

        } catch (e) {
            console.error(e);
            m.reply('✘ Error al registrar cronología.');
        }
    }
};

export default setBirth;