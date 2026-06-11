import axios from 'axios'

const tiktokSearch = {
    name: 'ttsearch',
    alias: ['tiktoksearch', 'tiktoks'],
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
                `https://api.delirius.store/search/tiktoksearch?query=${encodeURIComponent(query)}`
            )

            if (!data?.meta?.length) {
                await conn.sendMessage(m.chat, {
                    react: {
                        text: '❌',
                        key: m.key
                    }
                })

                return m.reply('❌ No se encontraron resultados.')
            }

            const cards = data.meta.slice(0, 8).map(res => ({
                image: {
                    url: res.author?.avatar || 'https://files.catbox.moe/7w1f7n.jpg'
                },

                title: res.title || 'TikTok Video',

                body:
                    `👤 Autor: ${res.author?.nickname || 'Desconocido'}\n` +
                    `⏱️ Duración: ${res.duration || 0}s\n` +
                    `❤️ Likes: ${(res.like || 0).toLocaleString()}`,

                footer: 'SaitamaBot-Sckt-MD',

                buttons: [
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '🎥 Video',
                            id: `.tt ${res.url}`
                        })
                    },
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: '🌐 TikTok',
                            url: res.url
                        })
                    }
                ]
            }))

            // ✅ Resultados encontrados
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

export default tiktokSearch;