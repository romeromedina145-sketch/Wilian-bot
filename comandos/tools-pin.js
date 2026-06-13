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
                `Ejemplo:\n${usedPrefix + commandName} Twice`
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
                `https://api.delirius.store/search/pinterest?text=${encodeURIComponent(query)}`
            )

            if (!data?.status || !data?.results?.length) {

                await conn.sendMessage(m.chat, {
                    react: {
                        text: '❌',
                        key: m.key
                    }
                })

                return m.reply('❌ No se encontraron resultados.')
            }

            const cards = data.results
                .slice(0, 8)
                .map((img, index) => ({
                    image: {
                        url: img
                    },

                    title: `📌 Pinterest ${index + 1}`,

                    body:
                        `🔎 Búsqueda: ${query}\n` +
                        `🖼️ Resultado ${index + 1} de Pinterest`,

                    footer: 'SaitamaBot-Sckt-MD'
                }))

            await conn.sendMessage(m.chat, {
                react: {
                    text: '✅',
                    key: m.key
                }
            })

            await conn.sendMessage(
                m.chat,
                {
                    text:
                        `📌 *Pinterest Search*\n\n` +
                        `🔎 Consulta: ${query}\n` +
                        `🖼️ Resultados encontrados: ${data.results.length}`,

                    footer: 'Pinterest Search',
                    cards
                },
                {
                    quoted: m
                }
            )

        } catch (e) {

            console.error(e)

            await conn.sendMessage(m.chat, {
                react: {
                    text: '✖️',
                    key: m.key
                }
            })

            m.reply(
                `❌ Error: ${e.response?.data?.message || e.message}`
            )
        }
    }
}

export default pinterestSearch;