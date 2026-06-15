 import axios from 'axios'
import { config } from '../config.js'

const spotifyDownload = {
    name: 'spotify',
    alias: ['spotifydownload', 'spdl'],
    category: 'descargas',
    desc: 'Descarga música de Spotify',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        const match = text?.match(
            /https?:\/\/(?:open\.)?spotify\.com\/(?:intl-[a-z]{2}\/)?track\/[A-Za-z0-9]+/i
        )

        if (!match) {
            return m.reply(
                `*${config.visuals.emoji2}* Ingresa un enlace válido de Spotify.`
            )
        }

        const spotifyUrl = match[0]

        try {
            await conn.sendMessage(m.chat, {
                react: {
                    text: '⏳',
                    key: m.key
                }
            })

            console.log('[SPOTIFY] URL:', spotifyUrl)

            const apiUrl =
                `https://api.delirius.store/download/spotifydl?url=${encodeURIComponent(spotifyUrl)}`

            const { data } = await axios.get(apiUrl, {
                timeout: 180000,
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            })

            console.log('[SPOTIFY] Respuesta API:')
            console.log(JSON.stringify(data, null, 2))

            if (!data?.status) {
                throw new Error(
                    data?.message ||
                    'La API devolvió estado falso.'
                )
            }

            const song = data.data

            if (!song?.download) {
                throw new Error(
                    'No se encontró enlace de descarga.'
                )
            }

            const formatDuration = (ms) => {
                const total = Math.floor(ms / 1000)
                const minutes = Math.floor(total / 60)
                const seconds = total % 60

                return `${minutes}:${seconds
                    .toString()
                    .padStart(2, '0')}`
            }

            const caption =
`🎵 *Título:* ${song.title || 'Desconocido'}
👤 *Autor:* ${song.author || 'Desconocido'}
⏱️ *Duración:* ${formatDuration(song.duration || 0)}

_Enviando audio..._`

            if (song.image) {
                await conn.sendMessage(
                    m.chat,
                    {
                        image: {
                            url: song.image
                        },
                        caption
                    },
                    {
                        quoted: m
                    }
                )
            }

            await conn.sendMessage(
                m.chat,
                {
                    audio: {
                        url: song.download
                    },
                    mimetype: 'audio/mpeg',
                    fileName: `${song.title || 'spotify'}.mp3`,
                    ptt: false
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

        } catch (err) {
            console.error('[SPOTIFY ERROR]')
            console.error(err)

            await conn.sendMessage(m.chat, {
                react: {
                    text: '❌',
                    key: m.key
                }
            })

            m.reply(
                `*${config.visuals.emoji2}* Error al descargar la canción.\n\n${err.message}`
            )
        }
    }
}

export default spotifyDownload;        
