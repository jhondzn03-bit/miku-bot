const sessions = global.__mikuAdivinaSessions || (global.__mikuAdivinaSessions = new Map());

function makeTarget() {
  return Math.floor(Math.random() * 100) + 1;
}

module.exports = {
  command: ['adivina', 'numero', 'guess'],
  description: 'Adivina el numero secreto entre 1 y 100',
  categoria: 'juegos',

  run: async (client, m, args, from) => {
    const sender = String(m?.key?.participant || m?.key?.remoteJid || '').split(':')[0];
    const key = `${from}:${sender}`;
    const raw = String(args[0] || '').trim().toLowerCase();
    const session = sessions.get(key);

    if (!session || raw === 'nueva' || raw === 'start') {
      const target = makeTarget();
      sessions.set(key, {
        target,
        tries: 0,
        createdAt: Date.now(),
      });

      return client.sendMessage(from, {
        text:
`╭━━━〔 🔢 ADIVINA EL NÚMERO 〕━━━⬣

🎯 Pensé en un número del *1 al 100*.

🌸 Usa:
➜ .adivina <número>

💡 Para cambiar la partida:
➜ .adivina nueva`
      }, { quoted: m });
    }

    const guess = Number(raw);
    if (!Number.isFinite(guess)) {
      return client.sendMessage(from, {
        text:
`╭━━━〔 🔢 ADIVINA EL NÚMERO 〕━━━⬣

🌸 Debes responder con un número.

➜ .adivina <número>
➜ .adivina nueva`
      }, { quoted: m });
    }

    session.tries += 1;

    if (guess === session.target) {
      sessions.delete(key);
      return client.sendMessage(from, {
        text:
`╭━━━〔 🔢 ADIVINA EL NÚMERO 〕━━━⬣

✅ ¡Correcto!
🎉 Adivinaste el número *${session.target}*
🧠 Intentos: *${session.tries}*

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽`
      }, { quoted: m });
    }

    const hint = guess < session.target ? '📈 Más arriba' : '📉 Más abajo';

    await client.sendMessage(from, {
      text:
`╭━━━〔 🔢 ADIVINA EL NÚMERO 〕━━━⬣

❌ No es *${guess}*
${hint}
🧠 Intentos: *${session.tries}*

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽`,
    }, { quoted: m });
  },
};
