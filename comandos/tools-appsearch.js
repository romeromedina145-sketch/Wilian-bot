import axios from 'axios'

const appStoreSearch = {
    name: 'appstore',
    alias: ['apksearch', 'apks'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {

        const query = text || args.join(' ')

        if (!query) {
            return m.reply(
                `📱 Ingresa el nombre de una aplicación.\n\n` +
                `Ejemplo: ${usedPrefix + commandName} WhatsApp`
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
                `https://api.delirius.store/search/appstore?q=${encodeURIComponent(query)}`
            )

            if (!Array.isArray(data) || !data.length) {

                await conn.sendMessage(m.chat, {
                    react: {
                        text: '❌',
                        key: m.key
                    }
                })

                return m.reply('❌ No se encontraron aplicaciones.')
            }

            // Guardar resultados para apkdl
            global.apkSearch = global.apkSearch || {}
            global.apkSearch[m.sender] = data.slice(0, 8)

            const cards = data.slice(0, 8).map((app, index) => ({

                image: {
                    url: app.image
                },

                title: app.title || 'Aplicación',

                body:
                    `⭐ Puntuación: ${app.score || 'N/A'}\n` +
                    `📝 Reviews: ${app.reviews || '0'}\n` +
                    `📦 Tamaño: ${app.size || 'Desconocido'}\n` +
                    `🔖 Versión: ${app.version || 'Desconocida'}\n` +
                    `📅 Actualizado: ${app.updated || 'Desconocido'}\n` +
                    `🎭 Género: ${app.genre?.join(', ') || 'Desconocido'}`,

                footer: 'SaitamaBot-Sckt-MD',

                buttons: [
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📲 App Store',
                            url: app.url
                        })
                    },
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📦 Descargar APK',
                            id: `.apkdl ${index}`
                        })
                    }
                ]
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
                    text: `📱 Resultados para: ${query}`,
                    footer: 'App Store Search',
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

export default appStoreSearch;
