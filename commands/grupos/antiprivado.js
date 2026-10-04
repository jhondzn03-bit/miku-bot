module.exports = {
  command: ['antiprivado', 'antiprivate'],
  description: 'Bloquea comandos en chat privado',
  categoria: 'grupos',
  isOwner: true,

  run: async (client, m, args, from, isCreator, ctx = {}) => {

    const mode = String(args[0] || '').toLowerCase();

    if (!['on', 'off', '1', '0'].includes(mode)) {
      return client.sendMessage(from, {
        text:
`╭━━━〔 🔒 ANTI PRIVADO 〕━━━⬣

🌸 Uso correcto:

➜ .antiprivado on
➜ .antiprivado off

💙 Control de acceso del bot`
      }, { quoted: m });
    }

    const enabled = mode === 'on' || mode === '1';

    ctx.saveSettings({
      antiPrivate: enabled
    });

    if (enabled) {
      await client.sendMessage(from, {
        text:
`╭━━━〔 🔒 ANTI PRIVADO 〕━━━⬣

✅ Estado: ACTIVADO

🚫 El bot ignorará mensajes
privados de usuarios normales.

👑 Permitidos:
• Owner
• Sistema del Bot

🔐 Mayor control y seguridad
para el uso del bot.

━━━━━━━━━━━━━━━━━━
💙 Protección privada activa
━━━━━━━━━━━━━━━━━━`
      }, { quoted: m });
    } else {
      await client.sendMessage(from, {
        text:
`╭━━━〔 🔒 ANTI PRIVADO 〕━━━⬣

❌ Estado: DESACTIVADO

📨 El bot volverá a responder
mensajes privados normalmente.

━━━━━━━━━━━━━━━━━━
💙 Protección privada desactivada
━━━━━━━━━━━━━━━━━━`
      }, { quoted: m });
    }
  },
};