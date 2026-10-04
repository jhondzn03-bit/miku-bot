const { callApi, extractMediaCandidates, extractTitle } = require('./_api');
async function react(client, m, emoji) {
  try {
    await client.sendMessage(m.key.remoteJid, { react: { text: emoji, key: m.key } });
  } catch {}
}

module.exports = {
  command: ['tiktok', 'tt'],
  description: 'Descarga video de TikTok',
  categoria: 'descargas',
  run: async (client, m, args, from, isCreator, ctx = {}) => {
    const link = String(args[0] || '').trim();
    if (!link) {
      await client.sendMessage(from, { text: 'Uso: .tiktok <link>' }, { quoted: m });
      return;
    }

    await react(client, m, '⏳');

    try {
      const result = await callApi(ctx, 'ttdlmp4', { url: link, mode: 'link' });
      const title = extractTitle(result, 'TikTok Video');
      const mediaUrls = extractMediaCandidates(result);

      if (!mediaUrls.length) {
        await client.sendMessage(from, { text: 'La API no devolvio video de TikTok.' }, { quoted: m });
        return;
      }

      let sent = false;
      let lastError = '';
      for (const mediaUrl of mediaUrls) {
        try {
          await client.sendMessage(from, {
            video: { url: mediaUrl },
            caption: `🎬 ${title}`,
          }, { quoted: m });
          await react(client, m, '✅');
          sent = true;
          break;
        } catch (e) {
          lastError = String(e?.message || e);
        }
      }

      if (!sent) throw new Error(lastError || 'No pude enviar el video de TikTok.');
    } catch (error) {
      await react(client, m, '❌');
      await client.sendMessage(from, { text: `Error en .tiktok: ${String(error?.message || error)}` }, { quoted: m });
    }
  },
};
