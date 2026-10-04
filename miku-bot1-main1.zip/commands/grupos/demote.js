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
`꧁𑂺᭄𑂻꧂ QUITAR ADMIN ꧁𑂺᭄𑂻꧂

🌸 *Uso:*
➜ .demote @usuario
➜ .demote (responder mensaje)

⬇️ El admin perderá sus permisos.`
      }, { quoted: m });
    }

    const results = [];
    for (const jid of targets) {
      try {
        await client.groupParticipantsUpdate(from, [jid], 'demote');
        results.push(`✅ @${jid.split('@')[0]} ya no es admin`);
      } catch {
        results.push(`❌ No pude remover admin a @${jid.split('@')[0]}`);
      }
    }

    await client.sendMessage(from, {
      text:
`꧁𑂺᭄𑂻꧂ DEMOTE ꧁𑂺᭄𑂻꧂

${results.join('\n')}

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽 — Admin tools
━━━━━━━━━━━━━━━━━━`,
      mentions: targets,
    }, { quoted: m });
  },
};
