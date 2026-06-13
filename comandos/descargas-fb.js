import axios from 'axios'
import { config } from '../config.js'

const fbDownload = {
    name: 'facebook',
    alias: ['fb', 'fbdl'],
    category: 'descargas',
    desc: 'Descarga videos de Facebook.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {

        const urlMatch = text?.match(/https?:\/\/[^\s]+/gi)
        const link = urlMatch ? urlMatch[0] : null

        if (!link) {
            return m.reply(
                `*${config.visuals.emoji2}* Ingresa un enlace de Facebook válido.`
            )
        }

        if (!link.includes('facebook.com') && !link.includes('fb.watch')) {
            return m.reply(
                `*${config.visuals.emoji2}* El enlace no es de Facebook.`
            )
        }

        await conn.sendMessage(m.chat, {
            react: { text: '⌛', key: m.key }
        })

        try {

            // 🔥 NUEVA API DELIRIUS
            const { data: res } = await axios.get(
                `https://api.delirius.store/download/facebook?url=${encodeURIComponent(link)}`
            )

            if (!res?.status || !res?.list?.length) {
                await conn.sendMessage(m.chat, {
                    react: { text: '❌', key: m.key }
                })
                return m.reply('No se pudo obtener el video.')
            }

            // 🎯 elegir mejor calidad
            const best = res.list.find(v => v.quality?.includes('720')) || res.list[0]
            const videoUrl = best?.url

            if (!videoUrl) {
                return m.reply('No hay enlace de descarga disponible.')
            }

            const caption =
`*${config.visuals.emoji3} Facebook Downloader*

📌 Calidad: ${best?.quality || 'Desconocida'}`

            // 🎥 enviar video
            await conn.sendMessage(
                m.chat,
                { video: { url: videoUrl }, caption },
                { quoted: m }
            )

            await conn.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            })

        } catch (e) {

            await conn.sendMessage(m.chat, {
                react: { text: '✖️', key: m.key }
            })

            m.reply(
                `*${config.visuals.emoji2}* Error: ${e.response?.data?.message || e.message}`
            )
        }
    }
}

export default fbDownload;