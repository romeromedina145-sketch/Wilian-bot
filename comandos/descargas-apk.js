import axios from 'axios'

const apkDownload = {
    name: 'apkdl',
    alias: ['apkdescargar', 'modapk', 'apk'],
    category: 'descargas',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {

        let query = text || args.join(' ')

const cache = global.apkSearch?.[m.sender]

if (
    cache &&
    !isNaN(query) &&
    cache[Number(query)]
) {
    query = cache[Number(query)].title
}
        if (!query) {
            return m.reply(
                `📦 Ingresa el nombre de una aplicación.\n\n` +
                `📌 Ejemplo:\n${usedPrefix + commandName} WhatsApp`
            )
        }

        try {

            // 🔄 reacción de carga
            await conn.sendMessage(m.chat, {
                react: { text: '📦', key: m.key }
            })

            // 🌐 petición API
            const res = await axios.get(
                `https://api.delirius.store/download/apk?query=${encodeURIComponent(query)}`
            )

            const json = res?.data

            if (!json) {
                return m.reply('❌ La API no respondió correctamente.')
            }

            // 🔑 estructura real de la API
            const apk = json.data

            if (!apk) {
                return m.reply('❌ No se encontró ninguna aplicación.')
            }

            console.log('BUSCADO:', query)
console.log('APK:', apk.name)
console.log('PACKAGE:', apk.id)

            // 📦 normalización de datos
            const name = apk.name || 'APK desconocida'
            const id = apk.id || 'N/A'
            const size = apk.size || 'N/A'
            const image = apk.image || null
            const download = apk.download || null
            const developer = apk.developer || 'Desconocido'

            const downloads =
                apk.stats?.downloads ??
                apk.estadísticas?.descargas ??
                0

            const rating =
                apk.stats?.rating?.average ??
                apk.estadísticas?.rating?.promedio ??
                'N/A'

            const store =
                apk.store?.name ??
                apk.almacenar?.nombre ??
                'Desconocido'

            // ❗ validación crítica
            if (!download) {
                return m.reply('❌ No se encontró link de descarga.')
            }

            // 🧾 mensaje bonito
            const caption =
`📦 *APK ENCONTRADA*

📱 Nombre: ${name}
🆔 Package: ${id}
👨‍💻 Developer: ${developer}
📏 Tamaño: ${size}
⭐ Rating: ${rating}
⬇️ Descargas: ${downloads}
🏪 Store: ${store}

📥 Enviando APK...`

            // 🖼️ enviar con o sin imagen
            if (image) {
                await conn.sendMessage(m.chat, {
                    image: { url: image },
                    caption
                }, { quoted: m })
            } else {
                await m.reply(caption)
            }

            // 📥 envío APK
            await conn.sendMessage(m.chat, {
                document: { url: download },
                mimetype: 'application/vnd.android.package-archive',
                fileName: `${name}.apk`
            }, { quoted: m })

            // ✅ reacción final
            await conn.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            })

        } catch (e) {

            console.log('APKDL ERROR:', e)

            await conn.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            })

            m.reply(
                `❌ Error al obtener APK:\n${e?.response?.data?.message || e.message}`
            )
        }
    }
}

export default apkDownload;
