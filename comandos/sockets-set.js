import { config } from '../config.js';
import fs from 'fs-extra';
import path from 'path';

const setMenu = {
    name: 'set',
    alias: ['configbot', 'settingsbot', 'ajustesbot'],
    category: 'sockets',
    desc: 'Muestra el menú de personalización para dueños de Sockets.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix) => {
        try {
            const from = m.chat;
            const user = m.sender.split('@')[0].split(':')[0];
            const botNumber = conn.user.id.split(':')[0].replace(/\D/g, '');

            const subSessionsPath = path.resolve('./sesiones_subbots');
            const moodSessionsPath = path.resolve('./sesiones_moods');
            
            const isSubBot = await fs.pathExists(path.join(subSessionsPath, botNumber));
            const isMoodBot = await fs.pathExists(path.join(moodSessionsPath, botNumber));

            if (!isSubBot && !isMoodBot) {
                return await conn.sendMessage(from, { 
                    text: `*${config.visuals.emoji2} \`Comando exclusivo\` ${config.visuals.emoji2}*\n\n» Este comando no está disponible en el socket principal.\n\n> ¡Intenta usarlo desde la session del socket!` 
                }, { quoted: m });
            }

            if (botNumber !== user) {
                return await conn.sendMessage(from, { 
                    text: `*${config.visuals.emoji2}* Solo puedes configurar este bot interactuando directamente con tu propio socket.` 
                }, { quoted: m });
            }

            const prefix = usedPrefix || '#';
            const textoSettings = `*${config.visuals.emoji3}* \`CONFIGURACIÓN DE SOCKET\` *${config.visuals.emoji3}*

Hola, aquí puedes personalizar la apariencia de tu socket en el sistema.

*1. Nombre del Bot*
> Permite cambiar el nombre corto y largo.
> *Uso:* ${prefix}setname Corto/Nombre Largo Completo
> *Ejemplo:* ${prefix}setname Kazuma/Kazuma Bot Pro

*2. Banner del Bot*
> Cambia la imagen que aparece en tu menú.
> *Uso:* Responde a una imagen con ${prefix}setbanner

*3. Estado del Sistema*
> Verifica cómo se ve tu nombre actual.
> *Uso:* ${prefix}status

*Nota:* Si no configuras nada, se usarán los valores por defecto del sistema central.

> *${config.visuals.emoji2}* \`KAZUMA SOCKET SYSTEM\``.trim();

            await conn.sendMessage(from, { text: textoSettings }, { quoted: m });
        } catch (e) {
            console.error(e);
        }
    }
};

export default setMenu;