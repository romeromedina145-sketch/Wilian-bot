import { config } from '../config.js';
import axios from 'axios';

const tiktokDownload = {
    name: 'tiktok',
    alias: ['tt', 'ttdl'],
    category: 'descargas',
    desc: 'Descarga videos de TikTok.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        const urlMatch = text?.match(/https?:\/\/[^\s]+/gi);
        const link = urlMatch ? urlMatch[0] : null;

        if (!link) return m.reply(`*${config.visuals.emoji2}* Ingresa un enlace para descargar el vídeo.`);

        await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        try {
            const { data: res } = await axios.get(`https://${config.kzmUrl}/api/download/tiktok?url=${link}&apiKey=${config.apiKzm}`);

            if (!res.status || !res.data) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return m.reply('Video no encontrado.');
            }

            const { title, author, media } = res.data;
            let txt = `*${config.visuals.emoji3} TikTok*\n\n📝 ${title}\n👤 ${author.nickname}\n📦 ${media.size}`;

            await conn.sendMessage(m.chat, { video: { url: media.no_watermark }, caption: txt }, { quoted: m });
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        } catch (e) {
            await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
            m.reply(`*${config.visuals.emoji2}* Error: ${e.response?.data?.error || e.message}`);
        }
    }
};

export default tiktokDownload;