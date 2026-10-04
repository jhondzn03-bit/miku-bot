module.exports = {
  command: ['dado', 'roll', 'tirar'],
  description: 'Lanza un dado de 6 caras',
  categoria: 'juegos',

  run: async (client, m, args, from) => {
    const result = Math.floor(Math.random() * 6) + 1;

    await client.sendMessage(from, {
      text:
`╭━━━〔 🎲 DADO 〕━━━⬣

🎯 Resultado: *${result}*

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽`,
    }, { quoted: m });
  },
};
