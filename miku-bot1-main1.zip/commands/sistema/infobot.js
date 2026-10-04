function fmtUptime(sec = 0) {
  const s = Math.max(0, Math.floor(Number(sec || 0)));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = [];
  if (d) r.push(`${d}d`);
  if (h || d) r.push(`${h}h`);
  r.push(`${m}m`);
  return r.join(' ');
}

function fmtMB(bytes = 0) {
  return `${(Number(bytes || 0) / 1024 / 1024).toFixed(1)} MB`;
}

module.exports = {
  command: ['infobot', 'botinfo', 'info'],
  description: 'Muestra informacion general del bot',
  categoria: 'sistema',

  run: async (client, m, args, from, isCreator, ctx = {}) => {

    const settings = ctx?.settings || {};
    const owner = Array.isArray(settings.ownerNumber)
      ? settings.ownerNumber.join(', ')
      : String(settings.ownerNumber || '393209533090');
    const mem = process.memoryUsage();

    const text =
`꧁༒✦ 𝑴𝑰𝑲𝑼 - 𝑩𝑶𝑻 ✦༒꧂
　ೃ⁀➷ 𝓗𝓪𝓽𝓼𝓾𝓷𝓮 𝓜𝓲𝓴𝓾 ❦￤
꧁༒✦━━━━━━━━━━━━✦༒꧂

⌕ ⟡ _Vocaloid Music System_ ⟡

≿━━━━━━━━━━━━━━━━━━━━━≾
╭─ 〘 🤖 𝔅𝔬𝔱 𝔍𝔫𝔣𝔬 〙
│
│ ɪɴꜰᴏ ɢᴇɴᴇʀᴀʟ
│: ̗̀➛ 🤖 *ɴᴏᴍʙʀᴇ:* _Hatsune Miku Bot_
│: ̗̀➛ 👑 *ᴏᴡɴᴇʀ:* _${owner}_
│: ̗̀➛ 🧷 *ᴘʀᴇꜰɪᴊᴏ:* \`${settings.prefix || '.'}\`
╰────────────────
≾━━━━━━━━━━━━━━━━━━━━━≿

✦•┈┈┈┈┈┈┈┈┈┈┈┈┈┈•✦
╭─ 〘 ⚙️ 𝔖𝔦𝔰𝔱𝔢𝔪𝔞 〙
│
│ ꜱᴛᴀᴛᴜꜱ & ʀᴇꜱᴏᴜʀᴄᴇꜱ
│: ̗̀➛ ⏱️ *ᴜᴘᴛɪᴍᴇ:* _${fmtUptime(process.uptime())}_
│: ̗̀➛ 🧠 *ʀᴀᴍ:* _${fmtMB(mem.rss)}_
│: ̗̀➛ ⚙️ *ɴᴏᴅᴇ:* _${process.version}_
╰────────────────
✦•┈┈┈┈┈┈┈┈┈┈┈┈┈┈•✦

꧁❦•── 🌸 𝓜𝓲𝓴𝓾 𝓟𝓵𝓪𝔂𝓮𝓻 ──•❦꧂`;

    await client.sendMessage(from, { text }, { quoted: m });
  },
};
