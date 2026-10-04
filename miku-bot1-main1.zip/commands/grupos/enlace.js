module.exports = {
  command: ['enlace', 'linkgrupo', 'invite', 'convite'],
  description: 'Muestra el enlace de invitación del grupo',
  categoria: 'grupos',
  admin: true,
  group: true,

  run: async (client, m, args, from) => {
    try {
      const code = await client.groupInviteCode(from);
      const link = `https://chat.whatsapp.com/${code}`;

      await client.sendMessage(from, {
        text:
`╭━━━〔 🔗 ENLACE DEL GRUPO 〕━━━⬣

${link}

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽`,
      }, { quoted: m });
    } catch {
      await client.sendMessage(from, {
        text: '❌ No pude generar el enlace. Verifica que el bot sea admin.',
      }, { quoted: m });
    }
  },
};
