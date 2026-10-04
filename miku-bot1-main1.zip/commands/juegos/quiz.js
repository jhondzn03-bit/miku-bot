const sessions = global.__mikuQuizSessions || (global.__mikuQuizSessions = new Map());

function makeQuestion() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const op = Math.random() < 0.5 ? '+' : '-';
  const answer = op === '+' ? a + b : a - b;
  return { text: `${a} ${op} ${b}`, answer };
}

module.exports = {
  command: ['quiz', 'mate', 'adivina'],
  description: 'Juego rápido de matemáticas por chat',
  categoria: 'juegos',

  run: async (client, m, args, from) => {
    const sender = String(m?.key?.participant || m?.key?.remoteJid || '').split(':')[0];
    const key = `${from}:${sender}`;
    const raw = String(args[0] || '').trim();
    const pending = sessions.get(key);

    if (!pending || raw.toLowerCase() === 'nueva') {
      const q = makeQuestion();
      sessions.set(key, {
        answer: q.answer,
        question: q.text,
        createdAt: Date.now(),
      });

      return client.sendMessage(from, {
        text:
`╭━━━〔 🧠 QUIZ DE MATE 〕━━━⬣

❓ Resuelve:
*${q.text} = ?*

🌸 Responde con:
➜ .quiz <respuesta>

💡 Puedes pedir otra con *.quiz nueva*`
      }, { quoted: m });
    }

    const guess = Number(raw);
    if (!Number.isFinite(guess)) {
      return client.sendMessage(from, {
        text:
`╭━━━〔 🧠 QUIZ DE MATE 〕━━━⬣

🌸 Debes responder con un número.

➜ .quiz ${pending.question} = <respuesta>

💡 O usa *.quiz nueva* para otra pregunta.`
      }, { quoted: m });
    }

    const ok = guess === pending.answer;
    sessions.delete(key);

    await client.sendMessage(from, {
      text:
`╭━━━〔 🧠 QUIZ DE MATE 〕━━━⬣

${ok ? '✅ ¡Correcto!' : `❌ Incorrecto. La respuesta era *${pending.answer}*`}

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽`,
    }, { quoted: m });
  },
};
