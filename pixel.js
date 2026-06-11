import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

const databasePath = path.join(process.cwd(), 'jsons', 'preferencias.json');
const prefixPath = path.join(process.cwd(), 'jsons', 'prefix.json');
const tmpDir = path.join(process.cwd(), 'tmp');

if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const groupCache = new Map();

export const pixelHandler = async (conn, m, config) => {
    try {
        if (!m || !m.message) return;

        const chat = m.key.remoteJid;
        if (chat === 'status@broadcast') return;

        const myJid = conn.user.id.split('@')[0].split(':')[0].replace(/\D/g, '');

        const subSessionsPath = path.resolve('./sesiones_subbots');
        const moodSessionsPath = path.resolve('./sesiones_moods');
        let sessionFolder = '';

        const subPathJid = path.join(subSessionsPath, myJid);
        const moodPathJid = path.join(moodSessionsPath, myJid);

        if (await fs.pathExists(subPathJid)) sessionFolder = subPathJid;
        else if (await fs.pathExists(moodPathJid)) sessionFolder = moodPathJid;

        if (sessionFolder) {
            const selfFilePath = path.join(sessionFolder, 'self_status.json');
            if (await fs.pathExists(selfFilePath)) {
                const selfData = await fs.readJson(selfFilePath).catch(() => ({}));
                if (selfData.selfMode && !m.key.fromMe) return;
            }
        }

        const sender = m.sender;
        const isGroup = chat.endsWith('@g.us');

        // ====== ROLES ======
        let isAdmin = false;
        let isBotAdmin = false;

        if (isGroup) {
            let groupMetadata = groupCache.get(chat);

            if (!groupMetadata || (Date.now() - groupMetadata.time > 10000)) {
                groupMetadata = await conn.groupMetadata(chat).catch(() => ({}));
                groupMetadata.time = Date.now();
                groupCache.set(chat, groupMetadata);
            }

            const participants = groupMetadata.participants || [];

            const userParticipant = participants.find(p => p.id === sender) || {};
            isAdmin = userParticipant.admin === 'admin' || userParticipant.admin === 'superadmin';

            const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            const botParticipant = participants.find(p => p.id === botJid) || {};
            isBotAdmin = botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin';
        }

        // ====== OWNER ======
        const ownerNumbers = config.owner.map(id => (typeof id === 'string' ? id : id[0]).replace(/\D/g, ''));
        const senderNumber = sender.split('@')[0].replace(/\D/g, '');

        const isRealOwner = senderNumber === ownerNumbers[0];
        const isListedOwner = ownerNumbers.includes(senderNumber) || m.key.fromMe;

        // =========================================================
        // 🔥 AQUÍ ESTÁ LA PARTE ARREGLADA (BOTONES + TEXTO)
        // =========================================================

        const type = Object.keys(m.message)[0];

        let body = '';

        // ✅ BOTONES CLÁSICOS
        if (type === 'buttonsResponseMessage') {
            body = m.message.buttonsResponseMessage?.selectedButtonId || '';
        }

        // ✅ MENÚ INTERACTIVO (WHATSAPP NUEVO)
        else if (type === 'interactiveResponseMessage') {
            try {
                const params = m.message.interactiveResponseMessage
                    ?.nativeFlowResponseMessage?.paramsJson;

                body = params ? JSON.parse(params)?.id || '' : '';
            } catch {
                body = '';
            }
        }

        // ✅ TEXTO NORMAL
        else if (type === 'conversation') body = m.message.conversation;

        else if (type === 'extendedTextMessage') {
            body = m.message.extendedTextMessage.text;
        }

        else if (m.message[type]?.caption) {
            body = m.message[type].caption;
        }

        if (!body && !m.quoted) return;

        // ====== PREFIJOS ======
        let activePrefixes = config.allPrefixes || ['#', '!', '.'];

        if (await fs.pathExists(prefixPath)) {
            const prefixData = await fs.readJson(prefixPath).catch(() => ({}));
            if (prefixData.selected) activePrefixes = [prefixData.selected];
        }

        const foundPrefix = activePrefixes.find(p => body.startsWith(p));
        const usedPrefix = foundPrefix || '';

        let commandName = foundPrefix
            ? body.slice(foundPrefix.length).trim().split(/ +/)[0].toLowerCase()
            : body.trim().split(/ +/)[0].toLowerCase();

        const args = body.trim().split(/ +/).slice(1);
        let text = args.join(' ');

        const cmd = global.commands.get(commandName) ||
            Array.from(global.commands.values())
                .find(c => c.alias && c.alias.includes(commandName));

        if (!cmd) return;
        if (foundPrefix && !cmd.noPrefix) return;

        // ====== PERMISOS ======
        if (cmd.isAdmin && isGroup && !isAdmin && !isRealOwner)
            return m.reply('🔒 Solo administradores.');

        if (cmd.isBotAdmin && isGroup && !isBotAdmin)
            return m.reply('🤖 Necesito ser admin.');

        if (cmd.isOwner && !isListedOwner)
            return m.reply('🚫 Solo owner.');

        if (cmd.isGroup && !isGroup)
            return m.reply('👥 Solo grupos.');

        // ====== CONTEXTO MENCIONES ======
        if (m.message[type]?.contextInfo) {
            m.mentionedJid = m.message[type].contextInfo.mentionedJid || [];
        } else {
            m.mentionedJid = [];
        }

        // ====== EJECUTAR COMANDO ======
        await cmd.run(conn, m, args, usedPrefix, commandName, text);

    } catch (err) {
        console.error(chalk.red('[ERROR PIXEL]'), err);
    }
};
