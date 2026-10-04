module.exports = {
  command: ['modoadmin', 'soloadmin'],
  description: 'Solo administradores pueden usar comandos en el grupo',
  categoria: 'grupos',
  admin: true,
  group: true,

  run: async (client, m, args, from, isCreator, ctx = {}) => {

    const mode = String(args[0] || '').toLowerCase();

    if (!['on', 'off', '1', '0'].includes(mode)) {
      return client.sendMessage(from, {
        text:
`╭━━━〔 👑 MODO ADMIN 〕━━━⬣

🌸 Uso correcto:

➜ .modoadmin on
➜ .modoadmin off

💙 Control de comandos del grupo`
      }, { quoted: m });
    }

    const settings = ctx?.settings || {};

    const all =
      settings.groupOptions &&
      typeof settings.groupOptions === 'object'
        ? settings.groupOptions
        : {};

    const current = all[from] || {};
    const enabled = mode === 'on' || mode === '1';

    all[from] = {
      ...current,
      modoadmin: enabled
    };

    ctx.saveSettings({
      groupOptions: all
    });

    if (enabled) {
      await client.sendMessage(from, {
        text:
`╭━━━〔 👑 MODO ADMIN 〕━━━⬣

✅ Estado: ACTIVADO

🛡️ Restricción habilitada

📌 Ahora solo podrán usar
comandos los siguientes:

👑 Administradores
🌸 Owner
🤖 Bot

🚫 Los miembros normales
no podrán ejecutar comandos.

━━━━━━━━━━━━━━━━━━
💙 Sistema administrativo activo
━━━━━━━━━━━━━━━━━━`
      }, { quoted: m });
    } else {
      await client.sendMessage(from, {
        text:
`╭━━━〔 👑 MODO ADMIN 〕━━━⬣

❌ Estado: DESACTIVADO

💬 Todos los participantes
pueden volver a utilizar
los comandos del bot.

━━━━━━━━━━━━━━━━━━
💙 Restricción eliminada
━━━━━━━━━━━━━━━━━━`
      }, { quoted: m });
    }
  },
};