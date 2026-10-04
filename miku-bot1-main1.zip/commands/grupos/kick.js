module.exports = {
  command: ['kick', 'expulsar', 'ban'],
  description: 'Expulsa a un miembro del grupo (mencionar o responder)',
  categoria: 'grupos',
  admin: true,
  group: true,

  run: async (client, m, args, from, isCreator, ctx = {}) => {
    const mentioned = m?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quoted    = m?.message?.extendedTextMessage?.contextInfo?.participant;

    const targets = mentioned.length > 0 ? mentioned : (quoted ? [quoted] : []);

    if (!targets.length) {
      return client.sendMessage(from, {
        text:
`꧁𐩕᭄𖣠꧂ EXPULSAR MIEMBRO ꧁𐩕᭄𖣠꧂

🌸 *Uso correcto:*

➜ Menciona: .kick @usuario
➜ Responde: .kick (responder mensaje)

🚫 El usuario será expulsado del grupo.
💙 Solo administradores pueden usarlo.`
      }, { quoted: m });
    }

    const results = [];
    for (const jid of targets) {
      try {
        await client.groupParticipantsUpdate(from, [jid], 'remove');
        const num = jid.split('@')[0];
        results.push(`✅ @${num} expulsado`);
      } catch {
        const num = jid.split('@')[0];
        results.push(`❌ No pude expulsar a @${num}`);
      }
    }

    await client.sendMessage(from, {
      text:
`꧁𐩕᭄𖣠꧂ EXPULSIÓN ꧁𐩕᭄𖣠꧂

${results.join('\n')}

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽 — Admin tools
━━━━━━━━━━━━━━━━━━`,
      mentions: targets,
    }, { quoted: m });
  },
};
