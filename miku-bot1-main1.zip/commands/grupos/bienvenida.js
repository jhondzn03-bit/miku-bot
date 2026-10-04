/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║          BIENVENIDA / DESPEDIDA  —  MIKU-BOT                 ║
 * ║   Activa o desactiva mensajes de bienvenida y despedida      ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

module.exports = {
  command: ['bienvenida', 'despedida', 'welcome', 'goodbye'],
  description: 'Activa o desactiva bienvenida / despedida en el grupo',
  categoria: 'grupos',
  admin: true,
  group: true,

  run: async (client, m, args, from, isCreator, ctx = {}) => {
    const settings  = ctx?.settings || {};
    const rawCmd    = String(
      m?.message?.conversation ||
      m?.message?.extendedTextMessage?.text || ''
    ).toLowerCase().split(/\s+/)[0].replace(/^\./, '');

    const isBienvenida = ['bienvenida', 'welcome'].includes(rawCmd);
    const isDespdida   = ['despedida', 'goodbye'].includes(rawCmd);
    const mode         = String(args[0] || '').toLowerCase();

    if (!['on', 'off', '1', '0'].includes(mode)) {
      const tipo = isBienvenida ? '🌸 BIENVENIDA' : '👋 DESPEDIDA';
      return client.sendMessage(from, {
        text:
`╭━━━〔 ${tipo} 〕━━━⬣

🌸 Uso correcto:

➜ .${rawCmd} on
➜ .${rawCmd} off

💙 Sistema de mensajes de grupo`
      }, { quoted: m });
    }

    const all = settings.groupOptions && typeof settings.groupOptions === 'object'
      ? settings.groupOptions : {};
    const current = all[from] || {};
    const enabled = mode === 'on' || mode === '1';

    if (isBienvenida) {
      all[from] = { ...current, bienvenida: enabled };
    } else if (isDespdida) {
      all[from] = { ...current, despedida: enabled };
    }

    ctx.saveSettings({ groupOptions: all });

    if (isBienvenida) {
      await client.sendMessage(from, {
        text: enabled
          ? `╭━━━〔 🌸 BIENVENIDA 〕━━━⬣\n\n✅ Estado: *ACTIVADO*\n\n🖼️ Se enviará la imagen del grupo\n📛 con el nombre de WhatsApp del nuevo miembro\ncada vez que alguien entre.\n\n━━━━━━━━━━━━━━━━━━\n💙 Sistema de bienvenida activo\n━━━━━━━━━━━━━━━━━━`
          : `╭━━━〔 🌸 BIENVENIDA 〕━━━⬣\n\n❌ Estado: *DESACTIVADO*\n\n🔇 Ya no se enviarán mensajes\nde bienvenida en este grupo.\n\n━━━━━━━━━━━━━━━━━━\n💙 Sistema de bienvenida inactivo\n━━━━━━━━━━━━━━━━━━`
      }, { quoted: m });
    } else {
      await client.sendMessage(from, {
        text: enabled
          ? `╭━━━〔 👋 DESPEDIDA 〕━━━⬣\n\n✅ Estado: *ACTIVADO*\n\n🖼️ Se enviará la imagen del grupo\n📛 con el nombre de WhatsApp del miembro\ncada vez que alguien salga.\n\n━━━━━━━━━━━━━━━━━━\n💙 Sistema de despedida activo\n━━━━━━━━━━━━━━━━━━`
          : `╭━━━〔 👋 DESPEDIDA 〕━━━⬣\n\n❌ Estado: *DESACTIVADO*\n\n🔇 Ya no se enviarán mensajes\nde despedida en este grupo.\n\n━━━━━━━━━━━━━━━━━━\n💙 Sistema de despedida inactivo\n━━━━━━━━━━━━━━━━━━`
      }, { quoted: m });
    }
  },
};
