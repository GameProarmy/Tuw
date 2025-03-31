let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let isEnable = /true|enable|(turn)?on|1/i.test(command)
  let chat = global.db.data.chats[m.chat]
  let user = global.db.data.users[m.sender]
  let bot = global.db.data.settings[conn.user.jid] || {}
  let type = (args[0] || '').toLowerCase()
  let isAll = false, isUser = false
  switch (type) {
  case 'welcome':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn)
          throw false
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.welcome = isEnable
      break

  case 'antiPrivat':
     isAll = true
        if (!isOwner) {
          global.dfail('rowner', m, conn)
          throw false
      }
      bot.antiPrivate = isEnable
      break

 case 'modoadmin':
    case 'soloadmin':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.modoadmin = isEnable
      break

  case 'autolevelup':
if (m.isGroup) {
if (!(isAdmin || isOwner)) {
global.dfail('admin', m, conn)
throw false
}}
chat.autolevelup = isEnable          
break

  case 'antiSpam':
    case 'antispam':
    case 'antispamosos':
     isAll = true
      if (!isOwner) {
      global.dfail('rowner', m, conn)
      throw false
      }
      bot.antiSpam = isEnable
      break

   case 'antidelete': 
     case 'antieliminar': 
     case 'delete':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
       global.dfail('admin', m, conn)
       throw false
     }}
     chat.delete = isEnable
     break

    case 'antilink':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antiLink = isEnable
      break

      case 'kickfilter':
        if (m.isGroup) {
          if (!(isAdmin || isOwner)) {
            global.dfail('admin', m, conn)
            throw false
          }
        }
        chat.kickFilter = isEnable
        break

      case 'nsfw':
      case 'nsfw': case 'nsfwhot': case 'nsfwhorny':
       if (m.isGroup) {
         if (!(isAdmin || isOwner)) {
           global.dfail('admin', m, conn)
            throw false
           }}
    chat.nsfw = isEnable          
    break
    default:
      if (!/[01]/.test(command)) return conn.reply(m.chat, `*⇥AUTOMATISIERUNGS MENÜ⇤*

*➢* *Anti-Spam*
*-* *Befehl:* !enable antispam - !disable antispam
*-* *Beschreibung:* Aktiviert - deaktiviert den Anti-Spam-Schutz für den Chat.  

*---*

*➢* *Kickfilter*  
*-* *Befehl:* !enable kickfilter - !disable kickfilter  
*-* *Beschreibung:* Aktiviert - deaktiviert das kicken von usern wenn die in die gruppe beitreten.

*---*

*➢* *Welcome Messages*  
*-* *Befehl:* !enable welcome - !disable welcome
*-* *Beschreibung:* Aktiviert - deaktiviert die Willkommensnachricht für neue Mitglieder im Chat.  

*---*

*➢* *Auto-Level-Up*  
*-* *Befehl:* !enable autolevelup - !disable autolevelup
*-* *Beschreibung:* Aktiviert - deaktiviert das automatische Level-Up für Benutzer im Chat.  

*---*

*➢* *Delete Messages*  
*-* *Befehl:* !enable delete - !disable delete 
*-* *Beschreibung:* Aktiviert - deaktiviert den Schutz gegen das Löschen von Nachrichten im Chat. 

*---*

*➢* *Anti-Link*  
*-* *Befehl:* !enable antilink - !disable antilink
*-* *Beschreibung:* Aktiviert - deaktiviert den Schutz gegen Links, die in den Chat gesendet werden.`, null, null)

      throw false
  }
  conn.reply(m.chat, `Die Funktion *${type}* wurde *${isEnable ? 'aktiviert' : 'deaktiviert'}*.`, m);
};

handler.help = ['enable', 'disable']
handler.tags = ['nable', 'owner']
handler.command = ['enable', 'disable', 'menua']
handler.register = true

export default handler