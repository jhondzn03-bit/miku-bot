module.exports = {
  command: ['admins', 'administradores', 'listadmins'],
  description: 'Muestra la lista de administradores del grupo',
  categoria: 'grupos',
  group: true,

  run: async (client, m, args, from) => {
    let metadata;
    try {
      metadata = await client.groupMetadata(from);
    } catch {
      return client.sendMessage(from, {
        text: '❌ No pude obtener la información del grupo.',
      }, { quoted: m });
    }

    const participants = metadata?.participants || [];
    const admins = participants.filter((p) => p.admin);
    const ownerId = metadata?.owner || metadata?.subjectOwner || '';

    if (!admins.length) {
      return client.sendMessage(from, {
        text: '❌ No encontré administradores en este grupo.',
      }, { quoted: m });
    }

    const list = admins.map((p, i) => {
      const num = String(p.id || '').split('@')[0];
      const tags = [];
      if (String(p.id) === String(ownerId)) tags.push('owner');
      if (p.admin === 'superadmin') tags.push('super');
      const extra = tags.length ? ` _(${tags.join(', ')})_` : '';
      return `│: ̗̀➛ ${i + 1}. @${num}${extra}`;
    }).join('\n');

    const text =
`╭━━━〔 👑 ADMINISTRADORES 〕━━━⬣

👥 *Grupo:* ${metadata?.subject || 'Sin nombre'}
👑 *Total admins:* ${admins.length}

${list}

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽`;

    await client.sendMessage(from, {
      text,
      mentions: admins.map((p) => p.id),
    }, { quoted: m });
  },
};
