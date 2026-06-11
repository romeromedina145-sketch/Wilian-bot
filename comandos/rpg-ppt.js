import { config } from '../config.js';
import { pptPhrases } from './frases/rpg/ppt.js';

const pptCommand = {
    name: 'ppt',
    alias: ['juego', 'piedrapapelotijera'],
    category: 'rpg',
    desc: 'Duelo de Piedra, Papel o Tijera con apuestas. El amuleto dobla el límite de apuesta.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix) => {
        try {
            const userJid = m.sender.replace(/:.*@/g, '@');
            const userDb = global.db.data.users[userJid];
            
            const choice = args[0]?.toLowerCase();
            const betInput = args[1];

            const tieneAmuleto = userDb.inventory?.amuleto > 0;
            const minBet = 4000;
            const maxBet = tieneAmuleto ? 30000 : 15000;
            const cooldown = 5 * 60 * 1000; 

            if (!choice || !['piedra', 'papel', 'tijera'].includes(choice)) {
                return m.reply(`*${config.visuals.emoji2} \`FORMATO INCORRECTO\` ${config.visuals.emoji2}*\n\n> Uso: *${usedPrefix}ppt (piedra/papel/tijera) (cantidad)*`);
            }

            const bet = parseInt(betInput);
            if (!betInput || isNaN(bet) || bet <= 0) return m.reply(`*${config.visuals.emoji2}* Ingresa una apuesta válida.`);

            if (bet < minBet || bet > maxBet) {
                return m.reply(`*${config.visuals.emoji2}* Apuesta permitida: *¥${minBet.toLocaleString()}* - *¥${maxBet.toLocaleString()}*.${tieneAmuleto ? '' : '\n\n💡 *Tip:* Usa un Amuleto del Apostador para subir el límite.'}`);
            }

            const now = Date.now();
            if (now - (userDb.lastPpt || 0) < cooldown) {
                const timeLeft = cooldown - (now - userDb.lastPpt);
                return m.reply(`*${config.visuals.emoji2}* Espera *${Math.floor(timeLeft / 60000)}m ${Math.floor((timeLeft % 60000) / 1000)}s*.`);
            }

            const totalMoney = (userDb.wallet || 0) + (userDb.bank || 0);
            if (totalMoney < bet) return m.reply(`*${config.visuals.emoji2}* No tienes suficiente dinero.`);

            const isWin = Math.random() < 0.50; 
            let botChoice = isWin ? (choice === 'piedra' ? 'tijera' : choice === 'papel' ? 'piedra' : 'papel') : (choice === 'piedra' ? 'papel' : choice === 'papel' ? 'tijera' : 'piedra');
            const result = isWin ? 'win' : 'lose';
            const phrase = pptPhrases[result][Math.floor(Math.random() * pptPhrases[result].length)];

            if (tieneAmuleto) {
                userDb.inventory.amuleto -= 1;
            }

            if (result === 'lose') {
                if (userDb.wallet >= bet) userDb.wallet -= bet;
                else {
                    const rem = bet - (userDb.wallet || 0);
                    userDb.wallet = 0;
                    userDb.bank = (userDb.bank || 0) - rem;
                }
            } else {
                userDb.wallet = (userDb.wallet || 0) + bet;
            }

            userDb.lastPpt = now;

            const emojiMap = { piedra: '🗿', papel: '📄', tijera: '✂️' };
            await m.reply(`*${config.visuals.emoji3}* \`DUELO DE PPT\` *${config.visuals.emoji3}*\n${tieneAmuleto ? '🧧 *¡AMULETO USADO!*\n' : ''}\n👤 *Tú:* ${choice.toUpperCase()} ${emojiMap[choice]}\n🤖 *Bot:* ${botChoice.toUpperCase()} ${emojiMap[botChoice]}\n\n> ${phrase}\n\n${result === 'win' ? `💰 *Ganaste:* ¥${bet.toLocaleString()}` : `📉 *Perdiste:* ¥${bet.toLocaleString()}`}`);
        } catch (e) {
            console.error(e);
            m.reply('✘ Error en el sistema de PPT.');
        }
    }
};

export default pptCommand;