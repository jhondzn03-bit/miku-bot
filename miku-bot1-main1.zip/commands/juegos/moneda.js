module.exports = {
  command: ['moneda', 'coin', 'caraocruz'],
  description: 'Lanza una moneda',
  categoria: 'juegos',

  run: async (client, m, args, from) => {
    const side = Math.random() < 0.5 ? 'Cara' : 'Cruz';
    const emoji = side === 'Cara' ? '🪙' : '🪙';

    await client.sendMessage(from, {
      text:
`╭━━━〔 ${emoji} MONEDA 〕━━━⬣

🎯 Resultado: *${side}*

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽`,
    }, { quoted: m });
  },
};
