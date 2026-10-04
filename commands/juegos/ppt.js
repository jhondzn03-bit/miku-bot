const MOVES = ['piedra', 'papel', 'tijera'];

function normalizeMove(value = '') {
  const v = String(value || '').toLowerCase().trim();
  if (['piedra', 'stone', 'rock', 'p'].includes(v)) return 'piedra';
  if (['papel', 'paper', 'pa'].includes(v)) return 'papel';
  if (['tijera', 'tijeras', 'scissors', 't'].includes(v)) return 'tijera';
  return '';
}

function winner(user, bot) {
  if (user === bot) return 'empate';
  if (
    (user === 'piedra' && bot === 'tijera') ||
    (user === 'papel' && bot === 'piedra') ||
    (user === 'tijera' && bot === 'papel')
  ) return 'usuario';
  return 'bot';
}

module.exports = {
  command: ['ppt', 'piedra', 'papel', 'tijera', 'jokenpo'],
  description: 'Juega piedra, papel o tijera contra el bot',
  categoria: 'juegos',

  run: async (client, m, args, from, isCreator, ctx = {}) => {
    const userMove = normalizeMove(args[0]);
    if (!userMove) {
      return client.sendMessage(from, {
        text:
`╭━━━〔 ✊✋✌️ PIEDRA PAPEL TIJERA 〕━━━⬣

🌸 Uso correcto:

➜ .ppt piedra
➜ .ppt papel
➜ .ppt tijera

💙 Juega contra el bot.`
      }, { quoted: m });
    }

    const botMove = MOVES[Math.floor(Math.random() * MOVES.length)];
    const result = winner(userMove, botMove);

    const label = {
      usuario: '🏆 ¡Ganaste!',
      bot: '🤖 Ganó el bot',
      empate: '🤝 Empate',
    }[result];

    await client.sendMessage(from, {
      text:
`╭━━━〔 ✊✋✌️ PIEDRA PAPEL TIJERA 〕━━━⬣

👤 Tú: *${userMove}*
🤖 Bot: *${botMove}*

${label}

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽`,
    }, { quoted: m });
  },
};
