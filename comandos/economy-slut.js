import { database } from '../database.js';
import { winFrases, loseFrases } from './frases/slut.js';

const slutCommand = {
    name: 'slut',
    alias: ['prostituta', 'tubo', 'puta'],
    category: 'economy',
    desc: 'Trabaja en el club nocturno para ganar o perder coins.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        try {
            const user = global.db.data.users[m.sender];
            const now = new Date();
            const lastSlut = new Date(user.last_slut || '1970-01-01T00:00:00.000Z');

            const difference = now - lastSlut;
            const cooldownTime = 12 * 60 * 1000;

            if (difference < cooldownTime) {
                const timeLeft = cooldownTime - difference;
                const minutes = Math.floor(timeLeft / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                return m.reply(`*❁ ¡ESPERA UN MOMENTO! ❁*\n\n» Debes esperar *${minutes}m ${seconds}s* antes de volver al club.`);
            }

            user.last_slut = now.toISOString();
            const chance = Math.random() < 0.65;

            if (chance) {
                const frase = winFrases[Math.floor(Math.random() * winFrases.length)];
                const reward = Math.floor(Math.random() * (25000 - 10000 + 1)) + 10000;

                user.wallet = (user.wallet || 0) + reward;
                await database.saveUser(m.sender, user);

                let txt = `*❁ \`CLUB NOCTURNO\` ❁*\n\n`;
                txt += `» ${frase}\n`;
                txt += `*✰ Ganaste »* $${reward.toLocaleString()} coins\n\n`;
                txt += `> ¡Sigue deslumbrando a todos en la pista!`;

                return m.reply(txt);
            } else {
                const fraseFallo = loseFrases[Math.floor(Math.random() * loseFrases.length)];
                const loss = Math.floor(Math.random() * (12000 - 6000 + 1)) + 6000;

                user.wallet = Math.max(0, (user.wallet || 0) - loss);
                await database.saveUser(m.sender, user);

                let txt = `*❁ \`CLUB NOCTURNO\` ❁*\n\n`;
                txt += `» ${fraseFallo}\n`;
                txt += `*✰ Perdiste »* $${loss.toLocaleString()} coins\n\n`;
                txt += `> ¡Ten más cuidado la próxima noche!`;

                return m.reply(txt);
            }

        } catch (e) {
            console.error(e);
            m.reply('Ocurrió un error interno al procesar el comando.');
        }
    }
};

export default slutCommand;