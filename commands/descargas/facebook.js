const { callApi, extractMediaCandidates, extractTitle } = require('./_api');
async function react(client, m, emoji) {
  try {
    await client.sendMessage(m.key.remoteJid, { react: { text: emoji, key: m.key } });
  } catch {}
}

module.exports = {
  command: ['facebook', 'fb'],
  description: 'Descarga video de Facebook',
  categoria: 'descargas',
  run: async (client, m, args, from, isCreator, ctx = {}) => {
    const link = String(args[0] || '').trim();
    if (!link) {
      await client.sendMessage(from, { text: 'Uso: .facebook <link>' }, { quoted: m });
      return;
    }

    await react(client, m, '⏳');

    try {
      const result = await callApi(ctx, 'facebook', { url: link, mode: 'link', quality: 'hd' });
      const title = extractTitle(result, 'Facebook Video');
      const mediaUrls = extractMediaCandidates(result);

      if (!mediaUrls.length) {
        await client.sendMessage(from, { text: 'La API no devolvio video de Facebook.' }, { quoted: m });
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

      if (!sent) throw new Error(lastError || 'No pude enviar el video de Facebook.');
    } catch (error) {
      await react(client, m, '❌');
      await client.sendMessage(from, { text: `Error en .facebook: ${String(error?.message || error)}` }, { quoted: m });
    }
  },
};
