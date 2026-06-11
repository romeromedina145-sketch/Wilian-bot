import { config } from '../config.js';
import axios from 'axios';

const sswebDownload = {
    name: 'ssweb',
    alias: ['screenshot', 'ss'],
    category: 'tools',
    desc: 'Toma una captura de pantalla de un sitio web.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        if (!text) return m.reply(`*${config.visuals.emoji2}* Por favor, ingresa el enlace de la página web.`);

        let link = text.trim().split(/\s+/)[0];

        if (!/^https?:\/\//i.test(link)) {
            link = `https://${link}`;
        }

        await conn.sendMessage(m.chat, { react: { text: '📸', key: m.key } });

        try {
            const ssUrl = `https://${config.kzmUrl}/api/tools/ssweb?apiKey=${config.apiKzm}&url=${encodeURIComponent(link)}&device=phone&theme=dark`;

            await conn.sendMessage(m.chat, { 
                image: { url: ssUrl }, 
                caption: `*${config.visuals.emoji3} Screenshot Web*\n\n🌐 *URL:* ${link}` 
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
            m.reply(`*${config.visuals.emoji2}* Error al generar la captura. Asegúrate de que la URL sea válida.`);
        }
    }
};

export default sswebDownload;