import { config } from '../config.js'
import axios from 'axios'

const youtubeAudio = {
name: 'play',
alias: ['audio', 'yta', 'ytmp3'],
category: 'descargas',
desc: 'Busca, muestra info y descarga audio de YouTube.',
noPrefix: true,

run: async (conn, m, args, usedPrefix, commandName, text) => {

    if (!text) {
        return m.reply(
            `*${config.visuals.emoji2}* Por favor, ingresa el nombre de una canción o un enlace.`
        )
    }

    await conn.sendMessage(m.chat, {
        react: {
            text: '🔍',
            key: m.key
        }
    })

    try {
        let videoUrl = ''

        const isUrl =
            /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(text)

        if (isUrl) {

            videoUrl = text

            await m.reply(
                `*${config.visuals.emoji3}* ✿ Enlace detectado. Enviando audio, espera un momento...`
            )

        } else {

            const { data: searchRes } = await axios.get(
                `https://api.delirius.store/search/ytsearch?q=${encodeURIComponent(text)}`
            )

            if (
                !searchRes?.status ||
                !searchRes?.data ||
                !searchRes.data.length
            ) {
                await conn.sendMessage(m.chat, {
                    react: {
                        text: '❌',
                        key: m.key
                    }
                })

                return m.reply('No se encontraron resultados.')
            }

            const firstResult = searchRes.data[0]

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
                    `*${config.visuals.emoji2}* El audio es demasiado largo. El límite permitido es de 45 minutos.`
                )
            }

            const infoText =

`*${config.visuals.emoji3} YouTube Audio ${config.visuals.emoji3}*

*= Título* »
> ${firstResult.title}
*= Canal* »
> ${firstResult.author?.name || 'Desconocido'}
*= Publicado* »
> ${firstResult.publishedAt || 'Desconocido'}
*= Duración* »
> ${firstResult.duration || 'Desconocida'}
*= Vistas* »
> ${(firstResult.views || 0).toLocaleString()}
*= Enlace* »
> ${videoUrl}»

Enviando audio, espera un momento...`

            await conn.sendMessage(
                m.chat,
                {
                    image: {
                        url: firstResult.image
                    },
                    caption: infoText
                },
                {
                    quoted: m
                }
            )
        }

        const { data: audioRes } = await axios.get(
            `https://api.delirius.store/download/ytmp3?url=${encodeURIComponent(videoUrl)}`
        )

        if (!audioRes?.status || !audioRes?.data) {
            await conn.sendMessage(m.chat, {
                react: {
                    text: '❌',
                    key: m.key
                }
            })

            return m.reply('Error al obtener el audio del servidor.')
        }

        const audioData = audioRes.data

        await conn.sendMessage(
            m.chat,
            {
                audio: {
                    url: audioData.download
                },
                mimetype: 'audio/mpeg',
                ptt: false,
                fileName: `${audioData.title || 'audio'}.mp3`
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

export default youtubeAudio;