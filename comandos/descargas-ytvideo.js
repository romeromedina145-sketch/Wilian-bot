import { config } from '../config.js'
import axios from 'axios'

const youtubeVideo = {
    name: 'play2',
    alias: ['ytv', 'playvid'],
    category: 'descargas',
    desc: 'Busca, muestra info y descarga el video de YouTube.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        if (!text) {
            return m.reply(
                `*${config.visuals.emoji2}* Por favor, ingresa el nombre del video o el enlace.`
            )
        }

        await conn.sendMessage(m.chat, {
            react: {
                text: '🔍',
                key: m.key
            }
        })

        try {
            let videoUrl

            const isUrl =
                /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(text)

            if (isUrl) {
                videoUrl = text

                await m.reply(
                    `*${config.visuals.emoji3}* Enlace detectado. Enviando video, espera un momento...`
                )
            } else {
                const { data: searchRes } = await axios.get(
                    `https://${config.kzmUrl}/api/search/youtube?apiKey=${config.apiKzm}&q=${encodeURIComponent(text)}`
                )

                if (
                    !searchRes.status ||
                    !searchRes.result ||
                    searchRes.result.length === 0
                ) {
                    await conn.sendMessage(m.chat, {
                        react: {
                            text: '❌',
                            key: m.key
                        }
                    })

                    return m.reply('No se encontraron resultados.')
                }

                const firstResult = searchRes.result[0]

                videoUrl = firstResult.url

                const durationStr = firstResult.duration || '0:00'
                const parts = durationStr.split(':').map(Number)

                let totalMinutes = 0

                if (parts.length === 3) {
                    totalMinutes = (parts[0] * 60) + parts[1]
                } else if (parts.length === 2) {
                    totalMinutes = parts[0]
                }

                if (totalMinutes >= 45) {
                    await conn.sendMessage(m.chat, {
                        react: {
                            text: '⚠️',
                            key: m.key
                        }
                    })

                    return m.reply(
                        `*${config.visuals.emoji2}* El video es demasiado largo. El límite permitido es de 45 minutos.`
                    )
                }

                const infoText =
                    `*${config.visuals.emoji3} YouTube Video ${config.visuals.emoji3}*\n\n` +
                    `*= Título* »\n> ${firstResult.title}\n` +
                    `*= Canal* »\n> ${firstResult.channel}\n` +
                    `*= Publicado* »\n> ${firstResult.publishedAt}\n` +
                    `*= Duración* »\n> ${firstResult.duration}\n` +
                    `*= Vistas* »\n> ${firstResult.views}\n` +
                    `*= Enlace* »\n> ${videoUrl}\n\n` +
                    `_Enviando video, espera un momento..._`

                await conn.sendMessage(
                    m.chat,
                    {
                        image: {
                            url: firstResult.thumbnail
                        },
                        caption: infoText
                    },
                    {
                        quoted: m
                    }
                )
            }

            // DESCARGA CON DELIRIUS
            const { data: videoRes } = await axios.get(
                `https://api.delirius.store/download/ytmp4?url=${encodeURIComponent(videoUrl)}&format=360p`
            )

            if (!videoRes?.status || !videoRes?.data) {
                await conn.sendMessage(m.chat, {
                    react: {
                        text: '❌',
                        key: m.key
                    }
                })

                return m.reply('Error al obtener el video del servidor.')
            }

            const videoData = videoRes.data

            await conn.sendMessage(
                m.chat,
                {
                    video: {
                        url: videoData.download
                    },
                    mimetype: 'video/mp4',
                    caption:
                        `🎬 *${videoData.title}*\n` +
                        `📺 Autor: ${videoData.author}\n` +
                        `👁️ Vistas: ${videoData.views}\n` +
                        `🎞️ Calidad: ${videoData.format}`
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
            console.error(e)

            await conn.sendMessage(m.chat, {
                react: {
                    text: '✖️',
                    key: m.key
                }
            })

            m.reply(
                `*${config.visuals.emoji2}* Error: ${e.response?.data?.error || e.message}`
            )
        }
    }
}

export default youtubeVideo;