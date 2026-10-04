module.exports = {
  command: ['id', 'chatid', 'jid'],
  description: 'Muestra el id del chat y del usuario',
  categoria: 'herramientas',

  run: async (client, m, args, from, isCreator, ctx = {}) => {
    const chatId = from;
    const sender = String(m?.key?.participant || m?.key?.remoteJid || '').split(':')[0];
    const text =
`╭━━━〔 🆔 IDENTIFICADORES 〕━━━⬣

📌 *Chat ID:* \`${chatId}\`
👤 *Sender:* \`${sender}\`
📱 *Bot:* \`${ctx?.settings?.botNumber || '-'}\`

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽`;

    await client.sendMessage(from, { text }, { quoted: m });
  },
};
