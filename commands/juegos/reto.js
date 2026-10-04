const CHALLENGES = [
  'Haz 10 flexiones',
  'Envía un sticker random',
  'Escribe un mensaje con solo emojis',
  'Di "Miku" 5 veces rápido',
  'No respondas por 30 segundos',
  'Haz una mini rima con el nombre de un amigo',
  'Pon tu canción favorita en el chat',
  'Haz una pregunta al grupo',
];

module.exports = {
  command: ['reto', 'challenge', 'desafio'],
  description: 'Envía un reto aleatorio para jugar en el chat',
  categoria: 'juegos',

  run: async (client, m, args, from) => {
    const challenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];

    await client.sendMessage(from, {
      text:
`╭━━━〔 🎯 RETO 〕━━━⬣

🔥 *Reto:* ${challenge}

💡 Si lo cumples, manda prueba en el chat.

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽`,
    }, { quoted: m });
  },
};
