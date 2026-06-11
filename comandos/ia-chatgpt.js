import { config } from '../config.js';
import axios from 'axios';

const aiCommand = {
    name: 'chatgpt',
    alias: ['gpt-4', 'gpt'],
    category: 'ia',
    desc: 'Interactúa con ChatGPT o genera imágenes automáticamente.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        if (!text) return m.reply(`*${config.visuals.emoji2}* ¿En qué puedo ayudarte hoy?`);

        await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        const isImageRequest = /genera|dibuja|imagen|foto|search|buscame/i.test(text);

        try {
            if (isImageRequest) {
                const search = text.replace(/(chatgpt|ia|gpt-4|gpt|genera|dibuja|buscame|search|una|un|de|la|el|imagen|foto)/gi, '').trim();
                
                const query = search || text;
                const response = await axios.get(`https://${config.kzmUrl}/api/search/pinterest?query=${encodeURIComponent(query)}&apiKey=kzm-YjSNMaIR-dJPiYORN`);
                const res = response.data;

                if (!res.status || !res.data || res.data.length === 0) {
                    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                    return m.reply('No pude encontrar una imagen para esa solicitud.');
                }

                const firstImage = res.data[0].image_url;
                await conn.sendMessage(m.chat, { 
                    image: { url: firstImage }, 
                    caption: `*${config.visuals.emoji3} Inteligencia Visual*\n\n✨ Aquí tienes la imagen que generé sobre: *${query}*`
                }, { quoted: m });

            } else {
                const response = await axios.get(`https://${config.kzmUrl}/api/ai/chatgpt?apiKey=kzm-YjSNMaIR-dJPiYORN&text=${encodeURIComponent(text)}&cookie=Cokie`);
                const res = response.data;

                if (!res.status || !res.data) {
                    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                    return m.reply('Lo siento, la IA no respondió correctamente.');
                }

                await m.reply(res.data.response);
            }

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
            m.reply(`*${config.visuals.emoji2}* Error en el sistema central.`);
        }
    }
};

export default aiCommand;