module.exports = {
  command: ['descripcion', 'desc', 'setdesc'],
  description: 'Cambia la descripción del grupo',
  categoria: 'grupos',
  admin: true,
  group: true,

  run: async (client, m, args, from) => {
    const desc = args.join(' ').trim();

    if (!desc) {
      return client.sendMessage(from, {
        text:
`╭━━━〔 📝 CAMBIAR DESCRIPCIÓN 〕━━━⬣

🌸 Uso correcto:

➜ .descripcion Texto para el grupo

💙 Solo administradores pueden usarlo.`
      }, { quoted: m });
    }

    try {
      await client.groupUpdateDescription(from, desc);
      await client.sendMessage(from, {
        text:
`╭━━━〔 📝 DESCRIPCIÓN ACTUALIZADA 〕━━━⬣

✅ Nueva descripción aplicada.

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽`,
      }, { quoted: m });
    } catch {
      await client.sendMessage(from, {
        text: '❌ No pude cambiar la descripción. Verifica que el bot sea admin.',
      }, { quoted: m });
    }
  },
};
