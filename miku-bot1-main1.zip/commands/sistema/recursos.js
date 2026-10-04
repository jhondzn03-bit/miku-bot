const os = require('os');

module.exports = {
  command: ['ram', 'cpu', 'recursos', 'stats'],
  description: 'Muestra uso de RAM y CPU en tiempo real',
  categoria: 'sistema',

  run: async (client, m, args, from) => {
    const mem         = process.memoryUsage();
    const totalRam    = os.totalmem();
    const freeRam     = os.freemem();
    const usedRam     = totalRam - freeRam;
    const ramPct      = ((usedRam / totalRam) * 100).toFixed(1);

    const heapPct     = ((mem.heapUsed / mem.heapTotal) * 100).toFixed(1);
    const cpus        = os.cpus();
    const cpuModel    = (cpus[0]?.model || 'Desconocido').slice(0, 40);
    const cores       = cpus.length;
    const load        = os.loadavg().map(x => x.toFixed(2));

    function toMB(b) { return (b / 1024 / 1024).toFixed(1); }
    function toGB(b) { return (b / 1024 / 1024 / 1024).toFixed(2); }

    // Barra de progreso visual
    function bar(pct, len = 15) {
      const filled = Math.round((pct / 100) * len);
      return '█'.repeat(filled) + '░'.repeat(len - filled);
    }

    const text =
`꧁𓇽᭄𑱄꧂ 𝑴𝑰𝑲𝑼 - 𝑩𝑶𝑻 ꧁𓇽᭄𑱄꧂
　ೃ⁀➷ 𝓡𝓮𝓼𝓸𝓾𝓻𝓬𝓮𝓼 𝓢𝓽𝓪𝓽𝓼 ❦

≿━━━━━━━━━━━━━━━━━━━━━≾
╭─ 〘 🧠 𝔐𝔢𝔪𝔬𝔯𝔦𝔞 〙
│
│: ̗̀➛ 💻 *RAM Sistema:*
│  [${bar(parseFloat(ramPct))}] ${ramPct}%
│  _${toGB(usedRam)} / ${toGB(totalRam)} GB_
│
│: ̗̀➛ 🤖 *Heap Node.js:*
│  [${bar(parseFloat(heapPct))}] ${heapPct}%
│  _${toMB(mem.heapUsed)} / ${toMB(mem.heapTotal)} MB_
│
│: ̗̀➛ 📦 *RSS Process:* _${toMB(mem.rss)} MB_
╰────────────────
°❀⋆.ೃ࿔*:･°❀⋆.ೃ࿔*:･
╭─ 〘 ⚙️ 𝔓𝔯𝔬𝔠𝔢𝔰𝔞𝔡𝔬𝔯 〙
│
│: ̗̀➛ 🔧 *CPU:* _${cpuModel}_
│: ̗̀➛ 🔢 *Núcleos:* _${cores}_
│: ̗̀➛ 📊 *Carga (1m/5m/15m):*
│  _${load[0]} / ${load[1]} / ${load[2]}_
│: ̗̀➛ ⏱️ *Uptime OS:* _${Math.floor(os.uptime()/3600)}h ${Math.floor((os.uptime()%3600)/60)}m_
╰────────────────
≾━━━━━━━━━━━━━━━━━━━━━≿

꧁𖬺᭄𑁍꧂ 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽 ✦`;

    await client.sendMessage(from, { text }, { quoted: m });
  },
};
