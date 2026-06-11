import { database } from '../database.js';
import { flipFrases } from './frases/flip.js';

const flipCommand = {
    name: 'flip',
    alias: ['coinflip', 'moneda', 'suerte'],
    category: 'economy',
    desc: 'Apuesta tus coins a cara o cruz eligiendo tu lado con un 30% de probabilidad de ganar.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        try {
            const user = global.db.data.users[m.sender];
            const wallet = user.wallet || 0;
            const now = new Date();
            const lastFlip = new Date(user.last_flip || '1970-01-01T00:00:00.000Z');

            const difference = now - lastFlip;
            const cooldownTime = 15 * 1000;

            if (difference < cooldownTime) {
                const timeLeft = ((cooldownTime - difference) / 1000).toFixed(1);
                return m.reply(`*❁ ¡ESPERA UN MOMENTO! ❁*\n\n» Debes esperar *${timeLeft}s* antes de lanzar la moneda otra vez.`);
            }

            const eleccion = args[0] ? args[0].toLowerCase() : '';
            if (eleccion !== 'cara' && eleccion !== 'cruz') {
                return m.reply(`*❁* Debes elegir entre *cara* o *cruz* antes de hacer tu apuesta.\n\n» Ejemplo: *${usedPrefix || ''}${commandName} cara 5000*`);
            }

            if (!args[1]) {
                return m.reply(`*❁* Especifica una cantidad para apostar o escribe *all*.\n\n» Ejemplo: *${usedPrefix || ''}${commandName} ${eleccion} 5000*`);
            }

            let amount;
            if (args[1].toLowerCase() === 'all') {
                amount = wallet;
            } else {
                amount = parseInt(args[1].replace(/[^0-9]/g, ''));
            }

            if (isNaN(amount) || amount < 1000) {
                return m.reply(`*❁* La cantidad de apuesta debe ser un número entero de *$1,000* coins en adelante.\n\n» Ejemplo: *${usedPrefix || ''}${commandName} ${eleccion} 1000*`);
            }

            if (wallet < amount) {
                return m.reply(`*❁ \`FONDOS INSUFICIENTES\` ❁*\n\n» No tienes suficientes coins en tu billetera.\n» Dispones de: *$${wallet.toLocaleString()}* coins.`);
            }

            user.last_flip = now.toISOString();

            const lados = ['cara', 'cruz'];
            const resultadoMoneda = Math.random() < 0.30 ? eleccion : lados.find(l => l !== eleccion);

            if (resultadoMoneda === eleccion) {
                const frase = flipFrases.win[Math.floor(Math.random() * flipFrases.win.length)];
                
                user.wallet = wallet + amount;
                await database.saveUser(m.sender, user);

                let txt = `*❁ \`APUESTA EXITOSA\` ❁*\n\n`;
                txt += `» La moneda giró en el aire y cayó en: *${resultadoMoneda.toUpperCase()}*\n`;
                txt += `» ${frase}\n\n`;
                txt += `*✰ Ganaste »* $${amount.toLocaleString()} coins\n`;
                txt += `*❀ Total Billetera »* $${user.wallet.toLocaleString()} coins\n\n`;
                txt += `> ✿ ¡La fortuna te acompaña el día de hoy!`;

                return m.reply(txt);
            } else {
                const fraseFallo = flipFrases.lose[Math.floor(Math.random() * flipFrases.lose.length)];
                
                user.wallet = Math.max(0, wallet - amount);
                await database.saveUser(m.sender, user);

                let txt = `*❁ \`APUESTA FALLIDA\` ❁*\n\n`;
                txt += `» La moneda giró en el aire y cayó en: *${resultadoMoneda.toUpperCase()}*\n`;
                txt += `» ${fraseFallo}\n\n`;
                txt += `*✰ Perdiste »* $${amount.toLocaleString()} coins\n`;
                txt += `*❀ Total Billetera »* $${user.wallet.toLocaleString()} coins\n\n`;
                txt += `> ✰ La suerte es caprichosa, vuelve a intentarlo.`;

                return m.reply(txt);
            }

        } catch (e) {
            console.error(e);
            m.reply('Ocurrió un error interno al procesar el comando.');
        }
    }
};

export default flipCommand;