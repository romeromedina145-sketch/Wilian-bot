import { config } from '../config.js';

const shopCommand = {
    name: 'tienda',
    alias: ['shop', 'market', 'store'],
    category: 'rpg',
    desc: 'Muestra el catálogo de objetos disponibles para comprar.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const displayShortName = conn.user.shortName || config.botName;

            const textoTienda = `*${config.visuals.emoji3}* \`TIENDA - ${displayShortName.toUpperCase()}\` *${config.visuals.emoji3}*\n\n🛒 *ARTÍCULOS DISPONIBLES*\n\n1. 🧲 *Imán de Minas* (¥25,000)\n> Duplica recursos en tu próxima minería.\n\n2. 🍀 *Trébol de la Suerte* (¥40,000)\n> Evita fallos en tu próxima pesca.\n\n3. 🛡️ *Escudo de Mazmorra* (¥35,000)\n> Reduce el cooldown de mazmorra al 50%.\n\n4. 🧧 *Amuleto del Apostador* (¥60,000)\n> Sube el límite de apuesta en PPT a ¥30,000.\n\n---\n💡 *Uso:* #adquirir [número/nombre]`;

            await conn.sendMessage(m.chat, { 
                text: textoTienda 
            }, { quoted: m });
        } catch (e) {
            console.error(e);
            m.reply('✘ Error al acceder al mercado.');
        }
    }
};

export default shopCommand;