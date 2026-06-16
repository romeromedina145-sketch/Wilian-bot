import { config } from '../config.js';
import axios from 'axios';

const aiCommand = {
    name: 'chatgpt',
    alias: ['gpt-4', 'gpt'],
    category: 'ia',
    desc: 'Interactúa con ChatGPT o genera imágenes automáticamente.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        if (!text) {
            return m.reply(`*${config.visuals.emoji2}* ¿En qué puedo ayudarte hoy?`);
        }

        await conn.sendMessage(m.chat, {
            react: { text: '⌛', key: m.key }
        });

        const isImageRequest = /genera|dibuja|imagen|foto|search|buscame/i.test(text);

        try {

            if (isImageRequest) {

                const search = text.replace(
                    /(chatgpt|ia|gpt-4|gpt|genera|dibuja|buscame|search|una|un|de|la|el|imagen|foto)/gi,
                    ''
                ).trim();

                const query = search || text;

                const { data: res } = await axios.get(
                    `https://api.delirius.store/search/pinterest?text=${encodeURIComponent(query)}`
                );

                const images = res?.resultados || [];

                if (!images.length) {
                    await conn.sendMessage(m.chat, {
                        react: { text: '❌', key: m.key }
                    });

                    return m.reply(
                        `*${config.visuals.emoji2}* No pude encontrar imágenes para esa búsqueda.`
                    );
                }

                const randomImage =
                    images[Math.floor(Math.random() * images.length)];

                await conn.sendMessage(
                    m.chat,
                    {
                        image: { url: randomImage },
                        caption: `*${config.visuals.emoji3} Inteligencia Visual*\n\n✨ Aquí tienes una imagen sobre: *${query}*`
                    },
                    { quoted: m }
                );

            } else {

                const { data: res } = await axios.get(
                    `https://api.delirius.store/ia/chatgpt?q=${encodeURIComponent(text)}`
                );

                const respuesta =
                    res?.datos ||
                    res?.data ||
                    res?.response ||
                    null;

                if (!respuesta) {
                    await conn.sendMessage(m.chat, {
                        react: { text: '❌', key: m.key }
                    });

                    return m.reply(
                        `*${config.visuals.emoji2}* La IA no devolvió una respuesta válida.`
                    );
                }

                await m.reply(respuesta);
            }

            await conn.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            });

        } catch (e) {
            console.error('Error ChatGPT:', e);

            await conn.sendMessage(m.chat, {
                react: { text: '✖️', key: m.key }
            });

            m.reply(
                `*${config.visuals.emoji2}* Error en el sistema central.\n\n${e.message}`
            );
        }
    }
};

export default aiCommand;