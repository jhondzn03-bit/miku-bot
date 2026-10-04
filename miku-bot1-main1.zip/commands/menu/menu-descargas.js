const fs = require('fs');
const path = require('path');

module.exports = {
  command: ['menu-descargas', 'descargasmenu', 'mdl'],
  description: 'Muestra solo el menu de descargas',
  categoria: 'menu',

  run: async (client, m, args, from, isCreator, ctx = {}) => {
    const prefix = ctx?.prefix || '.';
    const groups = {};

    if (global.comandos) {
      for (const [, mod] of global.comandos) {
        const cat = String(mod.categoria || 'general').toLowerCase();
        if (cat !== 'descargas') continue;

        const mainCmd = Array.isArray(mod.command) ? mod.command[0] : mod.command;
        if (!mainCmd) continue;

        if (!groups[cat]) groups[cat] = [];
        groups[cat].push({
          cmd: mainCmd,
          desc: mod.description || '',
        });
      }
    }

    const downloads = groups.descargas || [];

    const caption =
`╭━━━〔 𝑴𝑬𝑵𝑼 𝑫𝑬 𝑫𝑬𝑺𝑪𝑨𝑹𝑮𝑨𝑺 〕━━━⬣

┏━━━━━━━━━━━━━━━━━━━━┓
┃ 🎧 *Miku Bot System*
┃ 🌸 Solo comandos de descargas
┃ 🔎 Usa el prefijo: \`${prefix}\`
┗━━━━━━━━━━━━━━━━━━━━┛

${downloads.length ? downloads.map((x) => `• \`${prefix}${x.cmd}\` ${x.desc ? `- _${x.desc}_` : ''}`).join('\n') : 'No hay comandos de descargas registrados.'}

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽`;

    try {
      const imagePath = path.join(process.cwd(), 'videos-imagenes', 'miku-menu.png');
      await client.sendMessage(
        m.key.remoteJid,
        { image: fs.readFileSync(imagePath), caption },
        { quoted: m }
      );
    } catch {
      await client.sendMessage(from, { text: caption }, { quoted: m });
    }
  },
};
