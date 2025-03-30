const fs = require('fs');

// Datei zur Speicherung der Whitelist
const whitelistFile = './whitelist.json';

// Initialisiere die Whitelist aus der Datei oder erstelle eine neue
let whitelist = fs.existsSync(whitelistFile) ? JSON.parse(fs.readFileSync(whitelistFile)) : {};

// Speichere die Whitelist in einer Datei
const saveWhitelist = () => fs.writeFileSync(whitelistFile, JSON.stringify(whitelist, null, 2));

// Funktion zum Verarbeiten des Befehls
const handler = async (m, { conn, args, usedPrefix, isOwner }) => {
    const chatId = m.chat;
    const sender = m.sender.replace(/\D/g, ''); // Nummer des Senders ohne Sonderzeichen

    if (!isOwner) {
        return conn.reply(chatId, '❌ Nur der Gruppenbesitzer kann die Whitelist verwalten!', m);
    }

    if (!args[0]) {
        return conn.reply(chatId, `⚠️ *Benutzung:*
${usedPrefix}whitelist add <nummer> / kick:<zahl> / demote:<zahl> / promote:<zahl>
${usedPrefix}whitelist remove <nummer>
${usedPrefix}whitelist list`, m);
    }

    const action = args[0].toLowerCase();
    const number = args[1] ? args[1].replace(/\D/g, '') : null;

    switch (action) {
        case 'add':
            if (!number || args.length < 3) {
                return conn.reply(chatId, '⚠️ Bitte gib eine gültige Nummer und Limits an!', m);
            }

            // Parsen der Begrenzungen
            const limits = { kick: 0, demote: 0, promote: 0 };
            args.slice(2).forEach(arg => {
                const [key, value] = arg.split(':');
                if (limits.hasOwnProperty(key) && !isNaN(value)) {
                    limits[key] = parseInt(value);
                }
            });

            whitelist[number] = { ...limits, actions: { kick: 0, demote: 0, promote: 0 } };
            saveWhitelist();
            conn.reply(chatId, `✅ Nummer *+${number}* wurde zur Whitelist hinzugefügt mit folgenden Limits:\nKick: ${limits.kick}\nDemote: ${limits.demote}\nPromote: ${limits.promote}`, m);
            break;

        case 'remove':
            if (!number || !whitelist[number]) {
                return conn.reply(chatId, '⚠️ Diese Nummer ist nicht in der Whitelist!', m);
            }
            delete whitelist[number];
            saveWhitelist();
            conn.reply(chatId, `✅ Nummer *+${number}* wurde aus der Whitelist entfernt!`, m);
            break;

        case 'list':
            if (Object.keys(whitelist).length === 0) {
                conn.reply(chatId, '🚫 Keine Admins in der Whitelist.', m);
            } else {
                const formattedList = Object.entries(whitelist)
                    .map(([num, limits]) => `• +${num} | Kick: ${limits.kick} | Demote: ${limits.demote} | Promote: ${limits.promote}`)
                    .join('\n');
                conn.reply(chatId, `📜 *Whitelist:*\n${formattedList}`, m);
            }
            break;

        default:
            conn.reply(chatId, `⚠️ Unbekannte Aktion! Verwende: add, remove oder list.`, m);
            break;
    }
};

// **Automatische Überprüfung, ob ein Admin seine Limits überschreitet**
const checkLimits = async (m, action, conn) => {
    const sender = m.sender.replace(/\D/g, '');
    
    if (whitelist[sender]) {
        whitelist[sender].actions[action] = (whitelist[sender].actions[action] || 0) + 1;

        if (whitelist[sender].actions[action] > whitelist[sender][action]) {
            // Admin überschreitet Limit → Entziehe Adminrechte
            await conn.groupParticipantsUpdate(m.chat, [sender], 'demote');
            await conn.reply(m.chat, `🚨 Admin *+${sender}* hat das Limit für *${action}* überschritten! Adminrechte entzogen.`, m);
            
            // Owner benachrichtigen
            const groupMetadata = await conn.groupMetadata(m.chat);
            const owner = groupMetadata.owner;
            await conn.sendMessage(owner, { text: `⚠️ Admin *+${sender}* hat das Limit überschritten und wurde degradiert.` });

            // Setze die Zähler zurück
            whitelist[sender].actions[action] = 0;
        }

        saveWhitelist();
    }
};

// **Integration in Kick, Promote und Demote Befehle**
const kickHandler = async (m, { conn }) => await checkLimits(m, 'kick', conn);
const demoteHandler = async (m, { conn }) => await checkLimits(m, 'demote', conn);
const promoteHandler = async (m, { conn }) => await checkLimits(m, 'promote', conn);

// **Export der Handler**
handler.help = ['whitelist add <nummer> / kick:<zahl> / demote:<zahl> / promote:<zahl>', 'whitelist remove <nummer>', 'whitelist list'];
handler.tags = ['group'];
handler.command = /^(whitelist)$/i;
handler.admin = true;
handler.group = true;

export default handler;
export { kickHandler, demoteHandler, promoteHandler };

(async () => {
global.conns = [];

const mainBotAuthFile = 'QuantumSession';
try {
const mainBot = await connectionUpdate(mainBotAuthFile);
global.conns.push(mainBot);
console.log(chalk.bold.greenBright(`🤍 Shadow Bot MD conectado correctamente.`))

await connectSubBots();
} catch (error) {
console.error(chalk.bold.cyanBright(`🔴 Error al iniciar Sistema: `, error))
}
})();