/**
 * ╔══════════════════════════════════════════════════════╗
 * ║        ANTI-SPAM  —  MIKU-BOT  |  FSOCIETY          ║
 * ║  Detecta spam de stickers, imágenes, audios, videos  ║
 * ║  Elimina el mensaje al instante — sin expulsión      ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * Tipos soportados:
 *   antispamsticker  /  antispamimagen  /  antispamvideo  /  antispamudio
 *
 * Uso:
 *   .antispamsticker on/off
 *   .antispamimagen  on/off
 *   .antispamvideo   on/off
 *   .antispamudio    on/off
 */

// ── Mapa de tipo → clave en groupOptions ──────────────────────────────────────
const TIPOS = {
  antispamsticker : 'antispamSticker',
  antispamstickers: 'antispamSticker',
  antispamimagen  : 'antispamImagen',
  antispamimage   : 'antispamImagen',
  antispamimages  : 'antispamImagen',
  antispamvideo   : 'antispamVideo',
  antispamvideos  : 'antispamVideo',
  antispamudio    : 'antispamAudio',
  antispamaudios  : 'antispamAudio',
  antispamvoice   : 'antispamAudio',
};

module.exports = {
  command: [
    'antispamsticker','antispamstickers',
    'antispamimagen','antispamimage','antispamimages',
    'antispamvideo','antispamvideos',
    'antispamudio','antispamaudios','antispamvoice',
  ],
  description: 'Anti-spam de stickers / imágenes / videos / audios en el grupo',
  categoria: 'grupos',
  admin: true,
  group: true,

  run: async (client, m, args, from, isCreator, ctx = {}) => {
    const settings   = ctx?.settings || {};
    const rawBody    = String(
      m?.message?.conversation ||
      m?.message?.extendedTextMessage?.text || ''
    ).toLowerCase().trim();

    // ¿Qué tipo de spam estamos configurando?
    const usedCmd    = rawBody.split(/\s+/)[0].replace(/^\./, '');
    const optKey     = TIPOS[usedCmd];

    if (!optKey) return; // no debería llegar aquí

    const mode    = String(args[0] || '').toLowerCase();
    const enabled = mode === 'on' || mode === '1';

    // Etiquetas bonitas por tipo
    const META = {
      antispamSticker: { emoji: '🎴', label: 'STICKERS' },
      antispamImagen : { emoji: '🖼️', label: 'IMÁGENES' },
      antispamVideo  : { emoji: '🎬', label: 'VIDEOS'   },
      antispamAudio  : { emoji: '🎵', label: 'AUDIOS'   },
    };
    const { emoji, label } = META[optKey];

    if (!['on', 'off', '1', '0'].includes(mode)) {
      return client.sendMessage(from, {
        text:
`꧁𑁍᭄𖧧꧂ ANTI-SPAM ${label} ꧁𑁍᭄𖧧꧂

🌸 *Uso correcto:*

➜ .${usedCmd} on
➜ .${usedCmd} off

${emoji} _Detecta y elimina ${label.toLowerCase()} masivos_
💙 Sistema de protección grupal`
      }, { quoted: m });
    }

    // Guardar configuración
    const all     = settings.groupOptions && typeof settings.groupOptions === 'object'
      ? settings.groupOptions : {};
    const current = all[from] || {};
    all[from]     = { ...current, [optKey]: enabled };
    ctx.saveSettings({ groupOptions: all });

    const estado  = enabled ? '✅ *ACTIVADO*' : '❌ *DESACTIVADO*';
    const detalle = enabled
      ? `🚫 Se eliminarán automáticamente\ntodos los ${label.toLowerCase()} enviados\npor miembros normales.\n\n👑 Admins y Owner están exentos.`
      : `🔓 Los ${label.toLowerCase()} ya no serán\nbloqueados en este grupo.`;

    await client.sendMessage(from, {
      text:
`꧁𑁍᭄𖧧꧂ ANTI-SPAM ${label} ꧁𑁍᭄𖧧꧂

${emoji} Estado: ${estado}

${detalle}

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽 — Protección grupal
━━━━━━━━━━━━━━━━━━`
    }, { quoted: m });
  },
};
