module.exports = {
  command: ['revoke', 'resetlink', 'reiniciaenlace', 'revocar'],
  description: 'Reinicia el enlace de invitación del grupo',
  categoria: 'grupos',
  admin: true,
  group: true,

  run: async (client, m, args, from) => {
    try {
      const code = await client.groupRevokeInvite(from);
      const link = `https://chat.whatsapp.com/${code}`;

      await client.sendMessage(from, {
        text:
`╭━━━〔 ♻️ ENLACE REINICIADO 〕━━━⬣

✅ Nuevo enlace:
${link}

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽`,
      }, { quoted: m });
    } catch {
      await client.sendMessage(from, {
        text: '❌ No pude reiniciar el enlace. Verifica que el bot sea admin.',
      }, { quoted: m });
    }
  },
};
