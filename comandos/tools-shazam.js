import axios from 'axios'
import { 
    makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    DisconnectReason,
    Browsers,
    downloadMediaMessage
} from 'todleys';

const shazam = {
    name: 'shazam',
    alias: ['song', 'music', 'identify'],
    category: 'herramientas',
    noPrefix: true,

    run: async (conn, m) => {

        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage

        const media =
            quoted?.audioMessage ||
            quoted?.videoMessage

        if (!media) {
            return m.reply('🎧 Responde a un video o audio con .shazam')
        }

        await conn.sendMessage(m.chat, {
            react: { text: '🔎', key: m.key }
        })

        try {

            // 💣 FIX REAL TODLEYS
            const type = media.audioMessage ? 'audio' : 'video'

            const stream = await downloadContentFromMessage(media, type)

            let buffer = Buffer.from([])
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }

            // =========================
            // 🥇 ACRCLOUD
            // =========================
            const form = new FormData()

            form.append('file', buffer, {
                filename: 'audio.mp3'
            })

            form.append('access_key', 'TU_ACR_KEY')
            form.append('access_secret', 'TU_ACR_SECRET')
            form.append('data_type', 'audio')
            form.append('signature_version', '1')

            let music = null

            try {
                const res = await axios.post(
                    'https://identify-eu-west-1.acrcloud.com/v1/identify',
                    form,
                    { headers: form.getHeaders(), timeout: 15000 }
                )

                music = res.data?.metadata?.music?.[0]

            } catch (e) {
                music = null
            }

            // =========================
            // 🥈 FALLBACK
            // =========================
            if (!music) {
                try {
                    const audd = await axios.post('https://api.audd.io/', {
                        api_token: 'TU_AUDD_TOKEN',
                        return: 'spotify,apple_music'
                    }, { timeout: 15000 })

                    music = audd.data?.result

                } catch (e) {
                    music = null
                }
            }

            if (!music) {
                return m.reply('❌ No se pudo identificar la canción')
            }

            const title = music.title || music.name
            const artist = music.artists?.[0]?.name || music.artist
            const album = music.album?.name || music.album

            await conn.sendMessage(m.chat, {
                image: { url: music.album?.cover || '' },
                caption:
`🎵 *SHAZAM TODLEYS ULTRA PRO*

🎶 Canción: ${title}
👤 Artista: ${artist}
💿 Álbum: ${album}

⚡ Sistema estable Todleys`
            }, { quoted: m })

            await conn.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            })

        } catch (e) {

            console.log(e)

            await conn.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            })

            m.reply('❌ Error en Shazam Todleys')
        }
    }
}

export default shazam;