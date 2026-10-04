const speedTest = require('speedtest-net');

function toMbps(bytesPerSecond = 0) {
  return (Number(bytesPerSecond || 0) * 8) / 1e6;
}

function fmt(n = 0, d = 2) {
  return Number(n || 0).toFixed(d);
}

module.exports = {
  command: ['speed', 'velocidad', 'ping', 'internet', 'conexion'],
  description: 'Mide ping y velocidad real del servidor (Speedtest)',
  categoria: 'sistema',

  run: async (client, m, args, from, isCreator, ctx = {}) => {

    await client.sendMessage(from, {
      text:
`꧁༒✦ 𝑴𝑰𝑲𝑼 - 𝑩𝑶𝑻 ✦༒꧂
⋆｡‧˚ʚ🌸ɞ˚‧｡⋆ _Ejecutando speedtest..._ ⋆｡‧˚ʚ🌸ɞ˚‧｡⋆`
    }, { quoted: m });

    try {

      const started = Date.now();
      const result = await speedTest({
        acceptLicense: true,
        acceptGdpr: true,
        timeout: 30000,
      });
      const elapsed = Date.now() - started;

      const pingMs      = Number(result?.ping?.latency || 0);
      const jitterMs    = Number(result?.ping?.jitter || 0);
      const downloadMbps = toMbps(result?.download?.bandwidth || 0);
      const uploadMbps   = toMbps(result?.upload?.bandwidth || 0);
      const packetLoss   = result?.packetLoss == null ? 'N/A' : `${fmt(result.packetLoss, 2)}%`;

      const mem         = process.memoryUsage();
      const rssMb       = mem.rss / 1024 / 1024;
      const heapUsedMb  = mem.heapUsed / 1024 / 1024;
      const heapTotalMb = mem.heapTotal / 1024 / 1024;

      const text =
`꧁༒✦ 𝑴𝑰𝑲𝑼 - 𝑩𝑶𝑻 ✦༒꧂
　ೃ⁀➷ 𝓗𝓪𝓽𝓼𝓾𝓷𝓮 𝓜𝓲𝓴𝓾 ❦￤
꧁༒✦━━━━━━━━━━━━✦༒꧂

≿━━━━━━━━━━━━━━━━━━━━━≾
╭─ 〘 📶 𝔖𝔭𝔢𝔢𝔡𝔱𝔢𝔰𝔱 〙
│
│ ɴᴇᴛᴡᴏʀᴋ ꜱᴛᴀᴛᴜꜱ
│: ̗̀➛ 📶 *ᴘɪɴɢ:* _${fmt(pingMs)} ms_
│: ̗̀➛ 〰️ *ᴊɪᴛᴛᴇʀ:* _${fmt(jitterMs)} ms_
│: ̗̀➛ 📥 *ᴅᴏᴡɴʟᴏᴀᴅ:* _${fmt(downloadMbps)} Mbps_
│: ̗̀➛ 📤 *ᴜᴘʟᴏᴀᴅ:* _${fmt(uploadMbps)} Mbps_
│: ̗̀➛ 📦 *ᴘᴀᴄᴋᴇᴛ ʟᴏꜱꜱ:* _${packetLoss}_
│: ̗̀➛ ⚙️ *ᴛɪᴇᴍᴘᴏ:* _${fmt(elapsed / 1000)} s_
╰────────────────
≾━━━━━━━━━━━━━━━━━━━━━≿

°❀⋆.ೃ࿔*:･°❀⋆.ೃ࿔*:･°❀⋆.ೃ
╭─ 〘 🧠 𝔐𝔢𝔪𝔬𝔯𝔦𝔞 〙
│
│ ʀᴇꜱᴏᴜʀᴄᴇꜱ ᴜꜱᴀɢᴇ
│: ̗̀➛ 🧠 *ʀᴀᴍ (ʀꜱꜱ):* _${fmt(rssMb)} MB_
│: ̗̀➛ 🗂️ *ʜᴇᴀᴘ:* _${fmt(heapUsedMb)} / ${fmt(heapTotalMb)} MB_
╰────────────────
°❀⋆.ೃ࿔*:･°❀⋆.ೃ࿔*:･°❀⋆.ೃ

꧁❦•── 🌸 𝓜𝓲𝓴𝓾 𝓟𝓵𝓪𝔂𝓮𝓻 ──•❦꧂`;

      await client.sendMessage(from, { text }, { quoted: m });

    } catch (error) {

      await client.sendMessage(from, {
        text:
`⊹₊⟡⋆。°✩⟡₊⊹
❌ *Error en* \`.speed\`
╰┈➤ ${String(error?.message || error)}

│: ̗̀➛ _Verifica la conexión del servidor_
│: ̗̀➛ _Vuelve a intentar en 20s_
⊹₊⟡⋆。°✩⟡₊⊹`
      }, { quoted: m });
    }
  },
};