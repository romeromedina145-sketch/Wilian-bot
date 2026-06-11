import { config } from '../config.js';

const inventoryCommand = {
    name: 'inventario',
    alias: ['inv', 'mochila', 'bag'],
    category: 'rpg',
    desc: 'Muestra los objetos especiales y consumibles que tienes en tu mochila.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const userJid = m.sender.replace(/:.*@/g, '@');
            const userDb = global.db.data.users[userJid];

            if (!userDb.inventory || Object.keys(userDb.inventory).length === 0) {
                return m.reply(`*${config.visuals.emoji2}* Tu mochila está completamente vacía.`);
            }

            const itemMap = {
                iman: { nombre: "Imán de Minas", emoji: "🧲" },
                trebol: { nombre: "Trébol de la Suerte", emoji: "🍀" },
                escudo: { nombre: "Escudo de Mazmorra", emoji: "🛡️" },
                amuleto: { nombre: "Amuleto del Apostador", emoji: "🧧" }
            };

            let inventoryText = `*${config.visuals.emoji3}* \`MOCHILA DE AVENTURERO\` *${config.visuals.emoji3}*\n\n`;
            let hasItems = false;

            for (const [id, cantidad] of Object.entries(userDb.inventory)) {
                if (cantidad > 0 && itemMap[id]) {
                    hasItems = true;
                    inventoryText += `${itemMap[id].emoji} *${itemMap[id].nombre}*\n> *Cantidad:* ${cantidad}\n\n`;
                }
            }

            if (!hasItems) {
                return m.reply(`*${config.visuals.emoji2}* No tienes objetos consumibles en tu mochila.`);
            }

            inventoryText += `_Puedes adquirir más ítems usando el comando #tienda_`;

            await conn.sendMessage(m.chat, { 
                text: inventoryText 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Hubo un error al abrir tu inventario.`);
        }
    }
};

export default inventoryCommand;