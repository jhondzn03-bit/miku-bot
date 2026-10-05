module.exports = {
  command: ['antiprivado', 'antiprivate'],
  description: 'Bloquea comandos en chat privado',
  categoria: 'grupos',
  isOwner: true,

  run: async (client, m, args, from, isCreator, ctx = {}) => {

    const mode = String(args[0] || '').toLowerCase();

    if (!['on', 'off', '1', '0'].includes(mode)) {
      return client.sendMessage(from, {
        text:
`╭━━━ 🎃 𝙼𝙸𝙺𝚄 - 𝙱𝙾𝚃 🎃 ━━━╮
┃
┃ 🕸️ 𝘼𝙉𝙏𝙄 𝙋𝙍𝙄𝙑𝘼𝘿𝙊 🔒
┃
┃ 🦇 𝙐𝙨𝙤 𝙘𝙤𝙧𝙧𝙚𝙘𝙩𝙤:
┃
┃ ➜ .antiprivado on
┃ ➜ .antiprivado off
┃
┃ 🎃 Control de acceso
┃    y protección del bot.
┃
╰━━━━━━━━━━━━━━━━━━━━╯`
      }, { quoted: m });
    }

    const enabled = mode === 'on' || mode === '1';

    ctx.saveSettings({
      antiPrivate: enabled
    });

    if (enabled) {
      await client.sendMessage(from, {
        text:
`╭━━━ 🎃 𝙼𝙸𝙺𝚄 - 𝙱𝙾𝚃 🎃 ━━━╮
┃
┃ 🕸️ 𝘼𝙉𝙏𝙄 𝙋𝙍𝙄𝙑𝘼𝘿𝙊 🔒
┃
┃ 🎃 Estado: 𝘼𝘾𝙏𝙄𝙑𝘼𝘿𝙊 👻
┃
┃ 🚫 El bot ignorará mensajes
┃    privados de usuarios normales.
┃
┃ 👑 𝙋𝙚𝙧𝙢𝙞𝙩𝙞𝙙𝙤𝙨:
┃ • Owner
┃ • Sistema del Bot
┃
┃ 🦇 Mayor control y seguridad
┃    para el uso del bot.
┃
╰━━━━━━━━━━━━━━━━━━━━╯
      🎃 𝙋𝙧𝙤𝙩𝙚𝙘𝙘𝙞ó𝙣 𝙥𝙧𝙞𝙫𝙖𝙙𝙖 𝙖𝙘𝙩𝙞𝙫𝙖 👻`
      }, { quoted: m });
    } else {
      await client.sendMessage(from, {
        text:
`╭━━━ 🎃 𝙼𝙸𝙺𝚄 - 𝙱𝙾𝚃 🎃 ━━━╮
┃
┃ 🕸️ 𝘼𝙉𝙏𝙄 𝙋𝙍𝙄𝙑𝘼𝘿𝙊 🔓
┃
┃ 💀 Estado: 𝘿𝙀𝙎𝘼𝘾𝙏𝙄𝙑𝘼𝘿𝙊
┃
┃ 📨 El bot volverá a responder
┃    mensajes privados normalmente.
┃
╰━━━━━━━━━━━━━━━━━━━━╯
      🦇 𝙋𝙧𝙤𝙩𝙚𝙘𝙘𝙞ó𝙣 𝙥𝙧𝙞𝙫𝙖𝙙𝙖 𝙙𝙚𝙨𝙖𝙘𝙩𝙞𝙫𝙖𝙙𝙖 🎃`
      }, { quoted: m });
    }
  },
};