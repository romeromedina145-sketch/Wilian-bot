import { config } from '../config.js';
import { database, query } from '../database.js';

const unsellCommand = {
    name: 'unsell',
    alias: ['cancelarsell', 'cancelpj'],
    category: 'gacha',
    desc: 'Retira un personaje que hayas puesto en venta en el mercado del grupo.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        try {
            const group = m.chat;
            const userJid = m.sender;
            const pjId = args[0];

            if (!pjId) return m.reply(`*${config.visuals.emoji2}* Indica el ID del personaje que deseas retirar de la tienda.`);

            const shopItems = await database.listShop(group);
            const item = shopItems.find(i => i.character_id === pjId);

            if (!item) {
                return m.reply(`*${config.visuals.emoji2}* Ese personaje no se encuentra actualmente en venta en este grupo.`);
            }

            const rawUser = userJid.split('@')[0].split(':')[0].trim() + '@s.whatsapp.net';
            const rawSeller = item.seller_jid.split('@')[0].split(':')[0].trim() + '@s.whatsapp.net';

            if (rawSeller !== rawUser) {
                return m.reply(`*${config.visuals.emoji2}* No puedes retirar del mercado un personaje que no pusiste a la venta tú mismo.`);
            }

            await query("DELETE FROM gacha_shop WHERE group_jid = ? AND character_id = ?", [group, pjId]);
            await query("UPDATE gacha_ownership SET status = 'domado' WHERE group_jid = ? AND character_id = ?", [group, pjId]);

            let txt = `*${config.visuals.emoji3} \`MERCADO PÚBLICO\` ${config.visuals.emoji3}*\n\n`;
            txt += `» Has cancelado la venta del personaje correctamente.\n`;
            txt += `*✰ Personaje »* *${item.character_name}*\n\n`;
            txt += `> El personaje ha sido devuelto a tu inventario y ya aparece disponible en tu #harem.`;

            return m.reply(txt);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al retirar el personaje de la tienda.`);
        }
    }
};

export default unsellCommand;