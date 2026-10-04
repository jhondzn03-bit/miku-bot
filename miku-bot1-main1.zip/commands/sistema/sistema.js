const os = require('os');

function fmtUptime(sec = 0) {
  const s = Math.max(0, Math.floor(Number(sec || 0)));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

module.exports = {
  command: ['sistema', 'system', 'estado'],
  description: 'Estado del sistema (sin mostrar IP)',
  categoria: 'sistema',
  run: async (client, m) => {
    const cpus = os.cpus() || [];
    const cpuModel = cpus[0]?.model || 'Desconocido';
    const text =
`╔════════════════════════════╗
║      *ESTADO SISTEMA*      ║
╚════════════════════════════╝
🖥️ OS: *${os.type()} ${os.release()}*
🏗️ Arquitectura: *${os.arch()}*
🧰 CPU: _${cpuModel.slice(0, 46)}_
🧮 Nucleos: *${cpus.length || 0}*
💾 RAM total: *${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB*
📊 Carga: *${os.loadavg().map((x) => x.toFixed(2)).join(' / ')}*
⌛ Uptime server: *${fmtUptime(os.uptime())}*
✅ Privacidad: _IP oculta_`;

    await client.sendMessage(m.key.remoteJid, { text }, { quoted: m });
  },
};
