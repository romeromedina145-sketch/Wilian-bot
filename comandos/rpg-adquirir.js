import { config } from '../config.js';

const adquirirCommand = {
    name: 'adquirir',
    alias: ['comprar'],
    category: 'rpg',
    desc: 'Compra objetos especiales de la tienda usando tus coins (cartera o banco).',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const userJid = m.sender.replace(/:.*@/g, '@');
            const userDb = global.db.data.users[userJid];
            
            const itemInput = args[0]?.toLowerCase();
            let amount = parseInt(args[1]) || 1;

            if (!itemInput) return m.reply(`*${config.visuals.emoji2}* Indica qué deseas comprar.\nEjemplo: *#adquirir 1 5*`);
            if (amount <= 0 || isNaN(amount)) return m.reply(`*${config.visuals.emoji2}* La cantidad debe ser un número válido.`);

            const store = {
                "1": { id: "iman", nombre: "Imán de Minas", precio: 25000 },
                "iman": { id: "iman", nombre: "Imán de Minas", precio: 25000 },
                "2": { id: "trebol", nombre: "Trébol de la Suerte", precio: 40000 },
                "trebol": { id: "trebol", nombre: "Trébol de la Suerte", precio: 40000 },
                "3": { id: "escudo", nombre: "Escudo de Mazmorra", precio: 35000 },
                "escudo": { id: "escudo", nombre: "Escudo de Mazmorra", precio: 35000 },
                "4": { id: "amuleto", nombre: "Amuleto del Apostador", precio: 60000 },
                "amuleto": { id: "amuleto", nombre: "Amuleto del Apostador", precio: 60000 }
            };

            const item = store[itemInput];
            if (!item) return m.reply(`*${config.visuals.emoji2}* Ese artículo no existe en la tienda.`);

            const totalCost = item.precio * amount;
            const wallet = Number(userDb.wallet) || 0;
            const bank = Number(userDb.bank) || 0;

            if ((wallet + bank) < totalCost) {
                return m.reply(`*${config.visuals.emoji2}* No tienes suficientes coins.\nTotal necesario: *¥${totalCost.toLocaleString()}*`);
            }

            let remainingToPay = totalCost;
            if (userDb.wallet >= remainingToPay) {
                userDb.wallet -= remainingToPay;
            } else {
                remainingToPay -= userDb.wallet;
                userDb.wallet = 0;
                userDb.bank = (userDb.bank || 0) - remainingToPay;
            }

            if (!userDb.inventory) userDb.inventory = {};
            userDb.inventory[item.id] = (userDb.inventory[item.id] || 0) + amount;

            const textoExito = `*${config.visuals.emoji3}* \`ADQUISICIÓN EXITOSA\` *${config.visuals.emoji3}*

Articulo: *${item.nombre}*
📦 *Cantidad:* ${amount}
💰 *Total pagado:* ¥${totalCost.toLocaleString()}
🎒 *Total en inventario:* ${userDb.inventory[item.id]}

> Los objetos se han guardado en tu mochila.`;

            await m.reply(textoExito);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Hubo un error en la transacción.`);
        }
    }
};

export default adquirirCommand;