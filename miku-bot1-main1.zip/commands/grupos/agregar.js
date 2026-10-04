function normalizeNumber(value = '') {
  return String(value || '')
    .split('@')[0]
    .split(':')[0]
    .replace(/\D/g, '');
}

module.exports = {
  command: ['agregar', 'add', 'sumar', 'invitar'],
  description: 'Agrega un usuario al grupo por mención o número',
  categoria: 'grupos',
  admin: true,
  group: true,

  run: async (client, m, args, from) => {
    const mentioned = m?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quoted    = m?.message?.extendedTextMessage?.contextInfo?.participant;
    const numbers   = args.map(normalizeNumber).filter((n) => n.length >= 8);

    const targets = mentioned.length
      ? mentioned
      : quoted
        ? [quoted]
        : numbers.map((n) => `${n}@s.whatsapp.net`);

    if (!targets.length) {
      return client.sendMessage(from, {
        text:
`╭━━━〔 ➕ AGREGAR MIEMBROS 〕━━━⬣

🌸 Uso correcto:

➜ .agregar @usuario
➜ .agregar 51912345678
➜ .agregar (respondiendo un mensaje)

📌 El bot intentará añadir a ese usuario al grupo.`
      }, { quoted: m });
    }

    const results = [];

    for (const jid of targets) {
      const num = String(jid).split('@')[0];
      try {
        await client.groupParticipantsUpdate(from, [jid], 'add');
        results.push(`✅ @${num} agregado`);
      } catch (e) {
        const msg = String(e?.message || '').toLowerCase();
        const hint = msg.includes('privacy') || msg.includes('forbidden')
          ? ' (privacidad del usuario)'
          : '';
        results.push(`❌ No pude agregar a @${num}${hint}`);
      }
    }

    await client.sendMessage(from, {
      text:
`╭━━━〔 ➕ AGREGAR 〕━━━⬣

${results.join('\n')}

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽`,
      mentions: targets,
    }, { quoted: m });
  },
};
