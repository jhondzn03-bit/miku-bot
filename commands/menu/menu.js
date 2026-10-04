const fs = require('fs');
const path = require('path');

module.exports = {
  command: ['menu', 'help', 'comandos'],
  description: 'Muestra el menú de comandos',
  categoria: 'general',

  run: async (client, m, args, from, isCreator, ctx = {}) => {
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
        icon: '🎮',
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

    // Comandos que NO aparecen en el menú
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

    // Separadores Halloween
    const DIVS = [
      '╭────── 🕸️ ──────╮',
      '╭────── 🦇 ──────╮',
      '╭────── 🎃 ──────╮',
      '╭────── 🕯️ ──────╮',
      '╭────── 👻 ──────╮',
    ];

    const allCats = [
      ...CAT_ORDER.filter(c => grouped[c]?.length),
      ...Object.keys(grouped).filter(
        c => !CAT_ORDER.includes(c) && grouped[c]?.length
      ),
    ];

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
├────────────────────
│
`;

      for (const { cmd, desc } of grouped[cat]) {
        block += `│  🕸️  \`${prefix}${cmd}\`\n`;

        if (desc) {
          block += `│      ╰─➤ _${desc}_\n`;
        }

        block += `│\n`;
      }

      block +=
`╰────────────────────

`;

      sections += block;
    });

    const caption =
`╭────── 🕸️ ──────╮
│
│    𝙼𝙸𝙺𝚄 - 𝙱𝙾𝚃
│
│    🎃 Halloween Edition
│
╰────── 🕸️ ──────╯

╭────── 🦇 ──────╮
│
│  🎤 𝙷𝚊𝚝𝚜𝚞𝚗𝚎 𝙼𝚒𝚔𝚞
│
│  ⟡ Vocaloid Music System ⟡
│
╰────── 🦇 ──────╯

╭────── 🕯️ 𝙴𝚜𝚝𝚊𝚍𝚘 ──────╮
│
│  🎃  *Prefijo*
│      \`${prefix}\`
│
│  🧪  *API*
│      ${apiReady ? '🟢 _Activa_' : '🔴 _Pendiente_'}
│
│  ⏳  *Uptime*
│      \`${uptime}\`
│
│  📜  *Comandos*
│      \`${seen.size}\`
│
╰──────────────────────╯

${sections}╭────── 👻 ──────╮
│
│    🦇 𝙼𝙸𝙺𝚄 - 𝙱𝙾𝚃
│
│    🎃 Happy Halloween
│
╰────── 👻 ──────╯`;

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