import { config } from '../config.js';
import axios from 'axios';

const aiKazuma = {
    name: 'kazuma',
    alias: ['ai', 'ia', 'gemini'],
    category: 'ia',
    desc: 'Habla con la IA de Kazuma.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        if (!text) return m.reply(`*${config.visuals.emoji2}* Hola ${m.pushName}, ¿qué necesitas?`);

        await conn.sendMessage(m.chat, { react: { text: '🧠', key: m.key } });
        const { key } = await m.reply('*⌛* Procesando respuesta, espera un momento...');

        const prompt = `Actúa como Kazuma, el asistente inteligente de este bot creado por Félix Ofc. Tu personalidad es alegre, servicial y muy entusiasta. Debes ser amigable con ${m.pushName} y demostrar mucha energía en cada respuesta. IMPORTANTE: No utilices emojis en tus respuestas bajo ninguna circunstancia. Para resaltar texto en negrita utiliza únicamente UN solo asterisco, por ejemplo: *así*. No utilices doble asterisco bajo ninguna circunstancia. Responde de forma creativa a lo siguiente: `;

        try {
            const { data: res } = await axios.get(`https://${config.kzmUrl}/api/ai/gemini?text=${encodeURIComponent(prompt + text)}&cookie=cokie&apiKey=${config.apiKzm}`);

            if (!res.status || !res.data?.response) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return conn.sendMessage(m.chat, { text: 'La IA no devolvió una respuesta válida.', edit: key });
            }

            await conn.sendMessage(m.chat, { text: res.data.response, edit: key });
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
            const errorMsg = `*${config.visuals.emoji2}* Error: ${e.response?.data?.message || e.message}`;
            await conn.sendMessage(m.chat, { text: errorMsg, edit: key });
        }
    }
};

export default aiKazuma;