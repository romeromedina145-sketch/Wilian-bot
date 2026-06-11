import { config } from '../config.js';
import { database } from '../database.js';
import fs from 'fs-extra';
import path from 'path';

const menuCommand = {
    name: 'menu',
    alias: ['help', 'ayuda', 'menú', 'hel'],
    category: 'main',
    desc: 'Muestra la lista de comandos dinámica.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix) => {
        try {
            const prefix = usedPrefix || '#'; 
            const userJid = m.sender.replace(/:.*@/g, '@');
            const userShortId = userJid.split('@')[0];
            const group = m.chat;

            const commandsSource = conn.commands || global.commands;
            if (!commandsSource) return m.reply('Error: No se pudo acceder a la lista de comandos.');

            const allCommands = Array.from(commandsSource.values());

            const categories = [...new Set(allCommands
                .map(cmd => cmd.category)
                .filter(cat => cat && cat !== 'todos' && cat !== 'main')
            )];

            const botNumber = conn.user.id.split(':')[0].replace(/\D/g, '');
            const subSessionsPath = path.resolve('./sesiones_subbots');
            const moodSessionsPath = path.resolve('./sesiones_moods');
            let settingsPath = '';
            let currentBotType = 'Mood';

            if (await fs.pathExists(path.join(subSessionsPath, botNumber))) {
                settingsPath = path.join(subSessionsPath, botNumber, 'settings.json');
                currentBotType = 'SubBot';
            } else if (await fs.pathExists(path.join(moodSessionsPath, botNumber))) {
                settingsPath = path.join(moodSessionsPath, botNumber, 'settings.json');
                currentBotType = 'Mood';
            }

            let displayLongName = config.botName;
            let displayBanner = config.visuals.img1;

            if (settingsPath && await fs.pathExists(settingsPath)) {
                const localData = await fs.readJson(settingsPath);
                if (localData.longName) displayLongName = localData.longName;
                if (localData.banner) displayBanner = localData.banner;
            }

            const userGlobal = global.db.data.users[userJid] || {};
            const wallet = (userGlobal.wallet || 0) + (userGlobal.bank || 0);
            
            const groupData = global.db.data.chats[group] || {};
            const userRpg = groupData.rpg?.[userJid] || {};
            
            const rank = userRpg.rank || 'Novato de las Cuevas';
            const diamantes = userRpg.minerals?.diamantes || 0;

            const infoBot = `┏━━━━✿︎ 𝐈𝐍𝐅𝐎-𝐁𝐎𝐓 ✿︎━━━━╮
┃ ✐ *Owner* »
┃ 51991579415
┃ ✐ *Commands* »
┃ .play .play2 .tt .fb .etc
┃ ✐ *Upload* »
┃ impostagem
┃ ✐ *Official channel* »
┃   No Hay 
╰━━━━━━━━━━━━━━━━━━━╯\n`;

            const infoUser = `┏━━━━✿︎ 𝐈𝐍𝐅𝐎-𝐔𝐒𝐄𝐑 ✿︎━━━━╮
┃ ✐ *Usuario* »  @${userShortId}
┃ ✐ *Rango* » ${rank}
┃ ✐ *Coins* » ¥${wallet.toLocaleString()}
┃ ✐ *Diamantes* » ${diamantes}
╰━━━━━━━━━━━━━━━━━━━╯`;

            const formatCategory = (cat) => {
                const cmdsInCat = allCommands.filter(cmd => cmd.category === cat);
                let catText = `*» (❍ᴥ❍ʋ) \`${cat.toUpperCase()}\` «*\n> ꕥ Comandos de la categoría ${cat}.\n\n`;

                const body = cmdsInCat.map(cmd => {
                    const allAliases = [cmd.name, ...(cmd.alias || [])];
                    const namesString = allAliases.map(n => `*#${n}*`).join(' • ');
                    return `✿︎ ${namesString}\n> ❀ ${cmd.desc || 'Sin descripción.'}`;
                }).join('\n');

                return catText + body + '\n';
            };

            const input = args[0]?.toLowerCase();
            let finalBody = "";
            let subHeader = "";

            if (!input) {
                subHeader = `*☞︎︎︎ Aquí está mi lista de comandos ☜︎︎︎*\n\n`;
                finalBody = categories.map(cat => formatCategory(cat)).join('\n');
            } else if (categories.includes(input)) {
                subHeader = `*☞︎︎︎ Comandos: \`${input.toUpperCase()}\` ☜︎︎︎*\n\n`;
                finalBody = formatCategory(input);
            } else {
                let catList = categories.map(cat => `› ${cat}`).join('\n');
                let errorMsg = `*${config.visuals.emoji2} \`Categoría no encontrada\` ${config.visuals.emoji2}*\n\n» La categoría *${input}*, no fue encontrada.\n\n${config.visuals.emoji3} *Categorías existentes* »\n${catList}\n\n> ¡Si necesitas el menú completo, simplemente escribe *${prefix}help!*`;
                return m.reply(errorMsg);
            }

            let header = `¡Hola! Soy ${displayLongName} *(${currentBotType})*.\n\n`;
            let textoMenu = `${header}${subHeader}${infoBot}\n${infoUser}\n\n${finalBody}`;

            await conn.sendMessage(
    m.chat,
    {
        video: { url: config.visuals.video1 },
        caption: textoMenu,
        mimetype: 'video/mp4',
        mentions: [userJid]
    },
    { quoted: m }
);

        } catch (err) {
            console.error('Error en el menú:', err);
        }
    }
};

export default menuCommand;
