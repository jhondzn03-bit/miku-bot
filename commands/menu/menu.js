const fs = require('fs');
const path = require('path');

module.exports = {
  command: ['menu', 'help', 'comandos'],
  description: 'Muestra el menú de comandos',
  categoria: 'general',

  run: async (client, m, args, from, isCreator, ctx = {}) => {

    // Reacción al mensaje que usa .menu
    await client.sendMessage(from, {
      react: {
        text: '👻',
        key: m.key
      }
    });

    const prefix = ctx?.prefix || '.';
    const settings = ctx?.settings || {};

    const apiReady = Boolean(
      String(settings.apiBaseUrl || '').trim() &&
      String(settings.apiKey || '').trim()
    );

    const up = Math.floor(process.uptime());
    const h = Math.floor(up / 3600);
    const mm = Math.floor((up % 3600) / 60);
    const ss = up % 60;

    const uptime =
      String(h).padStart(2, '0') + ':' +
      String(mm).padStart(2, '0') + ':' +
      String(ss).padStart(2, '0');

    // ============================================================
    // CATEGORÍAS
    // ============================================================

    const CAT_META = {
      descargas: {
        icon: '🎃',
        title: '𝙳𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚜'
      },

      grupos: {
        icon: '🕸️',
        title: '𝙶𝚛𝚞𝚙𝚘𝚜'
      },

      juegos: {
        icon: '🧌',
        title: '𝙹𝚞𝚎𝚐𝚘𝚜'
      },

      herramientas: {
        icon: '🧪',
        title: '𝙷𝚎𝚛𝚛𝚊𝚖𝚒𝚎𝚗𝚝𝚊𝚜'
      },

      sistema: {
        icon: '🕯️',
        title: '𝚂𝚒𝚜𝚝𝚎𝚖𝚊'
      },

      owner: {
        icon: '🦇',
        title: '𝙾𝚠𝚗𝚎𝚛'
      },

      general: {
        icon: '📜',
        title: '𝙶𝚎𝚗𝚎𝚛𝚊𝚕'
      }
    };

    const CAT_ORDER = [
      'descargas',
      'grupos',
      'juegos',
      'herramientas',
      'sistema',
      'owner',
      'general'
    ];

    // ============================================================
    // COMANDOS OCULTOS
    // ============================================================

    const HIDDEN = new Set([
      'menu', 'help', 'comandos',

      'antispamstickers',
      'antispamimage',
      'antispamimages',
      'antispamvideos',
      'antispamaudios',
      'antispamvoice',

      'everyone',
      'mencionartodos',

      'ban',
      'addadmin',
      'removeadmin',
      'quitaradmin',

      'del',
      'delete',

      'adivina',
      'numero',
      'guess',

      'verdad',
      'pregunta',
      'truth',

      'reto',
      'challenge',
      'desafio',

      'ruleta',
      'wheel',
      'suerte',

      'time',
      'reloj',

      'system',
      'estado',

      'botinfo',
      'info',

      'velocidad',
      'ping',
      'internet',
      'conexion',

      'groupinfo',
      'ginfo',

      'fecha',
      'dia',

      'recursos',
      'stats',
    ]);

    // ============================================================
    // AGRUPAR COMANDOS
    // ============================================================

    const grouped = {};
    const seen = new Set();

    if (global.comandos) {
      for (const [, mod] of global.comandos) {

        const mainCmd = Array.isArray(mod.command)
          ? mod.command[0]
          : mod.command;

        if (
          !mainCmd ||
          seen.has(mainCmd) ||
          HIDDEN.has(mainCmd)
        ) {
          continue;
        }

        seen.add(mainCmd);

        const cat = String(
          mod.categoria || 'general'
        ).toLowerCase();

        if (!grouped[cat]) {
          grouped[cat] = [];
        }

        grouped[cat].push({
          cmd: mainCmd,
          desc: mod.description || ''
        });
      }
    }

    // ============================================================
    // SEPARADORES HALLOWEEN
    // ============================================================

    const DIVS = [
      '╭────── 🕸️ ──────╮',
      '╭────── 🦇 ──────╮',
      '╭────── 🎃 ──────╮',
      '╭────── 🕯️ ──────╮',
      '╭────── 👻 ──────╮',
      '╭────── 🏚️ ──────╮',
      '╭────── 🧌 ──────╮',
      '╭────── 🐦‍🔥 ──────╮'
    ];

    // ============================================================
    // ICONOS DE COMANDOS
    // ============================================================

    const CMD_ICONS = [
      '🕯️',
      '🦇',
      '🎃',
      '👻',
      '🕸️',
      '🐦‍🔥'
    ];

    const allCats = [
      ...CAT_ORDER.filter(c => grouped[c]?.length),
      ...Object.keys(grouped).filter(
        c => !CAT_ORDER.includes(c) && grouped[c]?.length
      ),
    ];

    // ============================================================
    // CONSTRUIR SECCIONES
    // ============================================================

    let sections = '';

    allCats.forEach((cat, i) => {

      const meta = CAT_META[cat] || {
        icon: '👻',
        title: cat.toUpperCase()
      };

      const div = DIVS[i % DIVS.length];

      let block =
`${div}
│
│  ${meta.icon}  ${meta.title}
│
├────────── 🕸️ ──────────`;

      grouped[cat].forEach(({ cmd, desc }, index) => {

        const icon =
          CMD_ICONS[index % CMD_ICONS.length];

        block += `\n│  ${icon}  \`${prefix}${cmd}\``;

        if (desc) {
          block += `\n│      ╰─➤ _${desc}_`;
        }
      });

      block +=
`
╰────────── 👻 ──────────

`;

      sections += block;
    });

    // ============================================================
    // MENÚ PRINCIPAL
    // ============================================================

    const caption =
`╭────── 🕸️ ──────╮
│
│   🎃 𝙼𝙸𝙺𝚄 - 𝙱𝙾𝚃
│
│   👻 𝙷𝚊𝚕𝚕𝚘𝚠𝚎𝚎𝚗 𝙴𝚍𝚒𝚝𝚒𝚘𝚗
│
╰────── 🕸️ ──────╯

🏚️ 𝙱𝚒𝚎𝚗𝚟𝚎𝚗𝚒𝚍𝚘 𝚊 𝚕𝚊 𝚌𝚊𝚜𝚊 𝚍𝚎 𝙼𝚒𝚔𝚞...

🦇 𝙲𝚞𝚒𝚍𝚊𝚍𝚘 𝚌𝚘𝚗 𝚕𝚘 𝚚𝚞𝚎 𝚊𝚙𝚊𝚛𝚎𝚌𝚎 𝚎𝚗 𝚕𝚊 𝚘𝚜𝚌𝚞𝚛𝚒𝚍𝚊𝚍. 👻

╭────── 🕯️ 𝙸𝚗𝚏𝚘 ──────╮
│
│  🎃  *𝙿𝚛𝚎𝚏𝚒𝚓𝚘*
│      \`${prefix}\`
│
│  🧪  *𝙰𝙿𝙸*
│      ${apiReady ? '🟢 _Activa_' : '🔴 _Pendiente_'}
│
│  ⏳  *𝚄𝚙𝚝𝚒𝚖𝚎*
│      \`${uptime}\`
│
│  📜  *𝙲𝚘𝚖𝚊𝚗𝚍𝚘𝚜*
│      \`${seen.size}\`
│
╰────── 🕯️ ──────╯

🐦‍🔥 𝙻𝚊 𝚗𝚘𝚌𝚑𝚎 𝚊𝚙𝚎𝚗𝚊𝚜 𝚌𝚘𝚖𝚒𝚎𝚗𝚣𝚊...

${sections}
╭────── 👻 ──────╮
│
│   🦇 𝙼𝙸𝙺𝚄 - 𝙱𝙾𝚃
│
│   🎃 𝙷𝚊𝚙𝚙𝚢 𝙷𝚊𝚕𝚕𝚘𝚠𝚎𝚎𝚗
│
│   🏚️ 𝙽𝚘 𝚎𝚗𝚝𝚛𝚎𝚜 𝚊 𝚕𝚊 𝚌𝚊𝚜𝚊...
│
╰────── 🕸️ ──────╯`;

    // ============================================================
    // ENVIAR MENÚ
    // ============================================================

    try {

      const imagePath = path.join(
        process.cwd(),
        'videos-imagenes',
        'miku-menu.png'
      );

      await client.sendMessage(
        m.key.remoteJid,
        {
          image: fs.readFileSync(imagePath),
          caption
        },
        {
          quoted: m
        }
      );

    } catch {

      await client.sendMessage(
        m.key.remoteJid,
        {
          text: caption
        },
        {
          quoted: m
        }
      );
    }
  },
};