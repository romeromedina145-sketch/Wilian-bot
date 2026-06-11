import axios from 'axios'
import { config } from '../config.js'

const pinterestSearch = {
    name: 'pinterest',
    alias: ['pin', 'pinter'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        const query = text || args.join(' ')

        if (!query) {
            return m.reply(
                `*${config.visuals.emoji2}* Ingresa un texto para buscar.\n\n` +
                `Ejemplo: ${usedPrefix + commandName} Yotsuba Nakano`
            )
        }

        try {
            await conn.sendMessage(m.chat, {
                react: {
                    text: '🔍',
                    key: m.key
                }
            })

            const { data } = await axios.get(
                `https://${config.kzmUrl}/api/search/pinterest?query=${encodeURIComponent(query)}&apiKey=${config.apiKzm}`
            )

            if (!data?.status || !data?.data?.length) {
                await conn.sendMessage(m.chat, {
                    react: {
                        text: '❌',
                        key: m.key
                    }
                })

                return m.reply('No se encontraron resultados.')
            }

            const cards = data.data.slice(0, 7).map((item, index) => ({
                image: {
                    url: item.image_url
                },

                title: `📌 Resultado ${index + 1}`,

                body:
                    `🔎 Búsqueda: ${query}\n` +
                    `🖼️ Pinterest Image`,

                footer: 'SaitamaBot-Sckt-MD'
            }))

            await conn.sendMessage(
                m.chat,
                {
                    text: `📌 Resultados para: ${query}`,
                    footer: 'Pinterest Search',
                    cards
                },
                {
                    quoted: m
                }
            )

            await conn.sendMessage(m.chat, {
                react: {
                    text: '✅',
                    key: m.key
                }
            })

        } catch (e) {
            console.log(e)

            await conn.sendMessage(m.chat, {
                react: {
                    text: '✖️',
                    key: m.key
                }
            })

            m.reply('Error al procesar la búsqueda.')
        }
    }
}

export default pinterestSearch;