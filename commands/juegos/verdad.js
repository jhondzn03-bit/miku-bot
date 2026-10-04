const QUESTIONS = [
  '¿Cuál es tu comida favorita?',
  '¿Cuál fue tu peor vergüenza?',
  '¿A quién le mandarías un mensaje ahora mismo?',
  '¿Qué superpoder quisieras tener?',
  '¿Cuál es tu canción favorita?',
  '¿Qué es lo más raro que has buscado?',
  '¿Cuál es tu miedo más extraño?',
  '¿Con quién te gustaría viajar?',
];

module.exports = {
  command: ['verdad', 'pregunta', 'truth'],
  description: 'Suelta una pregunta aleatoria para jugar verdad',
  categoria: 'juegos',

  run: async (client, m, args, from) => {
    const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];

    await client.sendMessage(from, {
      text:
`╭━━━〔 ❓ VERDAD 〕━━━⬣

🧩 *Pregunta:* ${q}

🌸 Responde en el chat y sigue el juego.

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽`,
    }, { quoted: m });
  },
};
