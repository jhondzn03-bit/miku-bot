module.exports = {
  command: ['promover', 'promote', 'admin', 'addadmin'],
  description: 'Promueve un miembro a administrador del grupo',
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
┃ 🕸️ 𝙋𝙍𝙊𝙈𝙊𝙑𝙀𝙍 𝘼 𝘼𝘿𝙈𝙄𝙉 🕸️
┃
┃ 🦇 𝙐𝙨𝙤:
┃ ➜ .promover @usuario
┃ ➜ .promover (responder mensaje)
┃
┃ 👑 El usuario se convertirá
┃    en administrador.
┃
╰━━━━━━━━━━━━━━━━━━━━╯`
      }, { quoted: m });
    }

    const results = [];

    for (const jid of targets) {
      try {
        await client.groupParticipantsUpdate(from, [jid], 'promote');
        results.push(`🎃 @${jid.split('@')[0]} ➜ 𝘼𝙃𝙊𝙍𝘼 𝙀𝙎 *𝘼𝘿𝙈𝙄𝙉* 👑`);
      } catch {
        results.push(`💀 @${jid.split('@')[0]} ➜ 𝙉𝙊 𝙎𝙀 𝙋𝙐𝘿𝙊 𝙋𝙍𝙊𝙈𝙊𝙑𝙀𝙍`);
      }
    }

    await client.sendMessage(from, {
      text:
`╭━━━ 🎃 𝙼𝙸𝙺𝚄 - 𝙱𝙾𝚃 🎃 ━━━╮
┃
┃ 🕸️ 𝙋𝙍𝙊𝙈𝙊𝘾𝙄Ó𝙉 👑
┃
${results.map(r => `┃ ${r}`).join('\n')}
┃
╰━━━━━━━━━━━━━━━━━━━━╯
      🦇 𝙈𝙄𝙆𝙐 𝘼𝘿𝙈𝙄𝙉 𝙏𝙊𝙊𝙇𝙎 🎃`,
      mentions: targets,
    }, { quoted: m });
  },
};