import { config } from '../config.js';
import { database } from '../database.js';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const baseGroup = "120363423871589037@g.us";

const rwCommand = {
    name: 'rw',
    alias: ['roll', 'waifu'],
    category: 'gacha',
    desc: 'Realiza un roll para descubrir un nuevo personaje usando la API de Kazuma.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m) => {
        try {
            const group = m.chat;
            const userJid = m.sender;
            const ahora = new Date();
            const cooldownTime = 5 * 60 * 1000;

            let userDb = global.db.data.users[userJid];
            if (!userDb) {
                userDb = await database.getUser(userJid);
            }

            if (!userDb) {
                userDb = { wallet: 0, bank: 0, genre: 'No definido', marry: null, last_claim: '1970-01-01T00:00:00.000Z', last_crime: '1970-01-01T00:00:00.000Z', last_work: '1970-01-01T00:00:00.000Z', last_slut: '1970-01-01T00:00:00.000Z', last_flip: '1970-01-01T00:00:00.000Z', last_rob: '1970-01-01T00:00:00.000Z', last_rw: '1970-01-01T00:00:00.000Z' };
            }

            const lastRoll = new Date(userDb.last_rw || '1970-01-01T00:00:00.000Z').getTime();
            const tiempoPasado = ahora.getTime() - lastRoll;

            if (tiempoPasado < cooldownTime) {
                const restante = cooldownTime - tiempoPasado;
                const minutos = Math.floor(restante / 60000);
                const segundos = Math.floor((restante % 60000) / 1000);
                return m.reply(`*${config.visuals.emoji2}* ¡Espera! Faltan ${minutos} min y ${segundos} seg.`);
            }

            const { data: gachaRes } = await axios.get(
    'https://api.delirius.store/anime/gacha'
);

if (!gachaRes?.status || !gachaRes?.data) {
    return m.reply('Error al obtener personaje del gacha.');
}

const personaje = gachaRes.data;

const randomId = `DLR-${Date.now()}`;

const infoFija = {
    name: personaje.name,
    source: personaje.anime,
    value: Math.floor(Math.random() * 50000) + 1000,
    url: personaje.image
};

const infoGrupo = await database.getCharacterOwner(group, randomId);
const status = infoGrupo ? infoGrupo.status : 'libre';
const owner = infoGrupo ? infoGrupo.user_jid : null;

let imageUrl = personaje.image;

let caption = `*» (❍ᴥ❍ʋ) GACHA ROLL «*\n\n`;
caption += `*Nombre:* ${personaje.name}\n`;
caption += `*Anime:* ${personaje.anime}\n`;
caption += `*Género:* ${personaje.gender}\n`;
caption += `*ID:* ${randomId}\n`;
caption += `*Valor:* ¥${infoFija.value.toLocaleString()}\n`;
caption += `*Estado:* ${status === 'libre' ? 'Libre' : 'Domado'}\n`;

if (owner) {
    caption += `*Dueño:* @${owner.split('@')[0]}\n`;
}

            if (owner) {
                caption += `*Dueño:* @${owner.split('@')[0]}\n`;
            }

            const sent = await conn.sendMessage(m.chat, { 
                image: { url: imageUrl }, 
                caption: caption,
                mentions: owner ? [owner] : []
            }, { quoted: m });

            if (!global.db.data.chats[group]) global.db.data.chats[group] = {};
            if (!global.db.data.chats[group].rolls) global.db.data.chats[group].rolls = {};

            global.db.data.chats[group].rolls[sent.key.id] = { 
                id: randomId, 
                expiresAt: ahora.getTime() + 60000 
            };

            userDb.last_rw = ahora.toISOString();
            global.db.data.users[userJid] = userDb;
            await database.saveUser(userJid, userDb);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en el sistema de gacha.`);
        }
    }
};

export default rwCommand;
