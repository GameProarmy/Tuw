process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'
import './config.js' 
import { createRequire } from 'module'
import path, { join } from 'path'
import {fileURLToPath, pathToFileURL} from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import fs, { watchFile, unwatchFile, writeFileSync, readdirSync, statSync, unlinkSync, existsSync, readFileSync, copyFileSync, watch, rmSync, readdir, stat, mkdirSync, rename, writeFile } from 'fs'
import yargs from 'yargs'
import { spawn } from 'child_process'
import lodash from 'lodash'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import { tmpdir } from 'os'
import { format } from 'util'
import P from 'pino'
import pino from 'pino'
import Pino from 'pino'
import { Boom } from '@hapi/boom'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import {Low, JSONFile} from 'lowdb'
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js'
import store from './lib/store.js'
import readline from 'readline'
import NodeCache from 'node-cache'
import pkg from 'google-libphonenumber'
const { PhoneNumberUtil } = pkg
const phoneUtil = PhoneNumberUtil.getInstance()
const {DisconnectReason, useMultiFileAuthState, MessageRetryMap, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser, PHONENUMBER_MCC} = await import('@whiskeysockets/baileys')
const { CONNECTING } = ws
const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000
protoType()
serialize()
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
}; global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true));
}; global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};
global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({...query, ...(apikeyqueryname ? {[apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name]} : {})})) : '')
global.timestamp = { start: new Date }
const __dirname = global.__dirname(import.meta.url);
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[#/.]')
global.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : new JSONFile('media/database/database.json'))
global.DATABASE = global.db; 
global.loadDatabase = async function loadDatabase() {
if (global.db.READ) {
return new Promise((resolve) => setInterval(async function() {
if (!global.db.READ) {
clearInterval(this);
resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
}}, 1 * 1000));
}
if (global.db.data !== null) return;
global.db.READ = true;
await global.db.read().catch(console.error);
global.db.READ = null;
global.db.data = {
users: {},
chats: {},
stats: {},
msgs: {},
sticker: {},
settings: {},
...(global.db.data || {}),
};
global.db.chain = chain(global.db.data);
};
loadDatabase();

// Inicialización de conexiones globales
if (global.conns instanceof Array) {
console.log('Conexiones ya inicializadas...');
} else {
global.conns = [];
}

/* ------------------------------------------------*/

global.chatgpt = new Low(new JSONFile(path.join(__dirname, '/db/chatgpt.json')));
global.loadChatgptDB = async function loadChatgptDB() {
if (global.chatgpt.READ) {
return new Promise((resolve) =>
setInterval(async function() {
if (!global.chatgpt.READ) {
clearInterval(this);
resolve( global.chatgpt.data === null ? global.loadChatgptDB() : global.chatgpt.data );
}}, 1 * 1000));
}
if (global.chatgpt.data !== null) return;
global.chatgpt.READ = true;
await global.chatgpt.read().catch(console.error);
global.chatgpt.READ = null;
global.chatgpt.data = {
users: {},
...(global.chatgpt.data || {}),
};
global.chatgpt.chain = lodash.chain(global.chatgpt.data);
};
loadChatgptDB();

global.creds = 'creds.json'
global.authFile = 'QuantumSession'
global.authFileJB  = 'QuantumJadiBot'
/*global.rutaBot = join(__dirname, authFile)
global.rutaJadiBot = join(__dirname, authFileJB)

if (!fs.existsSync(rutaJadiBot)) {
fs.mkdirSync(rutaJadiBot)
}
*/
const {state, saveState, saveCreds} = await useMultiFileAuthState(global.authFile)
const msgRetryCounterMap = (MessageRetryMap) => { }
const msgRetryCounterCache = new NodeCache()
const {version} = await fetchLatestBaileysVersion()
let phoneNumber = global.botNumberCode
const methodCodeQR = process.argv.includes("qr")
const methodCode = !!phoneNumber || process.argv.includes("code")
const MethodMobile = process.argv.includes("mobile")
let rl = readline.createInterface({
input: process.stdin,
output: process.stdout,
terminal: true,
})

const question = (texto) => {
rl.clearLine(rl.input, 0)
return new Promise((resolver) => {
rl.question(texto, (respuesta) => {
rl.clearLine(rl.input, 0)
resolver(respuesta.trim())
})})
}

