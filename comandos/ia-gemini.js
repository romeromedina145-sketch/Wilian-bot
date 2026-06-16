import { config } from '../config.js';
import axios from 'axios';

const aiDelirius = {
    name: 'Saitama',
    alias: ['ai', 'ia', 'gemini'],
    category: 'ia',
    desc: 'Habla con la IA de Saitama.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        if (!text) {
            return m.reply(`*${config.visuals.emoji2}* Hola ${m.pushName}, ¿qué necesitas?`);
        }

        await conn.sendMessage(m.chat, {
            react: { text: '🧠', key: m.key }
        });

        const { key } = await m.reply('*⌛* Procesando respuesta, espera un momento...');

        const prompt = `Actúa como Saitama, el asistente inteligente de este bot creado por SAI. Tu personalidad es alegre, servicial y muy entusiasta. Debes ser amigable con ${m.pushName} y demostrar mucha energía en cada respuesta. IMPORTANTE: No utilices emojis en tus respuestas bajo ninguna circunstancia. Para resaltar texto en negrita utiliza únicamente UN solo asterisco, por ejemplo: *así*. No utilices doble asterisco bajo ninguna circunstancia. Responde de forma creativa a lo siguiente: `;

        try {
            const query = encodeURIComponent(prompt + text);

            const { data: res } = await axios.get(
                `https://api.delirius.store/ia/gemini?query=${query}`
            );

            const respuesta =
                res?.data?.result ||
                res?.datos?.resultado ||
                res?.result ||
                res?.response;

            if (!respuesta) {
                await conn.sendMessage(m.chat, {
                    react: { text: '❌', key: m.key }
                });

                return conn.sendMessage(
                    m.chat,
                    {
                        text: 'La IA no devolvió una respuesta válida.',
                        edit: key
                    }
                );
            }

            await conn.sendMessage(
                m.chat,
                {
                    text: respuesta,
                    edit: key
                }
            );

            await conn.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            });

        } catch (e) {
            console.error(e);

            await conn.sendMessage(m.chat, {
                react: { text: '✖️', key: m.key }
            });

            await conn.sendMessage(
                m.chat,
                {
                    text: `*${config.visuals.emoji2}* Error: ${e.message}`,
                    edit: key
                }
            );
        }
    }
};

export default aiDelirius;