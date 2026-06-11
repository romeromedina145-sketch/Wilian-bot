import fs from 'fs-extra';
import path from 'path';
import { masterAuth } from '../config/database/security/authorization/master/core.js';
import { config } from '../config.js';

export default {
    name: 'token',
    alias: ['generartoken', 'newtoken'],
    category: 'owner',
    desc: 'Genera un token de acceso temporal para vincular nuevos SubMoods.',
    isOwner: true,
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const realOwnerNumber = (typeof config.owner[0] === 'string' ? config.owner[0] : config.owner[0][0]).replace(/\D/g, '');
            const senderNumber = m.sender.split('@')[0].replace(/\D/g, '');
            const isRealOwner = senderNumber === realOwnerNumber;

            if (!isRealOwner) {
                return m.reply(`*${config.visuals.emoji2}* \`ACCESO DENEGADO\` *${config.visuals.emoji2}*\n\nSolo el administrador principal tiene autoridad sobre este comando.`);
            }

            const token = Math.floor(1000 + Math.random() * 9000).toString();
            const tokensPath = path.resolve('./jsons/tokens');
            const tokenFile = path.join(tokensPath, `${token}.json`);

            await fs.ensureDir(tokensPath);

            const tokenData = {
                token: token,
                createdAt: Date.now(),
                expiresAt: Date.now() + (masterAuth.tokenExpiry * 60000),
                status: 'unused'
            };

            await fs.writeJson(tokenFile, tokenData);

            let msg = `*${config.visuals.emoji3} \`TOKEN GENERADO\` ${config.visuals.emoji3}*\n\n`;
            msg += `*✿ Token:* \`${token}\`\n`;
            msg += `*✿ Validez:* ${masterAuth.tokenExpiry} minutos\n\n`;
            msg += `> Usa este código para vincular un nuevo SubMood. Una vez usado, el token se auto-eliminará.`;

            await m.reply(msg);

            setTimeout(async () => {
                if (await fs.pathExists(tokenFile)) {
                    await fs.remove(tokenFile);
                }
            }, masterAuth.tokenExpiry * 60000);

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al generar el token.`);
        }
    }
};
