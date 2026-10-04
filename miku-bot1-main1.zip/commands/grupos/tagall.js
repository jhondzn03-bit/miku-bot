module.exports = {
  command: ['tagall', 'everyone', 'todos', 'mencionartodos'],
  description: 'Menciona a todos los participantes del grupo',
  categoria: 'grupos',
  admin: true,
  group: true,

  run: async (client, m, args, from, isCreator, ctx = {}) => {
    let metadata;
    try {
      metadata = await client.groupMetadata(from);
    } catch {
      return client.sendMessage(from, { text: '❌ No pude obtener la información del grupo.' }, { quoted: m });
    }

    const participants = metadata?.participants || [];
    const mensaje      = args.join(' ') || '📢 Atención a todos!';

    const menciones = participants.map(p => p.id);
    const lista     = participants.map(p => `@${p.id.split('@')[0]}`).join('\n');

    const text =
`꧁𖹭᭄𓈒꧂ TAG ALL ꧁𖹭᭄𓈒꧂

📢 *${mensaje}*

${lista}

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽 — ${participants.length} participantes
━━━━━━━━━━━━━━━━━━`;

    await client.sendMessage(from, { text, mentions: menciones }, { quoted: m });
  },
};
