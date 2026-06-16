import { config } from '../config.js';
import { getDynamicConfig } from '../config/config.js';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { downloadContentFromMessage } from 'todleys';

const sCommand = {
    name: 's',
    alias: ['sticker', 'stiker'],
    category: 'stickers',
    desc: 'Convierte imágenes en stickers.',
    isGroup: false,
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const q = m.quoted ? m.quoted : m;
            const mime = (q.msg || q).mimetype || '';

            if (!/image/.test(mime)) {
                return m.reply(`*${config.visuals.emoji2}* Responde a una imagen con el comando *.s*`);
            }

            const stream = await downloadContentFromMessage(q.msg || q, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const dynamic = await getDynamicConfig(conn);
            let userName = m.pushName || 'User';
            let pack = dynamic.stickers.packname;
            let author = dynamic.stickers.packauthor.replace('@(userName)', userName);

            const sticker = new Sticker(buffer, {
                pack: pack,
                author: author,
                type: StickerTypes.FULL,
                categories: ['🤩', '✨'],
                quality: 60,
            });

            const stickerBuffer = await sticker.toBuffer();
            await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al convertir la imagen en sticker.`);
        }
    }
};

export default sCommand;
