const fs = require('fs');
const path = require('path');

module.exports = {
  command: ['menu', 'help', 'comandos'],
  description: 'Muestra el menú de comandos',
  categoria: 'general',

  run: async (client, m, args, from, isCreator, ctx = {}) => {

    // ============================================================
    // REACCIÓN ALEATORIA
    // ============================================================

    const REACTIONS = ['💜', '⚡', '𖤐', '✨', '🪻'];

    const randomReaction =
      REACTIONS[Math.floor(Math.random() * REACTIONS.length)];

    await client.sendMessage(from, {
      react: {
        text: randomReaction,
        key: m.key
      }
    });

    const prefix = ctx?.prefix || '.';
    const settings = ctx?.settings || {};

    const apiReady = Boolean(
      String(settings.apiBaseUrl || '').trim() &&
      String(settings.apiKey || '').trim()
    );

    // ============================================================
    // UPTIME
    // ============================================================

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
        icon: '💿',
        title: '𝙳𝙴𝚂𝙲𝙰𝚁𝙶𝙰𝚂'
      },
      grupos: {
        icon: '👥',
        title: '𝙶𝚁𝚄𝙿𝙾𝚂'
      },
      juegos: {
        icon: '🎮',
        title: '𝙹𝚄𝙴𝙶𝙾𝚂'
      },
      herramientas: {
        icon: '🛠️',
        title: '𝙷𝙴𝚁𝚁𝙰𝙼𝙸𝙴𝙽𝚃𝙰𝚂'
      },
      sistema: {
        icon: '⚙️',
        title: '𝚂𝙸𝚂𝚃𝙴𝙼𝙰'
      },
      owner: {
        icon: '👑',
        title: '𝙾𝚆𝙽𝙴𝚁'
      },
      general: {
        icon: '✦',
        title: '𝙶𝙴𝙽𝙴𝚁𝙰𝙻'
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
      'antispamstickers', 'antispamimage',
      'antispamimages', 'antispamvideos',
      'antispamaudios', 'antispamvoice',
      'everyone', 'mencionartodos',
      'ban', 'addadmin', 'removeadmin', 'quitaradmin',
      'del', 'delete',
      'adivina', 'numero', 'guess',
      'verdad', 'pregunta', 'truth',
      'reto', 'challenge', 'desafio',
      'ruleta', 'wheel', 'suerte',
      'time', 'reloj',
      'system', 'estado',
      'botinfo', 'info',
      'velocidad', 'ping', 'internet', 'conexion',
      'groupinfo', 'ginfo',
      'fecha', 'dia',
      'recursos', 'stats'
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
          seen.has(String(mainCmd).toLowerCase()) ||
          HIDDEN.has(String(mainCmd).toLowerCase())
        ) {
          continue;
        }

        seen.add(String(mainCmd).toLowerCase());

        const cat = String(
          mod.categoria || 'general'
        ).toLowerCase();

        if (!grouped[cat]) grouped[cat] = [];

        grouped[cat].push({
          cmd: mainCmd,
          desc: mod.description || ''
        });
      }
    }

    // ============================================================
    // ORDENAR COMANDOS
    // ============================================================

    for (const cat of Object.keys(grouped)) {
      grouped[cat].sort((a, b) =>
        String(a.cmd).localeCompare(String(b.cmd))
      );
    }

    // ============================================================
    // DECORACIÓN
    // ============================================================

    const DIVS = [
      '╭━━━〔 𖤐 〕━━━╮',
      '╭━━━〔 ✦ 〕━━━╮',
      '╭━━━〔 ⚡ 〕━━━╮',
      '╭━━━〔 ♡ 〕━━━╮',
      '╭━━━〔 ✧ 〕━━━╮'
    ];

    const CMD_ICONS = ['✦', '➤', '⚡', '✧', '♡', '𖤐'];

    const allCats = [
      ...CAT_ORDER.filter(c => grouped[c]?.length),
      ...Object.keys(grouped).filter(
        c => !CAT_ORDER.includes(c) && grouped[c]?.length
      )
    ];

    // ============================================================
    // CONSTRUIR MENÚ
    // ============================================================

    let sections = '';

    allCats.forEach((cat, i) => {
      const meta = CAT_META[cat] || {
        icon: '✦',
        title: String(cat).toUpperCase()
      };

      let block =
`${DIVS[i % DIVS.length]}
│
│ ${meta.icon} ${meta.title}
│
╰┈┈┈┈┈┈┈┈┈┈`;

      grouped[cat].forEach(({ cmd, desc }, index) => {
        const icon = CMD_ICONS[index % CMD_ICONS.length];

        block +=
`\n│
│ ${icon} \`${prefix}${cmd}\``;

        if (desc) {
          const words = String(desc).split(/\s+/);
          const lines = [];
          let current = '';

          for (const word of words) {
            if ((current + ' ' + word).trim().length > 30) {
              if (current.trim()) lines.push(current.trim());
              current = word;
            } else {
              current += ' ' + word;
            }
          }

          if (current.trim()) lines.push(current.trim());

          lines.forEach((line, lineIndex) => {
            block += lineIndex === 0
              ? `\n│   ╰─➤ _${line}_`
              : `\n│      _${line}_`;
          });
        }
      });

      block +=
`
│
╰━━━━━━━━━━━━━━━━━━╯

`;

      sections += block;
    });

    // ============================================================
    // MENÚ PRINCIPAL
    // ============================================================

    const caption =
