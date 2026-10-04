'use strict';

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║       TTSEARCH  —  MIKU-BOT  |  FSOCIETY                    ║
 * ║  Busca videos en TikTok usando la API del bot                ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Uso:
 *   .ttsearch <texto>   → busca videos en TikTok
 *   .tts <texto>        → alias corto
 */

const API_BASE = 'https://dv-yer-api.online';
const API_KEY  = 'dvyer911840240197';

async function react(client, m, emoji) {
  try {
    await client.sendMessage(m.key.remoteJid, { react: { text: emoji, key: m.key } });
  } catch {}
}

function clipText(value = '', max = 72) {
  const clean = String(value || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, Math.max(1, max - 3))}...`;
}

function compactNumber(value = 0) {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n <= 0) return '0';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(Math.floor(n));
}

function formatDuration(seconds = 0) {
  const s = Number(seconds || 0);
  if (!s || s <= 0) return 'N/D';
  if (s < 60) return `${Math.floor(s)}s`;
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return r > 0 ? `${m}m ${r}s` : `${m}m`;
}

function buildTikTokUrl(item = {}) {
  const explicit = String(item?.url || item?.publicUrl || item?.share_url || '').trim();
  if (/^https?:\/\/(?:www\.)?(?:m\.)?tiktok\.com\//i.test(explicit)) return explicit;
  const author = String(item?.author || item?.author_name || '').replace(/^@/, '').trim();
  const id     = String(item?.id || item?.video_id || '').trim();
  if (author && id) return `https://www.tiktok.com/@${author}/video/${id}`;
  return String(item?.play || item?.download || '').trim() || '';
}

// Intenta varios formatos de respuesta que puede devolver la API
function extractResults(data = {}) {
  // Puede venir como array directo, o dentro de distintas claves
  const candidates = [
    data,
    data?.result,
    data?.data,
    data?.results,
    data?.videos,
    data?.items,
    data?.list,
  ];

  for (const c of candidates) {
    if (Array.isArray(c) && c.length > 0) return c;
  }
  return [];
}

