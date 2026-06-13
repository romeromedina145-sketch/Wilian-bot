import axios from 'axios'

const cache = new Map()
const queue = new Map()

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const tryCatch = async (fn) => {
    try {
        return await fn()
    } catch {
        return null
    }
}

const pickNoWatermark = (data) => {
    // 🧠 prioridad real sin watermark
    return data?.play || data?.hdplay || null
}

const pickAny = (data) => {
    return data?.play || data?.hdplay || data?.wmplay || null
}

const tiktokdl = {
    name: 'tiktokdl',
    alias: ['ttdl', 'tiktok', 'tt', 'godtt'],
    category: 'descargas',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {

        const url = (text || args.join(' '))?.trim()

        if (!url || !url.includes('tiktok')) {
            return m.reply('🎵 Envía un link válido de TikTok')
        }

        const user = m.sender

        if (queue.has(user)) {
            return m.reply('⏳ Ya estás descargando otro video...')
        }

        queue.set(user, true)

        try {

            await conn.sendMessage(m.chat, {
                react: { text: '🔥', key: m.key }
            })

            // 🧠 CACHE
            if (cache.has(url)) {
                const c = cache.get(url)

                await conn.sendMessage(m.chat, {
                    video: { url: c.video },
                    caption: `🔥 ${c.title}\n✨ CACHE`
                }, { quoted: m })

                if (c.audio) {
                    await conn.sendMessage(m.chat, {
                        audio: { url: c.audio },
                        mimetype: 'audio/mp4'
                    }, { quoted: m })
                }

                return
            }

            let video = null
            let audio = null
            let title = 'TikTok'

            // =========================
            // 🥇 1. TIKWM (BASE REAL)
            // =========================
            const tikwm = await tryCatch(async () => {
                const res = await axios.get(
                    `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`
                )
                return res?.data?.data
            })

            if (tikwm) {
                video = pickNoWatermark(tikwm) // 🔥 SOLO SIN MARCA
                audio = tikwm?.music
                title = tikwm?.title || title
            }

            // =========================
            // 🥈 2. FALLBACK CUALQUIERA
            // =========================
            if (!video) {
                video = pickAny(tikwm)
            }

            // =========================
            // ❌ FALLA TOTAL
            // =========================
            if (!video) {
                return m.reply('❌ No se pudo obtener video sin marca')
            }

            // 💾 CACHE
            cache.set(url, { video, audio, title })

            // 🎥 VIDEO
            await conn.sendMessage(m.chat, {
                video: { url: video },
                caption:
`> 🔥 *MODO DIOS ACTIVADO*

🎵 ${title}
> ✨ Sin marca (si disponible)`
            }, { quoted: m })

            await sleep(1200)

            // 🎧 AUDIO
            if (audio) {
                await conn.sendMessage(m.chat, {
                    audio: { url: audio },
                    mimetype: 'audio/mp4'
                }, { quoted: m })
            }

            await conn.sendMessage(m.chat, {
                react: { text: '⚡', key: m.key }
            })

        } catch (e) {

            console.log(e)

            await conn.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            })

            m.reply(`❌ Error Modo Dios:\n${e.message}`)

        } finally {
            queue.delete(user)
        }
    }
}

export default tiktokdl;