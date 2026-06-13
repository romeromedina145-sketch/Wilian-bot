import axios from 'axios'
import { config } from '../config.js'

const instagramDownload = {
    name: 'instagram',
    alias: ['ig', 'igdl'],
    category: 'descargas',
    desc: 'Descarga videos o fotos de Instagram.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {

        const urlMatch = text?.match(/https?:\/\/[^\s]+/gi)
        const link = urlMatch ? urlMatch[0] : null

        if (!link) {
            return m.reply(
                `*${config.visuals.emoji2}* Ingresa un enlace de Instagram.`
            )
        }

        if (!link.includes('instagram.com')) {
            return m.reply(
                `*${config.visuals.emoji2}* El enlace no es de Instagram.`
            )
        }

        await conn.sendMessage(m.chat, {
            react: { text: '⌛', key: m.key }
        })

        try {

            // 🔥 NUEVA API DELIRIUS V2
            const { data: res } = await axios.get(
                `https://api.delirius.store/download/instagramv2?url=${encodeURIComponent(link)}`
            )

            if (!res?.status || !res?.data?.download?.length) {
                await conn.sendMessage(m.chat, {
                    react: { text: '❌', key: m.key }
                })
                return m.reply('No se pudo obtener contenido.')
            }

            const mediaList = res.data.download

            // 🎯 enviar todos los medios
            for (let item of mediaList) {

                if (item.type === 'image') {
                    await conn.sendMessage(m.chat, {
                        image: { url: item.url },
                        caption: `*${config.visuals.emoji3} Instagram Downloader*`
                    }, { quoted: m })
                }

                if (item.type === 'video') {
                    await conn.sendMessage(m.chat, {
                        video: { url: item.url },
                        caption: `*${config.visuals.emoji3} Instagram Downloader*`
                    }, { quoted: m })
                }
            }

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

export default instagramDownload;