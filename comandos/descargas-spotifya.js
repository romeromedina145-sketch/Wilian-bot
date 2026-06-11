import { config } from '../config.js';
import axios from 'axios';

const spotifyDownload = {
    name: 'spotify',
    alias: ['sp', 'spdls'],
    category: 'descargas',
    desc: 'Descarga música de Spotify mediante enlace.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        const urlMatch = text?.match(/https?:\/\/[^\s]+/gi);
        const link = urlMatch ? urlMatch[0] : null;

        if (!link) return m.reply(`*${config.visuals.emoji2}* Por favor, proporciona un enlace de Spotify.`);

        if (!link.includes('https://open.spotify.com/track/3xltAYY9fbM1v9DUY2LFdt?si=PN-JKS5wRwKNhCve7kT1Ig')) {
            return m.reply(`*${config.visuals.emoji2}* El enlace no parece ser de Spotify. Verifica la URL.`);
        }

        await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        try {
            const { data: res } = await axios.get(`https://${config.kzmUrl}/api/download/spotify?url=${encodeURIComponent(link)}&apiKey=${config.apiKzm}`);

            if (!res.status || !res.result) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return m.reply('No se pudo obtener información de este enlace.');
            }

            const data = res.result;

            const infoText = `*${config.visuals.emoji3} Spotify Download ${config.visuals.emoji3}*\n\n` +
                             `*= Título* »\n> ${data.title}\n` +
                             `*= Artista* »\n> ${data.artist || 'Desconocido'}\n` +
                             `*= Enlace* »\n> ${link}\n\n` +
                             `_Enviando audio, espera un momento..._`;

            await conn.sendMessage(m.chat, { 
                image: { url: data.thumbnail }, 
                caption: infoText 
            }, { quoted: m });

            await conn.sendMessage(m.chat, { 
                audio: { url: data.download_url }, 
                mimetype: 'audio/mp4', 
                fileName: `${data.title}.mp3` 
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
            m.reply(`*${config.visuals.emoji2}* Error: ${e.response?.data?.error || e.message}`);
        }
    }
};

export default spotifyDownload;