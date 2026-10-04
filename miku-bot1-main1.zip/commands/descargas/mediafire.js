const { callApi, extractMediaCandidates, extractTitle } = require('./_api');
async function react(client, m, emoji) {
  try {
    await client.sendMessage(m.key.remoteJid, { react: { text: emoji, key: m.key } });
  } catch {}
}

module.exports = {
  command: ['mediafire', 'mf'],
  description: 'Descarga archivos de Mediafire',
  categoria: 'descargas',
  run: async (client, m, args, from, isCreator, ctx = {}) => {
    const link = String(args[0] || '').trim();
    if (!link) {
      await client.sendMessage(from, { text: 'Uso: .mediafire <link>' }, { quoted: m });
      return;
    }

    await react(client, m, '⏳');

    try {
      const result = await callApi(ctx, 'mediafire', { url: link, mode: 'link' });
      const fileName = extractTitle(result, 'archivo');
      const mediaUrls = extractMediaCandidates(result);

      if (!mediaUrls.length) {
        await client.sendMessage(from, { text: 'La API no devolvio enlace de descarga.' }, { quoted: m });
        return;
      }

      let sent = false;
      let lastError = '';
      for (const fileUrl of mediaUrls) {
        try {
          await client.sendMessage(from, {
            document: { url: fileUrl },
            fileName,
            mimetype: 'application/octet-stream',
          }, { quoted: m });
          await react(client, m, '✅');
          sent = true;
          break;
        } catch (e) {
          lastError = String(e?.message || e);
        }
      }

      if (!sent) throw new Error(lastError || 'No pude enviar el archivo de Mediafire.');
    } catch (error) {
      await react(client, m, '❌');
      await client.sendMessage(from, { text: `Error en .mediafire: ${String(error?.message || error)}` }, { quoted: m });
    }
  },
};
