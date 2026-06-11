import { config } from '../config.js';
import fs from 'fs-extra';
import path from 'path';

const setCurrency = {
    name: 'setcurrency',
    alias: ['setcoin', 'moneda', 'setmoney'],
    category: 'sockets',
    desc: 'Configura el símbolo y nombre de la moneda para tu socket.',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const from = m.chat;
            const user = m.sender.split('@')[0].split(':')[0];
            const botNumber = conn.user.id.split(':')[0].replace(/\D/g, '');

            const subSessionsPath = path.resolve('./sesiones_subbots');
            const moodSessionsPath = path.resolve('./sesiones_moods');

            const isSubBot = await fs.pathExists(path.join(subSessionsPath, botNumber));
            const isMoodBot = await fs.pathExists(path.join(moodSessionsPath, botNumber));

            if (!isSubBot && !isMoodBot) {
                return await conn.sendMessage(from, { 
                    text: `*${config.visuals.emoji2} \`Comando exclusivo\` ${config.visuals.emoji2}*\n\n» Este comando no está disponible en el socket principal.` 
                }, { quoted: m });
            }

            if (botNumber !== user) {
                return await conn.sendMessage(from, { 
                    text: `*${config.visuals.emoji2}* Solo el dueño de esta sesión puede personalizar la moneda.` 
                }, { quoted: m });
            }

            const fullText = args.join(' ');
            if (!fullText || !fullText.includes('/')) {
                return m.reply(`*${config.visuals.emoji2}* Uso: #setcurrency Símbolo/Nombre\nEjemplo: #setcurrency $/Dólares`);
            }

            let [symbol, ...namePart] = fullText.split('/');
            const currencySymbol = symbol.trim();
            const currencyName = namePart.join('/').trim();

            if (currencySymbol.length > 3) {
                return m.reply(`*${config.visuals.emoji2}* El símbolo es demasiado largo (máximo 3 caracteres).`);
            }

            let userSettingsPath = isSubBot 
                ? path.join(subSessionsPath, botNumber, 'settings.json')
                : path.join(moodSessionsPath, botNumber, 'settings.json');

            let localConfig = (await fs.pathExists(userSettingsPath)) ? await fs.readJson(userSettingsPath) : {};
            
            localConfig.currency = {
                symbol: currencySymbol,
                name: currencyName
            };
            localConfig.lastUpdate = Date.now();

            await fs.writeJson(userSettingsPath, localConfig, { spaces: 2 });

            await m.reply(`*${config.visuals.emoji3} \`ECONOMÍA SOCKET\` ${config.visuals.emoji3}*\n\n*Símbolo:* ${currencySymbol}\n*Nombre:* ${currencyName}\n\n> Divisa actualizada correctamente.`);
        } catch (e) {
            await m.reply(`*${config.visuals.emoji2}* Error al guardar la configuración de moneda.`);
        }
    }
};

export default setCurrency;