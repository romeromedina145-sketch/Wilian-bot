import axios from 'axios'

const spotifySearch = {
    name: 'spsearch',
    alias: ['spotifysearch', 'spbuscar', 'spsrch'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        const query = text || args.join(' ')

        if (!query) {
            return m.reply('🎵 Ingresa el nombre de una canción.')
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
                `https://api.delirius.store/search/spotify?q=${encodeURIComponent(query)}`
            )

            const results = data?.data || []

            if (!results.length) {
                await conn.sendMessage(m.chat, {
                    react: {
                        text: '❌',
                        key: m.key
                    }
                })

                return m.reply('❌ No se encontraron resultados.')
            }

            const cards = results.slice(0, 5).map(res => ({
                image: {
                    url: res.image
                },

                title: res.title || 'Spotify',

                body:
                    `🎤 Artista: ${res.artist || 'Desconocido'}\n` +
                    `💿 Álbum: ${res.album || 'Desconocido'}\n` +
                    `⏱️ Duración: ${res.duration || 'Desconocida'}`,

                footer: 'SaitamaBot-Sckt-MD',

                buttons: [
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '🎵 Descargar',
                            id: `.spotify ${res.url}`
                        })
                    },
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: '🟢 Spotify',
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
                    text: `🎧 Resultados para: ${query}`,
                    footer: 'Selecciona una canción',
                    cards
                },
                {
                    quoted: m
                }
            )

        } catch (error) {
            console.log(error)

            // ❌ Error
            await conn.sendMessage(m.chat, {
                react: {
                    text: '❌',
                    key: m.key
                }
            })

            m.reply('❌ Error al obtener resultados de Spotify.')
        }
    }
}

export default spotifySearch;
