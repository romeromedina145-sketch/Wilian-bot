import { config } from '../config.js';
import { database } from '../database.js';

const haremShop = {
    name: 'haremshop',
    alias: ['gachashop', 'tienda'],
    category: 'gacha',
    desc: 'Explora el mercado local del grupo para ver qué personajes han puesto en venta otros usuarios.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        try {
            const group = m.chat;

            const items = await database.listShop(group);

            if (!items || items.length === 0) {
                return m.reply(`*${config.visuals.emoji2}* El mercado de este grupo está vacío en este momento.`);
            }

            let page = args[0] ? parseInt(args[0]) : 1;
            if (isNaN(page) || page < 1) page = 1;

            const pageSize = 10;
            const totalPages = Math.ceil(items.length / pageSize);
            const start = (page - 1) * pageSize;
            const end = start + pageSize;
            const currentItems = items.slice(start, end);

            if (currentItems.length === 0) return m.reply(`*${config.visuals.emoji2}* Página no encontrada.`);

            let txt = `*${config.visuals.emoji3} \`MERCADO DE PERSONAJES\` ${config.visuals.emoji3}*\n\n`;
            txt += `*✰ Página »* ${page} de ${totalPages}\n\n`;

            let mentions = [];
            currentItems.forEach((item, i) => {
                const sellerClean = item.seller_jid.replace(/:.*@/g, '@');
                const sellerId = sellerClean.split('@')[0];
                txt += `*${start + i + 1}.* ${item.character_name} (\`${item.character_id}\`)\n`;
                txt += `  ᗒ *Vendedor:* @${sellerId}\n`;
                txt += `  ᗒ *Precio:* $${item.sale_price.toLocaleString()} coins\n\n`;
                if (!mentions.includes(item.seller_jid)) mentions.push(item.seller_jid);
            });

            txt += `> Usa el comando \`.buy (ID)\` para comprar un personaje listado.`;

            await conn.sendMessage(m.chat, { 
                text: txt, 
                mentions: mentions 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al cargar el mercado.`);
        }
    }
};

export default haremShop;