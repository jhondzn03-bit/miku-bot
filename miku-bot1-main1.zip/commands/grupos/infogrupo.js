module.exports = {
  command: ['infogrupo', 'groupinfo', 'ginfo'],
  description: 'Muestra información detallada del grupo',
  categoria: 'grupos',
  group: true,

  run: async (client, m, args, from) => {
    let metadata;
    try {
      metadata = await client.groupMetadata(from);
    } catch {
      return client.sendMessage(from, { text: '❌ No pude obtener información del grupo.' }, { quoted: m });
    }

    const nombre     = metadata?.subject || 'Sin nombre';
    const desc       = metadata?.desc || '_Sin descripción_';
    const total      = metadata?.participants?.length || 0;
    const admins     = (metadata?.participants || []).filter(p => p.admin).length;
    const creacion   = metadata?.creation
      ? new Date(metadata.creation * 1000).toLocaleDateString('es-PE')
      : 'Desconocida';
    const soloAdmins = metadata?.announce ? '🔒 Solo admins' : '🔓 Todos';
    const restrict   = metadata?.restrict  ? '🔒 Solo admins' : '🔓 Todos';

    const text =
`꧁𐔌᭄𖤝꧂ INFO GRUPO ꧁𐔌᭄𖤝꧂
　ೃ⁀➷ 𝓗𝓪𝓽𝓼𝓾𝓷𝓮 𝓜𝓲𝓴𝓾 ❦

≿━━━━━━━━━━━━━━━━━━━━━≾
╭─ 〘 👥 𝔊𝔯𝔲𝔭𝔬 𝔍𝔫𝔣𝔬 〙
│
│: ̗̀➛ 📌 *Nombre:* _${nombre}_
│: ̗̀➛ 📅 *Creado:* _${creacion}_
│: ̗̀➛ 👥 *Miembros:* _${total}_
│: ̗̀➛ 👑 *Admins:* _${admins}_
│: ̗̀➛ 💬 *Mensajes:* ${soloAdmins}
│: ̗̀➛ ✏️ *Editar info:* ${restrict}
│
│: ̗̀➛ 📝 *Descripción:*
│  _${String(desc).slice(0, 200)}_
│
╰────────────────
≾━━━━━━━━━━━━━━━━━━━━━≿

꧁𓊉᭄𖨆꧂ 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽 ✦`;

    await client.sendMessage(from, { text }, { quoted: m });
  },
};