module.exports = {
  command: ['ttsearch', 'tiktoksearch', 'ttksearch', 'tts'],
  description: 'Busca videos en TikTok',
  categoria: 'descargas',

  run: async (client, m, args, from, isCreator, ctx = {}) => {
    const axios  = ctx?.axios;
    const prefix = ctx?.prefix || String(ctx?.settings?.prefix || '.').trim();
    const query  = args.join(' ').trim();

    if (!axios) {
      return client.sendMessage(from, {
        text: '❌ Axios no disponible en el contexto.'
      }, { quoted: m });
    }

    // ── Sin query ─────────────────────────────────────────────────────────────
    if (!query) {
      return client.sendMessage(from, {
        text:
`╭━━━〔 🎵 TIKTOK SEARCH 〕━━━⬣

🌸 *Busca videos de TikTok*

📌 *Uso:*
│: ̗̀➛ \`${prefix}ttsearch <texto>\`
│: ̗̀➛ \`${prefix}tts edit anime\`

💡 Luego usa el comando que aparece
   en cada resultado para descargarlo.

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽`
      }, { quoted: m });
    }

    await react(client, m, '🔍');

    try {
      // ── Llamar a la API — probar endpoints uno por uno ────────────────────
      let results = [];
      const endpoints = [
        { url: `${API_BASE}/ttsearch`,       params: { q: query, limit: 5, apikey: API_KEY } },
        { url: `${API_BASE}/tiktoksearch`,   params: { q: query, limit: 5, apikey: API_KEY } },
        { url: `${API_BASE}/ttksearch`,      params: { q: query, limit: 5, apikey: API_KEY } },
        { url: `${API_BASE}/tiktokvideo`,    params: { query,   limit: 5, apikey: API_KEY } },
        { url: `${API_BASE}/tiktok/search`,  params: { q: query, limit: 5, apikey: API_KEY } },
      ];

      let lastError = '';
      for (const ep of endpoints) {
        try {
          const res = await axios.get(ep.url, { params: ep.params, timeout: 20000 });
          results = extractResults(res?.data || {});
          if (results.length > 0) break;
        } catch (e) {
          lastError = String(e?.message || e);
        }
      }

      // ── Sin resultados ────────────────────────────────────────────────────
      if (!results.length) {
        await react(client, m, '❌');
        return client.sendMessage(from, {
          text:
`╭━━━〔 🎵 TIKTOK SEARCH 〕━━━⬣

😔 *Sin resultados*

No encontré videos para:
*"${clipText(query, 60)}"*

💡 Es posible que la API del bot no tenga
   habilitado el endpoint de búsqueda TikTok.
   Contacta al dueño de la API.

${lastError ? `🔧 Error: \`${clipText(lastError, 80)}\`` : ''}

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽`
        }, { quoted: m });
      }

      // ── Guardar resultados en global para poder descargar por número ───────
      global.ttResults = global.ttResults || {};
      global.ttResults[from] = results.slice(0, 5);

      // ── Construir mensaje ─────────────────────────────────────────────────
      const nums = ['①', '②', '③', '④', '⑤'];

      let text =
`꧁༒✦ 𝑴𝑰𝑲𝑼 - 𝑻𝑰𝑲𝑻𝑶𝑲 𝑺𝑬𝑨𝑹𝑪𝑯 ✦༒꧂
　ೃ⁀➷ 𝓗𝓪𝓽𝓼𝓾𝓷𝓮 𝓜𝓲𝓴𝓾 ❦￤
꧁༒✦━━━━━━━━━━━━✦༒꧂

🔍 *Búsqueda:* ${clipText(query, 50)}
📊 *Resultados:* ${results.slice(0, 5).length} videos

`;

      results.slice(0, 5).forEach((item, i) => {
        const title    = clipText(item?.title || item?.desc || item?.description || 'Sin título', 70);
        const author   = String(item?.author || item?.author_name || item?.nickname || 'usuario').replace(/^@/, '');
        const likes    = compactNumber(item?.digg_count    || item?.stats?.likes    || item?.like_count    || 0);
        const views    = compactNumber(item?.play_count    || item?.stats?.views    || item?.view_count    || 0);
        const comments = compactNumber(item?.comment_count || item?.stats?.comments || 0);
        const duration = formatDuration(item?.duration     || item?.durationSeconds || 0);
        const url      = buildTikTokUrl(item);
        const cmd      = url ? `${prefix}tiktok ${url}` : `${prefix}tiktok`;

        text +=
`⊹₊⟡⋆。°✩⟡₊⊹
${nums[i] || `${i + 1}.`} *${title}*
│: ̗̀➛ 👤 @${author}
│: ̗̀➛ ⏱️ ${duration}  ❤️ ${likes}  👁️ ${views}  💬 ${comments}
│: ̗̀➛ 📥 \`${cmd}\`

`;
      });

      text +=
`≿━━━━━━━━━━━━━━━━━━━━━≾
💡 Copia el comando de cada video
   y envíalo para descargarlo.
꧁❦•── 💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽 ──•❦꧂`;

      // Intentar enviar con miniatura del primer resultado
      const cover = String(results[0]?.cover || results[0]?.thumbnail || results[0]?.origin_cover || '').trim();

      if (cover) {
        try {
          await client.sendMessage(from, {
            image: { url: cover },
            caption: text,
          }, { quoted: m });
        } catch {
          await client.sendMessage(from, { text }, { quoted: m });
        }
      } else {
        await client.sendMessage(from, { text }, { quoted: m });
      }

      await react(client, m, '✅');

    } catch (e) {
      await react(client, m, '❌');
      await client.sendMessage(from, {
        text:
`╭━━━〔 🎵 TIKTOK SEARCH — ERROR 〕━━━⬣

❌ *No se pudo buscar*

\`${String(e?.message || e).slice(0, 150)}\`

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽`
      }, { quoted: m });
    }
  },
};
