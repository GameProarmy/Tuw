import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone' 

global.owner = [
   ['4915210396723', 'Trustblack', true],
   ['4915679330444', 'the hhunter', true],
]

global.mods = ['']

global.prems = ['']

global.packname = 'Quantum Bot'
global.botname = 'Quantum Bot'
global.wm = 'Quantum Bot'
global.author = 'Trustblack'
global.dev = 'Trustblack'
global.errorm = 'Error: ${error.message}'
global.errorm2 = 'Error v:'
global.resp = 'Ihre anfrage.'
global.espera = 'Bitte warten'
global.nombrebot = 'Quantum Bot'
global.textbot = `Quantum Bot`
global.vs = '1.0.0'

global.imagen1 = fs.readFileSync('./media/Menus/menu1.jpg')
global.imagen2 = fs.readFileSync('./media/Menus/menu2.jpg')
global.imagen3 = fs.readFileSync('./media/Menus/menu3.jpg')
global.catalogo = fs.readFileSync('./media/catalogo.jpg')
global.kiyotakaurl = fs.readFileSync('./media/kiyotakaurl.jpg')

global.estilo = { key: {  fromMe: false, participant: `0@s.whatsapp.net`, ...(false ? { remoteJid: "4915210396723" } : {}) }, message: { orderMessage: { itemCount : -999999, status: 1, surface : 1, message: 'QUANTUM TEAM', orderTitle: 'Bang', thumbnail: catalogo, sellerJid: '0@s.whatsapp.net'}}}

global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios
global.moment = moment        

global.multiplier = 69 
global.maxwarn = '3'

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})