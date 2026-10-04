module.exports = {
  command: ['ruleta', 'wheel', 'suerte'],
  description: 'Ruleta de suerte con resultado aleatorio',
  categoria: 'juegos',

  run: async (client, m, args, from) => {
    const outcomes = [
      '🍀 Suerte total',
      '🔥 Muy buena racha',
      '😐 Normal',
      '⚠️ Mala suerte',
      '💎 Premio especial',
      '🎉 Ganaste el juego',
    ];
    const result = outcomes[Math.floor(Math.random() * outcomes.length)];

    await client.sendMessage(from, {
      text:
`╭━━━〔 🎡 RULETA 〕━━━⬣

🎯 Resultado: *${result}*

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽`,
    }, { quoted: m });
  },
};
