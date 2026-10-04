module.exports = {
  command: ['antilink'],
  description: 'Activa o desactiva antilink en el grupo',
  categoria: 'grupos',
  admin: true,
  group: true,

  run: async (client, m, args, from, isCreator, ctx = {}) => {

    const mode = String(args[0] || '').toLowerCase();

    if (!['on', 'off', '1', '0'].includes(mode)) {
      return client.sendMessage(from, {
        text:
`╭━━━〔 🔗 ANTI LINK 〕━━━⬣

🌸 Uso correcto:

➜ .antilink on
➜ .antilink off

💙 Sistema de protección grupal`
      }, { quoted: m });
    }

    const settings = ctx?.settings || {};
    const all = settings.groupOptions && typeof settings.groupOptions === 'object'
      ? settings.groupOptions
      : {};

    const current = all[from] || {};
    const enabled = mode === 'on' || mode === '1';

    all[from] = {
      ...current,
      antilink: enabled
    };

    ctx.saveSettings({ groupOptions: all });

    if (enabled) {
      await client.sendMessage(from, {
        text:
`╭━━━〔 🛡️ ANTI LINK 〕━━━⬣

✅ Estado: ACTIVADO

🔗 Se eliminarán enlaces de:
• Grupos de WhatsApp
• Canales de WhatsApp

⚠️ Sistema de advertencias:
• 1/3 Advertencia
• 2/3 Advertencias
• 3/3 Expulsión automática

👑 Administradores, Owner y Bot
están exentos de esta función.

━━━━━━━━━━━━━━━━━━
💙 Protección grupal activa
━━━━━━━━━━━━━━━━━━`
      }, { quoted: m });
    } else {
      await client.sendMessage(from, {
        text:
`╭━━━〔 🛡️ ANTI LINK 〕━━━⬣

❌ Estado: DESACTIVADO

🔓 Los enlaces ya no serán
detectados ni eliminados.

━━━━━━━━━━━━━━━━━━
💙 Protección grupal desactivada
━━━━━━━━━━━━━━━━━━`
      }, { quoted: m });
    }
  },
};