let opcion
if (methodCodeQR) {
opcion = '1'
}
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${authFile}/creds.json`)) {
do {
let lineM = '┄╴───┈┈┈┈──┈┈┈┈───┈╴'
opcion = await question(`
    ${chalk.bold.bgCyan("⚡⚡⚡ VERKNÜPFUNGSMETHODEN ⚡⚡⚡")}
    ===========================================
    💡 ${chalk.bold("Wählen Sie eine Methode zur Verknüpfung")}
    -------------------------------------------
    🔹 ${chalk.bold.green("1. QR-Code")}
    🔹 ${chalk.bold.green("2. 8-stelliger Code")}
    -------------------------------------------
    🔒 ${chalk.italic("Geben Sie nur die Nummer ein, um fortzufahren.")}
    -------------------------------------------
    ✴️ ${chalk.italic("Hinweis: Geben Sie keine Buchstaben oder Sonderzeichen ein.")}
    ===========================================
    ${chalk.italic.red("Quantum Bot - MD")}
    ${chalk.bold.magentaBright("→ Bitte treffen Sie Ihre Auswahl: ")}
    `)
if (!/^[1-2]$/.test(opcion)) {
console.log(chalk.bold.redBright(`Fehler ${chalk.bold.greenBright("1")} O ${chalk.bold.greenBright("2")}, Nur die Optionen 1 oder 2 sind erlaubt.\n${chalk.bold.yellowBright("Tipp: Kopieren Sie die Zahl der Option und fügen Sie sie ein.")}`))
}} while (opcion !== '1' && opcion !== '2' || fs.existsSync(`./${authFile}/creds.json`))
}

const filterStrings = [
"Q2xvc2luZyBzdGFsZSBvcGVu", // "Closing stable open"
"Q2xvc2luZyBvcGVuIHNlc3Npb24=", // "Closing open session"
"RmFpbGVkIHRvIGRlY3J5cHQ=", // "Failed to decrypt"
"U2Vzc2lvbiBlcnJvcg==", // "Session error"
"RXJyb3I6IEJhZCBNQUM=", // "Error: Bad MAC" 
"RGVjcnlwdGVkIG1lc3NhZ2U=" // "Decrypted message" 
]
console.info = () => {} 
console.debug = () => {} 
['log', 'warn', 'error'].forEach(methodName => redefineConsoleMethod(methodName, filterStrings))
const connectionOptions = {
logger: pino({ level: 'silent' }),
printQRInTerminal: opcion == '1' ? true : methodCodeQR ? true : false,
mobile: MethodMobile, 
browser: opcion == '1' ? ['QuantumBot-MD', 'Edge', '20.0.04'] : methodCodeQR ? ['QuantumBot-MD', 'Edge', '20.0.04'] : ["Ubuntu", "Chrome", "20.0.04"],
auth: {
creds: state.creds,
keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
},
markOnlineOnConnect: true, 
generateHighQualityLinkPreview: true, 
syncFullHistory: false,
getMessage: async (clave) => {
let jid = jidNormalizedUser(clave.remoteJid)
let msg = await store.loadMessage(jid, clave.id)
return msg?.message || ""
},
msgRetryCounterCache, // Resolver mensajes en espera
msgRetryCounterMap, // Determinar si se debe volver a intentar enviar un mensaje o no
defaultQueryTimeoutMs: undefined,
version: [2, 3000, 1015901307],
}
global.conn = makeWASocket(connectionOptions)
if (!fs.existsSync(`./${authFile}/creds.json`)) {
if (opcion === '2' || methodCode) {
opcion = '2'
if (!conn.authState.creds.registered) {
let addNumber
if (!!phoneNumber) {
addNumber = phoneNumber.replace(/[^0-9]/g, '')
} else {
do {
phoneNumber = await question(chalk.bgBlack(chalk.bold.greenBright(`Por favor, Ingrese el número de WhatsApp.\n${chalk.bold.yellowBright("CONSEJO: Copie el número de WhatsApp y péguelo en la consola.")}\n${chalk.bold.yellowBright("Ejemplo: +51927238856")}\n${chalk.bold.magentaBright('---> ')}`)))
phoneNumber = phoneNumber.replace(/\D/g,'')
if (!phoneNumber.startsWith('+')) {
phoneNumber = `+${phoneNumber}`
}
} while (!await isValidPhoneNumber(phoneNumber))
rl.close()
addNumber = phoneNumber.replace(/\D/g, '')
setTimeout(async () => {
let codeBot = await conn.requestPairingCode(addNumber)
codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot
console.log(chalk.bold.white(chalk.bgMagenta('VERBINDUNGSCODE:')), chalk.bold.white(chalk.white(codeBot)))
}, 2000)
}}}
}

conn.isInit = false
conn.well = false

if (!opts['test']) {
if (global.db) setInterval(async () => {
if (global.db.data) await global.db.write()
if (opts['autocleartmp'] && (global.support || {}).find) (tmp = [os.tmpdir(), 'tmp', "QuantumJadiBot"], tmp.forEach(filename => cp.spawn('find', [filename, '-amin', '2', '-type', 'f', '-delete'])))}, 30 * 1000)}
if (opts['server']) (await import('./lib/server.js')).default(global.conn, PORT)
async function getMessage(key) {
if (store) {
} return {
conversation: 'SimpleBot',
}}
async function connectionUpdate(update) {  
const {connection, lastDisconnect, isNewLogin} = update
global.stopped = connection
if (isNewLogin) conn.isInit = true
const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
await global.reloadHandler(true).catch(console.error)

global.timestamp.connect = new Date
}
if (global.db.data == null) loadDatabase()
if (update.qr != 0 && update.qr != undefined || methodCodeQR) {
if (opcion == '1' || methodCodeQR) {
  console.log(chalk.bold.yellow(`\n💚 Scanne den QR-Code – Ablauf in 45 Sekunden!`))}
}
if (connection == 'open') {
console.log(chalk.bold.greenBright(`╔════════════════════════════════════════════════╗║                  ✔️ ERFOLGREICH VERBUNDEN ✔️                  ║║                                                        ║║ 🟢 Verbindung zu WhatsApp erfolgreich hergestellt. ║║                                                        ║╚════════════════════════════════════════════════╝`))}
let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
if (connection === 'close') {
if (reason === DisconnectReason.badSession) {
  console.log(chalk.bold.cyanBright(`⚠️ **Verbindung nicht gefunden!**Bitte lösche den Ordner ${global.authFile} und scanne den QR-Code erneut.`));
} else if (reason === DisconnectReason.connectionClosed) {
  console.log(chalk.bold.magentaBright(`╔════════════════════════════════════════════════╗║ ⚠️ Verbindung geschlossen! Wiederherstellung läuft... ║╚════════════════════════════════════════════════╝`));
await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.connectionLost) {
console.log(chalk.bold.blueBright(`\n╔════════════════════════════════════════════════╗║ ⏳ Verbindung zum Server verloren! Versuche neu zu verbinden... ║╚════════════════════════════════════════════════╝`))
await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.connectionReplaced) {
console.log(chalk.bold.yellowBright("╔════════════════════════════════════════════════╗║ ⚠️ Verbindung ersetzt! Schließe zuerst die aktuelle Sitzung. ║╚════════════════════════════════════════════════╝"))
} else if (reason === DisconnectReason.loggedOut) {
console.log(chalk.bold.redBright(`\n⚠️ **Keine Verbindung gefunden!**Bitte lösche den Ordner ${global.authFile} und scanne den QR-Code erneut.`))
await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.restartRequired) {
console.log(chalk.bold.cyanBright(`\n╔════════════════════════════════════════════════╗║ 🔄 Verbindung wird wiederhergestellt...               ║╚════════════════════════════════════════════════╝`))
await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.timedOut) {
console.log(chalk.bold.yellowBright(`\n╔════════════════════════════════════════════════╗║ ⏰ Zeitüberschreitung! Versuche erneut zu verbinden... ║╚════════════════════════════════════════════════╝`))
await global.reloadHandler(true).catch(console.error) //process.send('reset')
} else {
console.log(chalk.bold.redBright(`\n⚠️ Unbekannter Fehler bei der Verbindung: ${reason || 'Nicht gefunden'} >> ${connection || 'Nicht gefunden'}`))
}}
}
process.on('uncaughtException', console.error);

async function connectSubBots() {
const subBotDirectory = './QuantumBot';
if (!existsSync(subBotDirectory)) {
console.log('Bot hat keine Sub-Bots verbunden.');
return;
}

const subBotFolders = readdirSync(subBotDirectory).filter(file => 
statSync(join(subBotDirectory, file)).isDirectory()
);

const botPromises = subBotFolders.map(async folder => {
const authFile = join(subBotDirectory, folder);
if (existsSync(join(authFile, 'creds.json'))) {
return await connectionUpdate(authFile);
}
});

const bots = await Promise.all(botPromises);
global.conns = bots.filter(Boolean);
console.log(chalk.bold.greenBright(`Alle Sub-Bots wurden erfolgreich verbunden.`))
}

(async () => {
global.conns = [];

const mainBotAuthFile = 'QuantumSession';
try {
const mainBot = await connectionUpdate(mainBotAuthFile);
global.conns.push(mainBot);
console.log(chalk.bold.greenBright(`Quantum bot erfolgreich verbunden.`))

await connectSubBots();
} catch (error) {
console.error(chalk.bold.cyanBright(`Fehler beim Starten des Systems: `, error))
}
})();

let isInit = true;
let handler = await import('./handler.js');
global.reloadHandler = async function(restatConn) {
try {
const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
if (Object.keys(Handler || {}).length) handler = Handler;
} catch (e) {
console.error(e);
}
if (restatConn) {
const oldChats = global.conn.chats;
try {
global.conn.ws.close();
} catch { }
conn.ev.removeAllListeners();
global.conn = makeWASocket(connectionOptions, {chats: oldChats});
isInit = true;
}
if (!isInit) {
conn.ev.off('messages.upsert', conn.handler)
conn.ev.off('connection.update', conn.connectionUpdate)
conn.ev.off('creds.update', conn.credsUpdate)
}

conn.handler = handler.handler.bind(global.conn)
conn.connectionUpdate = connectionUpdate.bind(global.conn)
conn.credsUpdate = saveCreds.bind(global.conn, true)

const currentDateTime = new Date()
const messageDateTime = new Date(conn.ev)
if (currentDateTime >= messageDateTime) {
const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0])
} else {
const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0])}

conn.ev.on('messages.upsert', conn.handler)
conn.ev.on('connection.update', conn.connectionUpdate)
conn.ev.on('creds.update', conn.credsUpdate)
isInit = false
return true
}

const pluginFolder = global.__dirname(join(__dirname, './plugins/index'))
const pluginFilter = (filename) => /\.js$/.test(filename)
global.plugins = {}
async function filesInit() {
for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
try {
const file = global.__filename(join(pluginFolder, filename))
const module = await import(file)
global.plugins[filename] = module.default || module
} catch (e) {
conn.logger.error(e)
delete global.plugins[filename]
}}}
filesInit().then((_) => Object.keys(global.plugins)).catch(console.error)

global.reload = async (_ev, filename) => {
if (pluginFilter(filename)) {
const dir = global.__filename(join(pluginFolder, filename), true)
if (filename in global.plugins) {
if (existsSync(dir)) conn.logger.info(` ERFOLGREICH AKTUALISIERT - '${filename}`)
else {
conn.logger.warn(`EINE DATEI WURDE ENTFERNT: '${filename}'`)
return delete global.plugins[filename];
}
} else conn.logger.info(`NEUES PLUGIN ERKANNT: '${filename}'`)
const err = syntaxerror(readFileSync(dir), filename, {
sourceType: 'module',
allowAwaitOutsideFunction: true,
});
if (err) conn.logger.error(`EIN SYNTAXFEHLER WURDE ERKANNT | SYNTAXFEHLER BEIM LADEN VON '${filename}'\n${format(err)}`);
else {
try {
const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`));
global.plugins[filename] = module.default || module;
} catch (e) {
conn.logger.error(`EIN FEHLER IST AUFGETRETEN, DAS PLUGIN '${filename}' WIRD BENÖTIGT\n${format(e)}`);
} finally {
global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
}}}};
Object.freeze(global.reload);
watch(pluginFolder, global.reload);
await global.reloadHandler();
async function _quickTest() {
const test = await Promise.all([
spawn('ffmpeg'),
spawn('ffprobe'),
spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
spawn('convert'),
spawn('magick'),
spawn('gm'),
spawn('find', ['--version']),
].map((p) => {
return Promise.race([
new Promise((resolve) => {
p.on('close', (code) => {
resolve(code !== 127);
});
}),
new Promise((resolve) => {
p.on('error', (_) => resolve(false));
})]);
}));
const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
const s = global.support = {ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find};
Object.freeze(global.support);
}
function clearTmp() {
const tmpDir = join(__dirname, 'tmp')
const filenames = readdirSync(tmpDir)
filenames.forEach(file => {
const filePath = join(tmpDir, file)
unlinkSync(filePath)})
}
function purgeSession() {
let prekey = []
let directorio = readdirSync("./QuantumSession")
let filesFolderPreKeys = directorio.filter(file => {
return file.startsWith('pre-key-')
})
prekey = [...prekey, ...filesFolderPreKeys]
filesFolderPreKeys.forEach(files => {
unlinkSync(`./QuantumSession/${files}`)
})
} 
function purgeSessionSB() {
try {
const listaDirectorios = readdirSync(`./${authFileJB}/`);
let SBprekey = [];
listaDirectorios.forEach(directorio => {
if (statSync(`./${authFileJB}/${directorio}`).isDirectory()) {
const DSBPreKeys = readdirSync(`./${authFileJB}/${directorio}`).filter(fileInDir => {
return fileInDir.startsWith('pre-key-')
})
SBprekey = [...SBprekey, ...DSBPreKeys];
DSBPreKeys.forEach(fileInDir => {
if (fileInDir !== 'creds.json') {
unlinkSync(`./${authFileJB}/${directorio}/${fileInDir}`)
}})
}})
if (SBprekey.length === 0) {
console.log(chalk.bold.green(`\n【 QuantumBot 】\n━━━━━━━━━━━━━━━━━━━━━\n✅ Nichts zu löschen.\n━━━━━━━━━━━━━━━━━━━━━ 🗑️♻️`))
} else {
console.log(chalk.bold.cyanBright(`\n【 QuantumBot 】 \n━━━━━━━━━━━━━━━━━━━━━\n📂 Unnötige Dateien entfernt.\n━━━━━━━━━━━━━━━━━━━━━ 🗑️♻️`))
}} catch (err) {
console.log(chalk.bold.red(`\n【 QuantumBot 】\n━━━━━━━━━━━━━━━━━━━━━\n❌ Ein Fehler ist aufgetreten.\n━━━━━━━━━━━━━━━━━━━━━ 🗑️❌\n` + err))
}}
function purgeOldFiles() {
const directories = ['./QuantumSession/', '.QuantumBot/']
directories.forEach(dir => {
readdirSync(dir, (err, files) => {
if (err) throw err
files.forEach(file => {
if (file !== 'creds.json') {
const filePath = path.join(dir, file);
unlinkSync(filePath, err => {
if (err) {
console.log(chalk.bold.red(`\n【 DATEI 】\n━━━━━━━━━━━━━━━━━━━━━\n❌ ${file} konnte nicht gelöscht werden.\n━━━━━━━━━━━━━━━━━━━━━ 🗑️❌\n` + err))
} else {
console.log(chalk.bold.green(`\n【 DATEI 】\n━━━━━━━━━━━━━━━━━━━━━\n✅ ${file} erfolgreich gelöscht.\n━━━━━━━━━━━━━━━━━━━━━ 🗑️♻️`))
} }) }
}) }) }) }
function redefineConsoleMethod(methodName, filterStrings) {
const originalConsoleMethod = console[methodName]
console[methodName] = function() {
const message = arguments[0]
if (typeof message === 'string' && filterStrings.some(filterString => message.includes(atob(filterString)))) {
arguments[0] = ""
}
originalConsoleMethod.apply(console, arguments)
}}
setInterval(async () => {
if (stopped === 'close' || !conn || !conn.user) return
await clearTmp()
console.log(chalk.bold.cyanBright(`\n🟢 [MULTIMEDIA] 🟢\n━━━━━━━━━━━━━━━━━━━━━\n📂 TMP-ORDNER WURDE GELÖSCHT\n━━━━━━━━━━━━━━━━━━━━━ 🗑️♻️`))}, 1000 * 60 * 4) // 4 min 

setInterval(async () => {
if (stopped === 'close' || !conn || !conn.user) return
await purgeOldFiles()
console.log(chalk.bold.cyanBright(`\n🟠 [DATEIEN] 🟠\n━━━━━━━━━━━━━━━━━━━━━\n🗃️ ÜBERFLÜSSIGE DATEIEN ENTFERNT\n━━━━━━━━━━━━━━━━━━━━━ 🗑️♻️`))}, 1000 * 60 * 10)

_quickTest().then(() => conn.logger.info(chalk.bold(`FERTIG\n`.trim()))).catch(console.error)

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
unwatchFile(file)
console.log(chalk.bold.greenBright("Aktualisiert"))
import(`${file}?update=${Date.now()}`)
})

async function isValidPhoneNumber(number) {
try {
number = number.replace(/\s+/g, '')
// Falls die Nummer mit '+491' beginnt, wird die '1' entfernt.
if (number.startsWith('+491')) {
number = number.replace('+491', '+49'); // Ändern +49 15678
} else if (number.startsWith('+49') && number[4] === '1') {
number = number.replace('+49 1', '+49'); // Ändern +49 1 a +49
}
const parsedNumber = phoneUtil.parseAndKeepRawInput(number)
return phoneUtil.isValidNumber(parsedNumber)
} catch (error) {
return false
}}