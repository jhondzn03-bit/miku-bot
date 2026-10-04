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
`꧁𖨆᭄𐂂꧂ PROMOVER A ADMIN ꧁𖨆᭄𐂂꧂

🌸 *Uso:*
➜ .promover @usuario
➜ .promover (responder mensaje)

👑 El usuario se convertirá en admin.`
      }, { quoted: m });
    }

    const results = [];
    for (const jid of targets) {
      try {
        await client.groupParticipantsUpdate(from, [jid], 'promote');
        results.push(`✅ @${jid.split('@')[0]} ahora es *admin*`);
      } catch {
        results.push(`❌ No pude promover a @${jid.split('@')[0]}`);
      }
    }

    await client.sendMessage(from, {
      text:
`꧁𖨆᭄𐂂꧂ PROMOCIÓN ꧁𖨆᭄𐂂꧂

${results.join('\n')}

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽 — Admin tools
━━━━━━━━━━━━━━━━━━`,
      mentions: targets,
    }, { quoted: m });
  },
};
