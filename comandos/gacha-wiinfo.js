import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { config } from '../config.js';
import { getAnimeImage } from 'wimages-lib';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const baseGroup = "120363423871589037@g.us";

const waifuImageCommand = {
    name: 'waifuinfo',
    alias: ['wiinfo', 'winfo'],
    category: 'gacha',
    desc: 'Busca imágenes e info de personajes en la lista interna o en la librería.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        try {
            const queryStr = text || args.join(' ');
            if (!queryStr) {
                return m.reply(`*${config.visuals.emoji2}* Ingrese el nombre o ID del personaje.\n\nEjemplo: ${usedPrefix}${commandName} Raphtalia o ${usedPrefix}${commandName} 50`);
            }

            await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

            let characterData = null;

            if (fs.existsSync(gachaPath)) {
                const rawData = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
                const plantillaPersonajes = rawData[baseGroup] || {};

                if (plantillaPersonajes[queryStr.trim()]) {
                    const id = queryStr.trim();
                    const pj = plantillaPersonajes[id];
                    characterData = {
                        id,
                        name: pj.name,
                        source: pj.source,
                        urlFija: pj.url,
                        isFromGacha: true
                    };
                } else {
                    const searchName = queryStr.toLowerCase().trim();
                    const foundId = Object.keys(plantillaPersonajes).find(id => 
                        plantillaPersonajes[id].name.toLowerCase().includes(searchName)
                    );

                    if (foundId) {
                        const pj = plantillaPersonajes[foundId];
                        characterData = {
                            id: foundId,
                            name: pj.name,
                            source: pj.source,
                            urlFija: pj.url,
                            isFromGacha: true
                        };
                    }
                }
            }

            if (!characterData) {
                const libCharacter = await getAnimeImage(queryStr);
                if (libCharacter && (!Array.isArray(libCharacter) || libCharacter.length > 0)) {
                    const data = Array.isArray(libCharacter) ? libCharacter[0] : libCharacter;
                    characterData = {
                        name: data.name,
                        source: data.source || data.anime || 'No especificado',
                        rarity: data.rarity || 'Común',
                        description: data.description || 'Sin descripción',
                        imageUrl: data.imageUrl || data.image || null,
                        isFromGacha: false
                    };
                }
            }

            if (!characterData) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return m.reply(`*${config.visuals.emoji2}* No encontré a "${queryStr}" ni en el gacha ni en la librería.`);
            }

            let txt = `*${config.visuals.emoji3} INFO - CHARACTER*\n\n`;
            let finalImageUrl = null;

            if (characterData.isFromGacha) {
                txt += `*Nombre:* ${characterData.name}\n`;
                txt += `*ID »* ${characterData.id}\n`;
                txt += `*Fuente:* ${characterData.source}\n\n`;
                txt += `> © Developed by Félix`;

                finalImageUrl = characterData.urlFija;
                if (!finalImageUrl) {
                    const searchUrl = `https://${config.kzmUrl}/api/search/pinterest?query=${encodeURIComponent(characterData.name + ' ' + characterData.source)}&apiKey=kzm-OifUrFOl-oSSLeonc`;
                    try {
                        const response = await axios.get(searchUrl);
                        if (response.data.status && response.data.data.length > 0) {
                            finalImageUrl = response.data.data[0].image_url;
                        }
                    } catch (e) {}
                }
            } else {
                txt += `*Nombre:* ${characterData.name || 'Desconocido'}\n`;
                txt += `*Anime:* ${characterData.source || 'No especificado'}\n`;
                txt += `*Rareza:* ${characterData.rarity || 'Común'}\n\n`;
                txt += `*Descripción:* ${characterData.description || 'Sin descripción'}\n\n`;
                txt += `> © Developed by Félix`;

                finalImageUrl = characterData.imageUrl;
            }

            if (!finalImageUrl) finalImageUrl = 'https://telegra.ph/file/0cf76964ff002f232491a.jpg';

            await conn.sendMessage(m.chat, { 
                image: { url: finalImageUrl }, 
                caption: txt 
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error('Error en waifuinfo:', e);
            await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
            m.reply(`*${config.visuals.emoji2}* Error al procesar la información del personaje.`);
        }
    }
};

export default waifuImageCommand;
