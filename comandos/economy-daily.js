import { database } from '../database.js';

const dailyCommand = {
    name: 'daily',
    alias: ['claim', 'diario', 'bono'],
    category: 'economy',
    desc: 'Reclama tu bono diario de coins.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        try {
            const user = global.db.data.users[m.sender];
            const now = new Date();
            const lastClaim = new Date(user.last_claim || '1970-01-01T00:00:00.000Z');

            const difference = now - lastClaim;
            const cooldownTime = 24 * 60 * 60 * 1000; // 24 Horas en milisegundos

            if (difference < cooldownTime) {
                const timeLeft = cooldownTime - difference;
                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                
                return m.reply(`*❁ ¡ESPERA UN MOMENTO! ❁*\n\n» Ya has reclamado tu recompensa diaria.\n» Debes esperar *${hours}h ${minutes}m ${seconds}s* para volver a solicitarla.`);
            }

            // Guardamos el tiempo exacto actual en formato ISO string
            user.last_claim = now.toISOString();

            // Recompensa aleatoria estética entre 15,000 y 30,000 coins
            const reward = Math.floor(Math.random() * (30000 - 15000 + 1)) + 15000;
            user.wallet = (user.wallet || 0) + reward;

            // Guardar directamente en la base de datos sqlite
            await database.saveUser(m.sender, user);

            let txt = `*❁ \`RECOMPENSA DIARIA\` ❁*\n\n`;
            txt += `» ¡Has recibido tu bono del día con éxito!\n`;
            txt += `*✰ Ganaste »* $${reward.toLocaleString()} coins\n\n`;
            txt += `> ✿ Vuelve mañana para seguir acumulando riqueza.`;

            return m.reply(txt);

        } catch (e) {
            console.error(e);
            m.reply('Ocurrió un error interno al procesar el comando.');
        }
    }
};

export default dailyCommand;