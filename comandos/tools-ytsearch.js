import axios from 'axios'

const youtubeSearch = {
    name: 'ytsearch',
    alias: ['yts', 'searchy'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        const query = text || args.join(' ')

        if (!query) {
            return m.reply('🔎 Ingresa un texto para buscar.')
        }

        try {
            // 🔍 Buscando
            await conn.sendMessage(m.chat, {
                react: {
                    text: '🔍',
                    key: m.key
                }
            })

            const { data } = await axios.get(
                `https://api.delirius.store/search/ytsearch?q=${encodeURIComponent(query)}`
            )

            if (!data?.status || !data?.data?.length) {
                await conn.sendMessage(m.chat, {
                    react: {
                        text: '❌',
                        key: m.key
                    }
                })

                return m.reply('❌ No se encontraron resultados.')
            }

            const cards = data.data.slice(0, 8).map(res => ({
                image: {
                    url: res.image
                },

                title: res.title || 'YouTube',

                body:
                    `📺 Canal: ${res.author?.name || 'Desconocido'}\n` +
                    `⏱️ Duración: ${res.duration || 'Desconocida'}\n` +
                    `👁️ Vistas: ${res.views || '0'}`,

                footer: 'SaitamaBot-Sckt-MD',

                buttons: [
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '🎵 Audio',
                            id: `.yta ${res.url}`
                        })
                    },
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '🎥 Video',
                            id: `.ytv ${res.url}`
                        })
                    },
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: '🌐 YouTube',
                            url: res.url
                        })
                    }
                ]
            }))

            // ✅ Encontrado
            await conn.sendMessage(m.chat, {
                react: {
                    text: '✅',
                    key: m.key
                }
            })

            await conn.sendMessage(
                m.chat,
                {
                    text: `🔎 Resultados para: ${query}`,
                    footer: 'Selecciona una opción',
                    cards
                },
                {
                    quoted: m
                }
            )

        } catch (e) {
            console.log(e)

            // ❌ Error
            await conn.sendMessage(m.chat, {
                react: {
                    text: '❌',
                    key: m.key
                }
            })

            m.reply('❌ Error al procesar la búsqueda.')
        }
    }
}

export default youtubeSearch;