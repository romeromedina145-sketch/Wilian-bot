import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const jsonDir = path.resolve('./jsons');
const databasePath = path.join(jsonDir, 'preferencias.json');
const sessionsPath = path.resolve('./sesiones_subbots');
const moodSessionsPath = path.resolve('./sesiones_moods');
const mainSessionPath = path.resolve('./sesion_bot');

const setPrimary = {
    name: 'setprimary',
    alias: ['setprimary', 'principal', 'solotu'],
    category: 'sockets',
    desc: 'Asigna un bot específico como el único que responderá en el grupo.',
    isOwner: false,
    noPrefix: true,
    isAdmin: true,
    isGroup: true,

    run: async (conn, m, args) => {
        const from = m.chat;

        let targetJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                        m.message?.extendedTextMessage?.contextInfo?.participant;

        if (!targetJid) return;

        const targetNumber = targetJid.split('@')[0].split(':')[0].replace(/\D/g, '');
        const myNumber = conn.user.id.split(':')[0].split(':')[0].replace(/\D/g, '');
        
        if (targetNumber !== myNumber) return;

        if (!fs.existsSync(jsonDir)) fs.mkdirSync(jsonDir, { recursive: true });

        let db = {};
        if (fs.existsSync(databasePath)) {
            try {
                db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
            } catch (e) { db = {}; }
        }

        if (db[from]) {
            return await conn.sendMessage(from, { 
                text: `*${config.visuals.emoji2}* \`ACCIÓN DENEGADA\`\n\nYa existe un bot primario asignado (\`${db[from]}\`) en este grupo.\n\n> ¡Usa delprimary para removerlo!` 
            }, { quoted: m });
        }

        const isSub = fs.existsSync(path.join(sessionsPath, targetNumber));
        const isMood = fs.existsSync(path.join(moodSessionsPath, targetNumber));
        const isMain = fs.existsSync(mainSessionPath);

        db[from] = targetNumber;
        fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));

        await conn.sendMessage(from, { 
            text: `*${config.visuals.emoji3}* \`CONFIGURACIÓN EXITOSA\`\n\nSe ha elegido al socket *${targetNumber}* como bot primario del grupo.\n\n> ¡A partir de ahora solo yo responderé aquí!` 
        }, { quoted: m });
    }
};

export default setPrimary;