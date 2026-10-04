module.exports = {
  command: ['titulo', 'nombregrupo', 'setname', 'subject'],
  description: 'Cambia el nombre del grupo',
  categoria: 'grupos',
  admin: true,
  group: true,

  run: async (client, m, args, from) => {
    const name = args.join(' ').trim();

    if (!name) {
      return client.sendMessage(from, {
        text:
`╭━━━〔 🏷️ CAMBIAR NOMBRE 〕━━━⬣

🌸 Uso correcto:

➜ .titulo Nuevo nombre del grupo

💙 Solo administradores pueden usarlo.`
      }, { quoted: m });
    }

    try {
      await client.groupUpdateSubject(from, name);
      await client.sendMessage(from, {
        text:
`╭━━━〔 🏷️ NOMBRE ACTUALIZADO 〕━━━⬣

✅ Nuevo nombre:

*${name}*

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽`,
      }, { quoted: m });
    } catch {
      await client.sendMessage(from, {
        text: '❌ No pude cambiar el nombre. Verifica que el bot sea admin.',
      }, { quoted: m });
    }
  },
};
