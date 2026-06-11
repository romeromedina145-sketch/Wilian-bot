import fs from 'fs';
import path from 'path';
import { config } from '../config.js';
import { database } from '../database.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const baseGroup = "120363423871589037@g.us";

const sellCommand = {
    name: 'sell',
    alias: ['vender'],
    category: 'gacha',
    desc: 'Pon uno de tus personajes en el mercado del grupo para que otros puedan comprarlo.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        try {
            const group = m.chat;
            const userJid = m.sender;
            const pjId = args[0];
            let precioRaw = args[1];

            if (!pjId || !precioRaw) {
                return m.reply(`*${config.visuals.emoji2}* \`Uso Incorrecto\`\n• Usa el comando de la siguiente manera:\n> .sell (ID) (Precio)`);
            }

            precioRaw = precioRaw.replace(/[\$,\.]/g, '');
            const price = parseInt(precioRaw);

            if (isNaN(price) || price <= 0) {
                return m.reply(`*${config.visuals.emoji2}* Por favor, ingresa un precio numérico válido.`);
            }

            if (!fs.existsSync(gachaPath)) return m.reply(`*${config.visuals.emoji2}* Error: DB Gacha no encontrada.`);
            const rawData = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            const plantillaPersonajes = rawData[baseGroup];

            if (!plantillaPersonajes[pjId]) {
                return m.reply(`*${config.visuals.emoji2}* El personaje con ID \`${pjId}\` no existe.`);
            }

            const infoPj = await database.getCharacterOwner(group, pjId);
            
            const rawUser = userJid.split('@')[0].split(':')[0].trim() + '@s.whatsapp.net';
            const rawOwner = infoPj?.user_jid ? infoPj.user_jid.split('@')[0].split(':')[0].trim() + '@s.whatsapp.net' : null;

            if (!infoPj || rawOwner !== rawUser) {
                return m.reply(`*${config.visuals.emoji2}* ¡Este personaje no te pertenece o no está en tu colección!`);
            }

            if (infoPj.status === 'en_venta') {
                return m.reply(`*${config.visuals.emoji2}* Este personaje ya se encuentra publicado en el mercado.`);
            }

            const pjPlantilla = plantillaPersonajes[pjId];
            const minPrice = (pjPlantilla.value || 0) + 1000;

            if (price < minPrice) {
                return m.reply(`*${config.visuals.emoji2}* El precio mínimo de venta para este personaje es *$${minPrice.toLocaleString()}* coins.`);
            }

            await database.listCharacter(group, userJid, pjId, pjPlantilla.name, price);

            let txt = `*${config.visuals.emoji3} \`MERCADO PÚBLICO\` ${config.visuals.emoji3}*\n\n`;
            txt += `» Has puesto en venta a *${pjPlantilla.name}* correctamente.\n`;
            txt += `*✰ Precio fijado »* $${price.toLocaleString()} coins\n`;
            txt += `*✰ ID Único »* \`${pjId}\`\n\n`;
            txt += `\n> ¡Esperemos que algún coleccionista se interese en tu oferta!`;

            return m.reply(txt);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al procesar el reclamo en la base de datos.`);
        }
    }
};

export default sellCommand;