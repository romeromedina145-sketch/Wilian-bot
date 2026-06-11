import { config } from '../config.js';
import { getRPGRole } from './rpg-roles.js';

export const checkRankUpdate = async (conn, m, userJid, groupJid) => {
    try {
        const cleanUserJid = userJid.replace(/:.*@/g, '@');
        const groupData = global.db.data.chats[groupJid];
        
        if (!groupData || !groupData.rpg || !groupData.rpg[cleanUserJid]) return false;

        const userData = groupData.rpg[cleanUserJid];
        const newRoleData = getRPGRole(userData.minerals || {});
        const oldRole = userData.rank || 'Novato de las Cuevas';

        if (newRoleData.name !== oldRole) {
            userData.rank = newRoleData.name;

            const groupMetadata = await conn.groupMetadata(groupJid);
            const groupName = groupMetadata.subject;

            const aviso = `*${config.visuals.emoji3} \`¡NUEVO RANGO!\` ${config.visuals.emoji3}*

¡Hola! Paso por aquí para avisarte que has alcanzado un nuevo rango en el grupo *${groupName}*.

*Rango Actual:* ${newRoleData.emoji} ${newRoleData.name}
*Rango Anterior:* ${oldRole}

> Sigue recolectando recursos para seguir subiendo de nivel.`;

            await conn.sendMessage(cleanUserJid, { text: aviso });
            return true;
        }
        return false;
    } catch (e) {
        console.error('Error en checkRankUpdate:', e);
        return false;
    }
};