`╭━━━━━━━━〔 𖤐 〕━━━━━━━━╮
│
│ 𖤐『𝙼𝙸𝙺𝚄 - 𝙱𝙾𝚃』𖤐
│
│       ✦ 𝙿𝚁𝙴𝙼𝙸𝚄𝙼 𝙱𝙾𝚃 ✦
│    ⚡ 𝚂𝚝𝚢𝚕𝚎 • 𝙿𝚘𝚠𝚎𝚛 • 𝙲𝚊𝚕𝚒𝚍𝚊𝚍
│
╰━━━━━━━━〔 𖤐 〕━━━━━━━━╯

       ♡ 𝙱𝙸𝙴𝙽𝚅𝙴𝙽𝙸𝙳𝙾 ♡

   𝙴𝚕 𝚙𝚘𝚍𝚎𝚛 𝚍𝚎 𝙼𝚒𝚔𝚞
   𝚎𝚜𝚝𝚊́ 𝚎𝚗 𝚝𝚞𝚜 𝚖𝚊𝚗𝚘𝚜... ✨

╭━━━━━━〔 ✦ 〕━━━━━━╮
│      𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝙲𝙸𝙾́𝙽
├━━━━━━━━━━━━━━━━━━━
│
│ 𖤐 𝙿𝚛𝚎𝚏𝚒𝚓𝚘
│   ╰➤ \`${prefix}\`
│
│ ⚙️ 𝙴𝚜𝚝𝚊𝚍𝚘 𝙰𝙿𝙸
│   ╰➤ ${apiReady ? '🟢 _Activa_' : '🔴 _Pendiente_'}
│
│ ⏱️ 𝚃𝚒𝚎𝚖𝚙𝚘 𝚊𝚌𝚝𝚒𝚟𝚘
│   ╰➤ \`${uptime}\`
│
│ 📚 𝙲𝚘𝚖𝚊𝚗𝚍𝚘𝚜
│   ╰➤ \`${seen.size}\`
│
╰━━━━━━━━━━━━━━━━━━━╯

          ✧ 𝙲𝙾𝙼𝙰𝙽𝙳𝙾𝚂 ✧
       𖤐━━━━━━━━━━━━𖤐

${sections}
╭━━━━━━━━〔 ♡ 〕━━━━━━━━╮
│
│ 𖤐『𝙼𝙸𝙺𝚄 - 𝙱𝙾𝚃』𖤐
│
│    ⚡ 𝙶𝚛𝚊𝚌𝚒𝚊𝚜 𝚙𝚘𝚛 𝚞𝚜𝚊𝚛 𝙼𝚒𝚔𝚞
│       ✦ 𝚂𝚒𝚎𝚖𝚙𝚛𝚎 𝚊 𝚘𝚝𝚛𝚘 𝚗𝚒𝚟𝚎𝚕 ✦
│
╰━━━━━━━━〔 𖤐 〕━━━━━━━━╯`;

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
        { quoted: m }
      );

    } catch (err) {
      await client.sendMessage(
        m.key.remoteJid,
        { text: caption },
        { quoted: m }
      );
    }
  }
};