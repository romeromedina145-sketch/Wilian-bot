import { config } from '../config.js';

const countryCodes = {
    '34': { pais: 'España', ciudad: 'Madrid', region: 'Comunidad de Madrid' },
    '52': { pais: 'México', ciudad: 'Ciudad de México', region: 'CDMX' },
    '54': { pais: 'Argentina', ciudad: 'Buenos Aires', region: 'CABA' },
    '55': { pais: 'Brasil', ciudad: 'São Paulo', region: 'São Paulo' },
    '56': { pais: 'Chile', ciudad: 'Santiago', region: 'Región Metropolitana' },
    '57': { pais: 'Colombia', ciudad: 'Bogotá', region: 'Bogotá D.C.' },
    '51': { pais: 'Perú', ciudad: 'Lima', region: 'Lima Metropolitana' },
    '58': { pais: 'Venezuela', ciudad: 'Caracas', region: 'Distrito Capital' },
    '1': { pais: 'Estados Unidos / Canadá', ciudad: 'Miami', region: 'Florida' },
    '1809': { pais: 'República Dominicana', ciudad: 'Santo Domingo', region: 'Distrito Nacional' },
    '1829': { pais: 'República Dominicana', ciudad: 'Santo Domingo', region: 'San Cristóbal' },
    '1849': { pais: 'República Dominicana', ciudad: 'Santo Domingo', region: 'Santiago' }
};

const operators = ['Claro', 'Movistar', 'Vodafone', 'Orange', 'Telcel', 'Personal', 'Tigo', 'Entel','Viva'];
const names = ['Carlos', 'Sofía', 'Felipe', 'Alejandro', 'Mateo', 'Valentina', 'Diego', 'Camila', 'Sebastián', 'Mariana'];
const lastNames = ['García', 'Rodríguez', 'López', 'Martínez', 'Pérez', 'Gómez', 'Sánchez', 'Fernández', 'Díaz', 'Alvarez'];

const doxeoCommand = {
    name: 'doxear',
    alias: ['doxeo', 'doxing'],
    category: 'tools',
    desc: 'Genera un doxeo ficticio y divertido de un usuario.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            let targetJid = '';
            
            if (m.mentionedJid && m.mentionedJid.length > 0) {
                targetJid = m.mentionedJid[0];
            } else if (m.message && m.message.extendedTextMessage && m.message.extendedTextMessage.contextInfo && m.message.extendedTextMessage.contextInfo.participant) {
                targetJid = m.message.extendedTextMessage.contextInfo.participant;
            }

            if (!targetJid) {
                return await conn.sendMessage(m.chat, { 
                    text: `*${config.visuals.emoji2}* Debes etiquetar a alguien o responder a su mensaje para usar este comando.` 
                }, { quoted: m });
            }
            const cleanNumber = targetJid.split('@')[0];

            const loadingMsg = await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji2}* \`Iniciando protocolo de extracción en @${cleanNumber}...\``,
                mentions: [targetJid]
            }, { quoted: m });

            let detectedCountry = { pais: 'Desconocido', ciudad: 'Desconocida', region: 'Desconocida' };
            
            for (const prefix in countryCodes) {
                if (cleanNumber.startsWith(prefix)) {
                    detectedCountry = countryCodes[prefix];
                    break;
                }
            }

            const randomName = `${names[Math.floor(Math.random() * names.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
            const randomIp = `${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`;
            const randomDni = Math.floor(10000000 + Math.random() * 90000000);
            const randomAge = Math.floor(Math.random() * (45 - 14 + 1)) + 14; 
            const randomOperator = operators[Math.floor(Math.random() * operators.length)];
            
            const cleanNameForEmail = randomName.toLowerCase().replace(/\s+/g, '');
            const randomEmail = `${cleanNameForEmail}${Math.floor(Math.random() * 99)}@gmail.com`;
            const randomMac = Array.from({length: 6}, () => Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join(':').toUpperCase();

            await new Promise(resolve => setTimeout(resolve, 1500));

            const doxeoTemplate = `*${config.visuals.emoji3} ¡USUARIO DOXEARDO EXITOSAMENTE! ${config.visuals.emoji3}*

*📡 DATOS GENERALES:*
• *Nombre:* ${randomName}
• *Edad:* ${randomAge} años
• *DNI/Cédula:* ${randomDni}
• *Número:* +${cleanNumber}

*🌍 LOCALIZACIÓN REAL:*
• *País:* ${detectedCountry.pais}
• *Región:* ${detectedCountry.region}
• *Ciudad:* ${detectedCountry.ciudad}
• *Coordenadas:* ${ (Math.random() * (90 - (-90)) + (-90)).toFixed(6) }, ${ (Math.random() * (180 - (-180)) + (-180)).toFixed(6) }

*⚙️ DETALLES DE RED:*
• *Dirección IP:* ${randomIp}
• *ISP/Operador:* ${randomOperator}
• *DNS:* 8.8.8.8 / 1.1.1.1

---

*🔐 INFORMACIÓN EXTRAPOLADA (ESQUINA INFERIOR):*
• *Correo:* ${randomEmail}
• *Dirección MAC:* ${randomMac}
• *Contraseña sugerida:* \`password${Math.floor(Math.random() * 999)}\`
• *Nivel de peligro:* Peligrosamente vulnerable ☠️

> *Nota:* ${config.botName} no almacena ni realiza daños reales. Todo el contenido generado es 100% ficticio y con fines de entretenimiento.`;

            await conn.sendMessage(m.chat, { 
                text: doxeoTemplate,
                edit: loadingMsg.key,
                mentions: [targetJid]
            });

        } catch (err) {
            console.error(err);
        }
    }
};

export default doxeoCommand;
