import fs from 'fs';
import path from 'path';

export const config = {
    botName: 'Saitama',
    currency: 'SaiCoins',
    symbol: '$',
    owner: [
        '51991579415@s.whatsapp.net', 
        '125860308893859@lid',
        '18495029889@s.whatsapp.net'
    ], 
    support: [
        '51991579415@s.whatsapp.net',
        '929485663@s.whatsapp.net'
    ],
    prefix: '#',
    allPrefixes: ['#', '!', '.', '/'],

    getBotType: (conn) => {
        const userNumber = conn.user.id.split(':')[0];
        const subBotPath = path.resolve(`./sesiones_subbots/${userNumber}`);
        const moodsPath = path.resolve(`./sesiones_moods/${userNumber}`);

        if (fs.existsSync(subBotPath)) return '*Sub-Bot*';
        if (fs.existsSync(moodsPath)) return '*Mood*';
        return '*Mood*';
    },

    visuals: {
        line: '━',
        color: 'magenta',
        emoji: '✰',
        emoji2: '❁',
        emoji3: '✿',
        emoji4: '❀',
        img1: 'https://files.catbox.moe/j2q1zj.png',
        video1: 'https://files.catbox.moe/lsqa96.mp4',
    },

    apiKzm: 'kzm-mLfTLDDU-jWxYzDHg',
    kzmUrl: 'rest.kazuma.uk'
};