const fs   = require('fs');
const path = require('path');

module.exports = {
  command: ['menu', 'help', 'comandos'],
  description: 'Muestra el menú de comandos',
  categoria: 'general',

  run: async (client, m, args, from, isCreator, ctx = {}) => {
    const prefix   = ctx?.prefix || '.';
    const settings = ctx?.settings || {};
    const apiReady = Boolean(String(settings.apiBaseUrl || '').trim() && String(settings.apiKey || '').trim());

    const up = Math.floor(process.uptime());
    const h  = Math.floor(up / 3600);
    const mm = Math.floor((up % 3600) / 60);
    const ss = up % 60;
    const uptime =
      String(h).padStart(2,'0') + ':' +
      String(mm).padStart(2,'0') + ':' +
      String(ss).padStart(2,'0');

    const CAT_META = {
      descargas: { icon: '🎵', title: '𝔇𝔢𝔰𝔠𝔞𝔯𝔤𝔞𝔰'  },
      grupos:    { icon: '👥', title: '𝔊𝔯𝔲𝔭𝔬𝔰'     },
      juegos:    { icon: '🎮', title: '𝔍𝔲𝔢𝔤𝔬𝔰'     },
      herramientas: { icon: '🧰', title: '𝔥𝔢𝔯𝔯𝔞𝔪𝔦𝔢𝔫𝔱𝔞𝔰' },
      sistema:   { icon: '🖥️', title: '𝔖𝔦𝔰𝔱𝔢𝔪𝔞'    },
      owner:     { icon: '👑', title: '𝔒𝔴𝔫𝔢𝔯'      },
      general:   { icon: '📋', title: '𝔊𝔢𝔫𝔢𝔯𝔞𝔩'    },
    };

    const CAT_ORDER = ['descargas', 'grupos', 'juegos', 'herramientas', 'sistema', 'owner', 'general'];

    // Comandos que NO aparecen en el menú (aliases ocultos / spam)
    const HIDDEN = new Set([
      'menu','help','comandos',
      'antispamstickers','antispamimage','antispamimages',
      'antispamvideos','antispamaudios','antispamvoice',
      'everyone','mencionartodos',
      'ban','addadmin','removeadmin','quitaradmin',
      'del','delete',
      'adivina','numero','guess',
      'verdad','pregunta','truth',
      'reto','challenge','desafio',
      'ruleta','wheel','suerte',
      'time','reloj',
      'system','estado',
      'botinfo','info',
      'velocidad','ping','internet','conexion',
      'groupinfo','ginfo',
      'fecha','dia',
      'recursos','stats',
    ]);

    const grouped = {};
    const seen    = new Set();

    if (global.comandos) {
      for (const [, mod] of global.comandos) {
        const mainCmd = Array.isArray(mod.command) ? mod.command[0] : mod.command;
        if (!mainCmd || seen.has(mainCmd) || HIDDEN.has(mainCmd)) continue;
        seen.add(mainCmd);
        const cat = String(mod.categoria || 'general').toLowerCase();
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push({ cmd: mainCmd, desc: mod.description || '' });
      }
    }

    const DIVS = [
      '꧁ᬊ᭄𖦹꧂━━━━━━━━━━━━━━━━━━━━━꧁ᬊ᭄𖦹꧂',
      '꧁𐩕᭄𖣠꧂━━━━━━━━━━━━━━━━━━━━━꧁𐩕᭄𖣠꧂',
      '꧁𑁍᭄𖧧꧂━━━━━━━━━━━━━━━━━━━━━꧁𑁍᭄𖧧꧂',
      '꧁𓇽᭄𑱄꧂━━━━━━━━━━━━━━━━━━━━━꧁𓇽᭄𑱄꧂',
      '꧁𖨆᭄𐂂꧂━━━━━━━━━━━━━━━━━━━━━꧁𖨆᭄𐂂꧂',
    ];

    const allCats = [
      ...CAT_ORDER.filter(c => grouped[c]?.length),
      ...Object.keys(grouped).filter(c => !CAT_ORDER.includes(c) && grouped[c]?.length),
    ];

    let sections = '';
    allCats.forEach((cat, i) => {
      const meta = CAT_META[cat] || { icon: '📌', title: cat.toUpperCase() };
      const div  = DIVS[i % DIVS.length];
      let block  = `${div}\n╭─ 〘 ${meta.icon} ${meta.title} 〙\n│\n`;
      for (const { cmd, desc } of grouped[cat]) {
        block += `│: ̗̀➛ \`${prefix}${cmd}\`\n`;
        if (desc) block += `│  ╰┈➤ _${desc}_\n│\n`;
      }
      block += `╰────────────────\n\n`;
      sections += block;
    });

    const caption =
`꧁𐙚᭄𖦹꧂•°⌖°•꧁𐙚᭄𖦹꧂
　ೃ⁀➷ 𝑴𝑰𝑲𝑼 - 𝑩𝑶𝑻 ❦￤
꧁𐙚᭄𖦹꧂•°⌖°•꧁𐙚᭄𖦹꧂

꒰ 🎤 ꒱ 𝓗𝓪𝓽𝓼𝓾𝓷𝓮 𝓜𝓲𝓴𝓾 𝓟𝓵𝓪𝔂𝓮𝓻
⌕ ⟡ _Vocaloid Music System_ ⟡

꧁𖼴᭄𓇽꧂━━━━━━━━━━━━━━━━━━━━━꧁𖼴᭄𓇽꧂
┌─ 〘 ⚙️ 𝕰𝖘𝖙𝖆𝖉𝖔 〙 ─┐
│: ̗̀➛ *Prefijo* ꞉ \`${prefix}\`
│: ̗̀➛ *API* ꞉ ${apiReady ? '🟢 _Activa_' : '🔴 _Pendiente_'}
│: ̗̀➛ *Uptime* ꞉ \`${uptime}\`
│: ̗̀➛ *Comandos* ꞉ \`${seen.size}\`
└────────────────┘
꧁𖼴᭄𓇽꧂━━━━━━━━━━━━━━━━━━━━━꧁𖼴᭄𓇽꧂

${sections}꧁𓊈᭄𖧷꧂•─────────────•꧁𓊈᭄𖧷꧂
꧁🜲 𓆩Ashe𖤐Ashe𓆪 🜲꧂ 
꧁𓊈᭄𖧷꧂•─────────────•꧁𓊈᭄𖧷꧂`;

    try {
      const imagePath = path.join(process.cwd(), 'videos-imagenes', 'miku-menu.png');
      await client.sendMessage(
        m.key.remoteJid,
        { image: fs.readFileSync(imagePath), caption },
        { quoted: m }
      );
    } catch {
      await client.sendMessage(
        m.key.remoteJid,
        { text: caption },
        { quoted: m }
      );
    }
  },
};
