module.exports = {
  command: ['demote', 'desadmin', 'removeadmin', 'quitaradmin'],
  description: 'Quita el rango de administrador a un miembro',
  categoria: 'grupos',
  admin: true,
  group: true,

  run: async (client, m, args, from, isCreator, ctx = {}) => {
    const mentioned = m?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quoted    = m?.message?.extendedTextMessage?.contextInfo?.participant;
    const targets   = mentioned.length > 0 ? mentioned : (quoted ? [quoted] : []);

    if (!targets.length) {
      return client.sendMessage(from, {
        text:
`╭━━━ 🎃 𝙼𝙸𝙺𝚄 - 𝙱𝙾𝚃 🎃 ━━━╮
┃
┃ 🕸️ 𝙌𝙐𝙄𝙏𝘼𝙍 𝘼𝘿𝙈𝙄𝙉 🕸️
┃
┃ 🦇 𝙐𝙨𝙤:
┃ ➜ .demote @usuario
┃ ➜ .demote (responder mensaje)
┃
┃ 🎃 El admin perderá sus
┃    permisos del grupo.
┃
╰━━━━━━━━━━━━━━━━━━━━╯`
      }, { quoted: m });
    }

    const results = [];

    for (const jid of targets) {
      try {
        await client.groupParticipantsUpdate(from, [jid], 'demote');
        results.push(`🎃 @${jid.split('@')[0]} ➜ 𝙔𝘼 𝙉𝙊 𝙀𝙎 𝘼𝘿𝙈𝙄𝙉 👻`);
      } catch {
        results.push(`💀 @${jid.split('@')[0]} ➜ 𝙉𝙊 𝙎𝙀 𝙋𝙐𝘿𝙊 𝙌𝙐𝙄𝙏𝘼𝙍 𝘼𝘿𝙈𝙄𝙉`);
      }
    }

    await client.sendMessage(from, {
      text:
`╭━━━ 🎃 𝙼𝙸𝙺𝚄 - 𝙱𝙾𝚃 🎃 ━━━╮
┃
┃ 🕸️ 𝘿𝙀𝙈𝙊𝙏𝙀 👻
┃
${results.map(r => `┃ ${r}`).join('\n')}
┃
╰━━━━━━━━━━━━━━━━━━━━╯
      🦇 𝙈𝙄𝙆𝙐 𝘼𝘿𝙈𝙄𝙉 𝙏𝙊𝙊𝙇𝙎 🎃`,
      mentions: targets,
    }, { quoted: m });
  },
};