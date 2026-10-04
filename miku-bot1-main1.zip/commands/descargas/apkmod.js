const { callApi, toAbsoluteUrl } = require('./_api');

async function react(client, m, emoji) {
  try {
    await client.sendMessage(m.key.remoteJid, { react: { text: emoji, key: m.key } });
  } catch {}
}

function parseQueryAndPick(raw = '') {
  const text = String(raw || '').trim();
  if (!text) return { query: '', pick: 1 };

  const parts = text.split('|');
  const query = String(parts[0] || '').trim();
  const pickRaw = String(parts[1] || '').trim();
  const pickNum = Number(pickRaw);
  const pick = Number.isFinite(pickNum) && pickNum > 0 ? Math.floor(pickNum) : 1;

  return { query, pick };
}

function getDownloadUrl(result = {}, apiBase = 'https://dv-yer-api.online') {
  const first =
    result?.download_url_full ||
    result?.url ||
    result?.download_url ||
    result?.selected?.download_page_url ||
    result?.results?.[0]?.full_url ||
    result?.results?.[0]?.url ||
    result?.download_links?.[0]?.full_url ||
    result?.download_links?.[0]?.url ||
    '';

  return toAbsoluteUrl(first, apiBase);
}

function getImageUrl(result = {}, apiBase = 'https://dv-yer-api.online') {
  const first =
    result?.image_url_full ||
    result?.image_url ||
    result?.thumbnail ||
    result?.thumb ||
    result?.icon ||
    result?.results?.[0]?.image_url ||
    result?.results?.[0]?.thumbnail ||
    result?.results?.[0]?.icon ||
    result?.selected?.image_url ||
    result?.selected?.thumbnail ||
    '';
  return toAbsoluteUrl(first, apiBase);
}

function extractMetaImage(html = '') {
  const source = String(html || '');
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ];
  for (const p of patterns) {
    const m = source.match(p);
    if (m?.[1]) return m[1].trim();
  }
  return '';
}

function buildCaption(result = {}, query = '') {
  const title = String(result?.title || 'APK MOD').trim();
  const count = Number(result?.count || result?.results?.length || 0);
  const source = String(result?.source || 'dvyer').trim();

  return [
    '📦 *APK MOD encontrado*',
    `🔎 Busqueda: _${query}_`,
    `🎮 Titulo: *${title}*`,
    `🧩 Fuente: _${source}_`,
    `📚 Resultados: *${count}*`,
  ].join('\n');
}

module.exports = {
  command: ['apkmod', 'modapk'],
  description: 'Busca y descarga APK MOD desde tu API',
  categoria: 'descargas',
  run: async (client, m, args, from, isCreator, ctx = {}) => {
    const raw = String(args.join(' ') || '').trim();
    const { query, pick } = parseQueryAndPick(raw);

    if (!query) {
      await client.sendMessage(from, {
        text: 'Uso: .apkmod <nombre app mod> |<numero opcional>\nEj: .apkmod free fire mod |1',
      }, { quoted: m });
      return;
    }

    await react(client, m, '⏳');

    try {
      const result = await callApi(ctx, 'apkmod', { q: query, pick, mode: 'link' });
      const apiBase = String(ctx?.settings?.apiBaseUrl || 'https://dv-yer-api.online');
      const fileUrl = getDownloadUrl(result, apiBase);
      let imageUrl = getImageUrl(result, apiBase);

      if (!fileUrl) {
        await client.sendMessage(from, { text: 'La API no devolvio enlace de descarga.' }, { quoted: m });
        return;
      }

      const title = String(result?.title || 'apk-mod').replace(/[\\/:*?"<>|]/g, '').trim() || 'apk-mod';
      const fileName = `${title}.apk`;
      const caption = buildCaption(result, query);

      if (!imageUrl && ctx?.axios) {
        try {
          const appPageUrl = String(result?.app_url || result?.selected?.app_url || '').trim();
          if (appPageUrl) {
            const page = await ctx.axios.get(appPageUrl, { timeout: 30000 });
            const fromMeta = extractMetaImage(page?.data || '');
            imageUrl = toAbsoluteUrl(fromMeta, appPageUrl);
          }
        } catch {}
      }

      try {
        if (imageUrl) {
          await client.sendMessage(from, {
            image: { url: imageUrl },
            caption,
          }, { quoted: m });
        }
        await client.sendMessage(from, {
          document: { url: fileUrl },
          mimetype: 'application/vnd.android.package-archive',
          fileName,
          caption: imageUrl ? undefined : caption,
        }, { quoted: m });
      } catch {
        await client.sendMessage(from, {
          text: `${caption}\n\n🔗 Descarga directa:\n${fileUrl}`,
        }, { quoted: m });
      }

      await react(client, m, '✅');
    } catch (error) {
      await react(client, m, '❌');
      await client.sendMessage(from, { text: `Error en .apkmod: ${String(error?.message || error)}` }, { quoted: m });
    }
  },
};
