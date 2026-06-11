import { config } from '../config.js';
import axios from 'axios';

const imgCommand = {
    name: 'img',
    alias: ['imagen', 'imgg'],
    category: 'descargas',
    desc: 'Busca y envía la primera imagen de Pinterest.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        if (!text) return m.reply(`*${config.visuals.emoji2}* Por favor, ingresa un texto para generar tu imagen.`);

        await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        const apiUrl = 'https://rest.kazuma.uk';
        const apiKey = 'kzm-OAiJOEWc-dRXYVXtW';

        try {
            const response = await axios.get(`${apiUrl}/api/search/pinterest?query=${encodeURIComponent(text)}&apiKey=${apiKey}`);
            const res = response.data;

            if (!res.status || !res.data || res.data.length === 0) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return m.reply('No se encontraron resultados para tu búsqueda.');
            }

            const firstImage = res.data[0].image_url;
            
            await conn.sendMessage(m.chat, { 
                image: { url: firstImage }, 
                caption: `*${config.visuals.emoji3} Imagen generada ${config.visuals.emoji3}*\n\n✨ Resultado para: *${text}*`
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
            m.reply(`*${config.visuals.emoji2}* Error al conectar con la API.`);
        }
    }
};

export default imgCommand;