import { config } from '../config.js'
import axios from 'axios'

const spotifyDownload = {
    name: 'spotify',
    alias: ['sp', 'spotifydl', 'spdls'],
    category: 'descargas',
    desc: 'Descarga música de Spotify.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {

        const urlMatch = text?.match(/https?:\/\/[^\s]+/gi)
        const link = urlMatch ? urlMatch[0] : null

        if (!link) {
            return m.reply(
                `*${config.visuals.emoji2}* Proporciona un enlace de Spotify.`
            )
        }

        const spotifyRegex =
            /^https?:\/\/(open\.)?spotify\.com\/(track|album|playlist)\//i

        if (!spotifyRegex.test(link)) {
            return m.reply(
                `*${config.visuals.emoji2}* El enlace no parece ser de Spotify.`
            )
        }

        await conn.sendMessage(m.chat, {
            react: {
                text: '⌛',
                key: m.key
            }
        })

        try {

            const { data: res } = await axios.get(
                `https://${config.kzmUrl}/api/download/spotify?url=${encodeURIComponent(link)}&apiKey=${config.apiKzm}`
            )

            if (!res?.status || !res?.result) {

                await conn.sendMessage(m.chat, {
                    react: {
                        text: '❌',
                        key: m.key
                    }
                })

                return m.reply(
                    'No se pudo obtener información de Spotify.'
                )
            }

            const data = res.result

            const caption =
`🎵 *SPOTIFY DOWNLOADER*

📀 Título:
${data.title || 'Desconocido'}

🎤 Artista:
${data.artist || 'Desconocido'}

🔗 Enlace:
${link}

⏳ Enviando audio...`

            await conn.sendMessage(
                m.chat,
                {
                    image: {
                        url: data.thumbnail
                    },
                    caption
                },
                {
                    quoted: m
                }
            )

            await conn.sendMessage(
                m.chat,
                {
                    audio: {
                        url: data.download_url
                    },
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    fileName: `${data.title || 'spotify'}.mp3`
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

            console.error('SPOTIFY ERROR:', e)

            await conn.sendMessage(m.chat, {
                react: {
                    text: '✖️',
                    key: m.key
                }
            })

            m.reply(
                `❌ Error: ${
                    e?.response?.data?.error ||
                    e?.response?.data?.message ||
                    e.message
                }`
            )
        }
    }
}

export default spotifyDownload;
