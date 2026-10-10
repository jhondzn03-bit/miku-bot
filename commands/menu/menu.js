const CHANNEL = 'https://whatsapp.com/channel/0029VbDTdbbGehEKhy23fK2h';

const CATS = {
  descargas: ['📥', 'Zona de descargas'],
  grupos: ['🫂', 'Herramientas para grupos'],
  juegos: ['🎮', 'Zona de juegos'],
  herramientas: ['🧰', 'Herramientas útiles'],
  sistema: ['⚙️', 'Estado del sistema'],
  owner: ['🔐', 'Comandos privados'],
  general: ['🌿', 'Comandos generales']
};

const ORDER = [
  'descargas', 'grupos', 'juegos',
  'herramientas', 'sistema', 'owner', 'general'
];

module.exports = {
  command: ['menu', 'help', 'comandos'],
  description: 'Menú principal de Miku',
  categoria: 'general',

  run: async (client, m, args, from, isCreator, ctx = {}) => {
    const prefix = ctx?.prefix || '.';
    const jid = m.sender || m.key?.participant || from;
    const number = String(jid).split('@')[0].split(':')[0];
    const mention = `@${number}`;
    const grouped = {};
    const seen = new Set();

    try {
      await client.sendMessage(from, {
        react: { text: '🌱', key: m.key }
      });
    } catch {}

    if (global.comandos) {
      for (const [, mod] of global.comandos) {
        if (!mod?.command) continue;

        const aliases = Array.isArray(mod.command)
          ? mod.command : [mod.command];

        const main = String(aliases[0] || '').toLowerCase();
        const cat = String(mod.categoria || 'general').toLowerCase();

        if (!main || seen.has(main)) continue;
        if (['menu', 'help', 'comandos'].includes(main)) continue;
        if (cat === 'menu') continue;

        seen.add(main);
        if (!grouped[cat]) grouped[cat] = [];

        grouped[cat].push({
          aliases: aliases.map(x => String(x)),
          desc: String(mod.description || '')
        });
      }
    }

    for (const list of Object.values(grouped)) {
      list.sort((a, b) => a.aliases[0].localeCompare(b.aliases[0]));
    }

    const categories = [
      ...ORDER.filter(c => grouped[c]?.length),
      ...Object.keys(grouped).filter(
        c => !ORDER.includes(c) && grouped[c]?.length
      )
    ];

    const seconds = Math.floor(process.uptime());
    const uptime = [
      Math.floor(seconds / 3600),
      Math.floor((seconds % 3600) / 60),
      seconds % 60
    ].map(n => String(n).padStart(2, '0')).join(':');

    const selected = String(args[0] || '').toLowerCase();
    const validSelected = selected && selected !== 'inicio';

    if (validSelected && !grouped[selected]?.length) {
      await client.sendMessage(from, {
        text: `🌸 @${number}, no encontré esa categoría.\nUsa *${prefix}menu* para ver el menú completo.`,
        mentions: [jid]
      }, { quoted: m });
      return;
    }

    let text = '';

    if (validSelected) {
      const meta = CATS[selected] || ['🍃', selected.toUpperCase()];

      text =
`🌿 MIKU / SECCIÓN

¡Hola, ${mention}! Aquí tienes esta sección.

${meta[0]} *${meta[1]}*

`;

      for (const item of grouped[selected]) {
        text += `› *${item.aliases.map(x => prefix + x).join(' · ')}*\n`;
        if (item.desc) text += `  ${item.desc}\n`;
        text += '\n';
      }

      text += `Usa *${prefix}menu* para volver al menú principal.`;
    } else {
      text =
`🌸 MIKU • BOT GARDEN 🌱

Canal oficial de Miku:
${CHANNEL}

╭────── PERFIL ──────
│ 🌿 Bot: Miku
│ 🧑‍💻 Desarrollador: Alex
│ 🔹 Prefijo: ${prefix}
│ ⏱️ Tiempo activa: ${uptime}
│ 🧩 Comandos: ${seen.size}
│ 📂 Secciones: ${categories.length}
╰───────────────────

¡Hola, ${mention}! Bienvenido/a a mi jardín digital.

✧ Aquí tienes todas mis secciones:
`;
      text += '\n━━━━━━━━━━━━━━━━━━\n';

      for (const cat of categories) {
        const meta = CATS[cat] || ['🍃', cat.toUpperCase()];

        text += `\n${meta[0]} *${meta[1].toUpperCase()}*\n`;
        text += `┌─────────────────\n`;

        for (const item of grouped[cat]) {
          text += `│ ❯ *${item.aliases.map(x => prefix + x).join(' / ')}*\n`;
          if (item.desc) text += `│   ${item.desc}\n`;
          text += '\n';
        }

        text += `└─────────────────\n`;
      }

      text +=
`
╭───「 🌸 MIKU GARDEN 」───
│ 👑 Creado por: Alex
╰──────────────────────

Gracias por usar Miku 🌱
*Pequeños comandos, grandes posibilidades.*`;
    }

    await client.sendMessage(from, {
      text,
      mentions: [jid]
    }, { quoted: m });
  }
};
