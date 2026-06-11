import { config } from '../config.js';
import axios from 'axios';

const qrcodeCommand = {
    name: 'qrcode',
    alias: ['qr', 'codigoqr'],
    category: 'tools',
    desc: 'Convierte un texto en un código QR usando la API de Kazuma.',
    isGroup: false,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        try {
            if (!text) {
                return m.reply(`*${config.visuals.emoji2}* Por favor, ingresa el texto que deseas convertir a QR.\n\nEjemplo:\n*${usedPrefix}${commandName}* https://github.com/Dev-FelixOfc`);
            }

            const apiUrl = `https://${config.kzmUrl}/api/tools/qr?text=${encodeURIComponent(text)}&apiKey=kzm-OifUrFOl-oSSLeonc`;

            await conn.sendMessage(m.chat, { 
                image: { url: apiUrl }, 
                caption: `*${config.visuals.emoji3}* \`QR GENERADO\` *${config.visuals.emoji3}*\n\n*Texto:* ${text}\n\n> Generado correctamente por la API de Kazuma.` 
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al generar el código QR.`);
        }
    }
};

export default qrcodeCommand;