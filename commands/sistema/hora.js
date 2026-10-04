module.exports = {
  command: ['hora', 'time', 'reloj'],
  description: 'Muestra la hora activa del bot',
  categoria: 'sistema',
  run: async (client, m) => {
    const now = new Date();
    const fecha = new Intl.DateTimeFormat('es-PE', {
      timeZone: 'America/Lima',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    }).format(now);
    const hora = new Intl.DateTimeFormat('es-PE', {
      timeZone: 'America/Lima',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(now);

    const text =
`╔══════════════════════╗
║     *HORA ACTIVA*    ║
╚══════════════════════╝
📅 _${fecha}_
🕒 *${hora}* (America/Lima)`;

    await client.sendMessage(m.key.remoteJid, { text }, { quoted: m });
  },
};
