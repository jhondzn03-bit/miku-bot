const fs = require('fs');
const os = require('os');
const path = require('path');
const { pipeline } = require('stream/promises');
const { callApi, extractMediaCandidates, extractTitle } = require('./_api');

const MAX_DOWNLOAD_BYTES = 95 * 1024 * 1024;
const MAX_VIDEO_INLINE_BYTES = 18 * 1024 * 1024;
const MIN_VALID_VIDEO_BYTES = 1 * 1024 * 1024;

// ═══════════════════════════════════════════════════════════════════════════════
//  DECORADORES Y CARACTERES ESPECIALES COMPATIBLES CON WHATSAPP
// ═══════════════════════════════════════════════════════════════════════════════

const DECORATORS = {
  line: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  lineThin: '─────────────────────────────',
  corner: '❤︎',
  arrow: '➤',
  bullet: '❀',
  star: '✦',
  check: '✓',
  cross: '✕',
  heart: '♡',
  diamond: '◆',
  circle: '●',
  square: '■',
  triangle: '▲',
  wave: '≈',
  flower: '❁',
  sun: '☀',
  moon: '☾',
  sparkle: '✨',
};

function header(title = '') {
  return `\n╔${DECORATORS.line}╗\n║ ${DECORATORS.star} ${String(title).padEnd(28)} ${DECORATORS.star} ║\n╚${DECORATORS.line}╝\n`;
}

function section(title = '') {
  return `\n${DECORATORS.bullet} ❭❭ *${title}*\n`;
}

function decorline() {
  return `${DECORATORS.wave}${DECORATORS.wave}${DECORATORS.wave}${DECORATORS.wave}${DECORATORS.wave}${DECORATORS.wave}${DECORATORS.wave}${DECORATORS.wave}${DECORATORS.wave}${DECORATORS.wave}\n`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  FUNCIONES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════════

async function react(client, m, emoji) {
  try {
    await client.sendMessage(m.key.remoteJid, { react: { text: emoji, key: m.key } });
  } catch {}
}

function shortText(text = '', max = 55) {
  const t = String(text || '').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}...`;
}

function bytesToHuman(bytes = 0) {
  const n = Number(bytes || 0);
  if (!Number.isFinite(n) || n <= 0) return 'desconocido';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = n;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  return `${value.toFixed(idx === 0 ? 0 : 2)} ${units[idx]}`;
}

function normalizeSlug(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function animeSlugFromEpisodeUrl(url = '') {
  const raw = String(url || '').trim();
  const ver = raw.split('/ver/')[1] || '';
  const slugEp = normalizeSlug(ver);
  if (!slugEp) return '';
  return slugEp.replace(/-\d+$/, '');
}

function pickLanguage(streams = {}, preferred = 'SUB') {
  const normalized = String(preferred || 'AUTO').trim().toUpperCase();
  if (Array.isArray(streams[normalized]) && streams[normalized].length) return normalized;
  if (Array.isArray(streams.LAT) && streams.LAT.length) return 'LAT';
  if (Array.isArray(streams.SUB) && streams.SUB.length) return 'SUB';
  const keys = Object.keys(streams || {});
  return keys.find((k) => Array.isArray(streams[k]) && streams[k].length) || '';
}

function normalizeLanguageLabel(value = '') {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return 'AUTO';
  if (raw.includes('lat')) return 'LAT';
  if (raw.includes('sub')) return 'SUB';
  return 'AUTO';
}

async function getRemoteSize(axios, url) {
  try {
    const head = await axios.head(url, { timeout: 20000, maxRedirects: 5 });
    const len = Number(head?.headers?.['content-length'] || 0);
    if (Number.isFinite(len) && len > 0) return len;
  } catch {}
  try {
    const streamResp = await axios.get(url, { responseType: 'stream', timeout: 30000, maxRedirects: 5 });
    const len = Number(streamResp?.headers?.['content-length'] || 0);
    try { streamResp?.data?.destroy?.(); } catch {}
    if (Number.isFinite(len) && len > 0) return len;
  } catch {}
  return 0;
}

async function downloadToTempFile(axios, url, fileName = 'anime.mp4') {
  const safe = String(fileName || 'anime.mp4').replace(/[\\/:*?"<>|]+/g, '_');
  const tmpPath = path.join(os.tmpdir(), `${Date.now()}-${safe}`);
  const writer = fs.createWriteStream(tmpPath);
  const response = await axios.get(url, {
    responseType: 'stream',
    timeout: 120000,
    maxRedirects: 5,
  });
  await pipeline(response.data, writer);
  const stats = await fs.promises.stat(tmpPath);
  const contentType = String(response?.headers?.['content-type'] || '').toLowerCase();
  const finalUrl = String(response?.request?.res?.responseUrl || response?.config?.url || url || '').trim();
  return {
    tmpPath,
    sizeBytes: Number(stats.size || 0),
    contentType,
    finalUrl,
  };
}

async function looksLikeNonVideoPayload(filePath = '') {
  try {
    const fd = await fs.promises.open(filePath, 'r');
    try {
      const sample = Buffer.alloc(4096);
      const { bytesRead } = await fd.read(sample, 0, sample.length, 0);
      const head = sample.subarray(0, bytesRead).toString('utf8').trim().toLowerCase();
      if (!head) return true;
      if (head.startsWith('#extm3u')) return true;
      if (head.startsWith('<!doctype html') || head.startsWith('<html') || head.includes('<head') || head.includes('<body')) return true;
      if (head.startsWith('{') || head.startsWith('{"') || head.startsWith('[')) return true;
      return false;
    } finally {
      await fd.close();
    }
  } catch {
    return true;
  }
}

function parseAnimeDl(raw = '') {
  const parts = String(raw || '').split('|').map((p) => String(p || '').trim());
  return {
    slug: normalizeSlug(parts[0] || ''),
    episode: Number.parseInt(parts[1] || '', 10),
    lang: String(parts[2] || 'AUTO').trim().toUpperCase() || 'AUTO',
  };
}

function parseAnimeEp(raw = '') {
  const parts = String(raw || '').split('|').map((p) => String(p || '').trim());
  const slug = normalizeSlug(parts[0] || '');
  const page = Number.parseInt(parts[1] || '1', 10);
  return {
    slug,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

function parseAnimeSelect(raw = '') {
  const parts = String(raw || '').split('|').map((p) => String(p || '').trim());
  return {
    slug: normalizeSlug(parts[0] || ''),
    title: String(parts[1] || '').trim(),
  };
}

function sortSeasonResults(results = [], preferredSlug = '') {
  const wanted = normalizeSlug(preferredSlug);
  return results
    .slice()
    .sort((a, b) => {
      const slugA = normalizeSlug(a?.anime_url?.split('/anime/')[1] || a?.title || '');
      const slugB = normalizeSlug(b?.anime_url?.split('/anime/')[1] || b?.title || '');
      if (slugA === wanted && slugB !== wanted) return -1;
      if (slugB === wanted && slugA !== wanted) return 1;
      const titleA = String(a?.title || '').toLowerCase();
      const titleB = String(b?.title || '').toLowerCase();
      return titleA.localeCompare(titleB, 'es');
    });
}

async function fetchEpisodeLanguageMap(ctx = {}, slug = '', episodes = []) {
  const items = Array.isArray(episodes) ? episodes : [];
  const checks = await Promise.all(
    items.map(async (ep) => {
      const episodeNumber = Number(ep?.episode || 0);
      if (!episodeNumber) return [episodeNumber, 'AUTO'];
      try {
        const payload = await callApi(ctx, `animeflv/episode/${encodeURIComponent(`${slug}-${episodeNumber}`)}`);
        const result = payload?.result || payload || {};
        const preferred = String(result?.best_download_language || '').trim();
        if (preferred) return [episodeNumber, normalizeLanguageLabel(preferred)];
        const streamEntries = Array.isArray(result?.streams) ? result.streams : [];
        if (streamEntries.length) {
          return [episodeNumber, normalizeLanguageLabel(streamEntries[0]?.language_group || streamEntries[0]?.language || '')];
        }
        const streamsLegacy = result?.streams || {};
        return [episodeNumber, pickLanguage(streamsLegacy, 'AUTO') || 'AUTO'];
      } catch {
        return [episodeNumber, 'AUTO'];
      }
    })
  );
  return new Map(checks);
}

async function resolveMegaCandidate(ctx = {}, url = '') {
  const raw = String(url || '').trim();
  if (!/mega\.nz/i.test(raw)) return [];
  try {
    const result = await callApi(ctx, 'mega', { url: raw, mode: 'link' });
    const candidates = extractMediaCandidates(result).filter(Boolean);
    return candidates.map((item) => ({
      url: item,
      source: 'mega_api',
      server: 'MEGA',
    }));
  } catch {
    return [];
  }
}

async function normalizeCandidatesThroughMegaApi(ctx = {}, candidates = []) {
  const normalized = [];
  for (const candidate of candidates) {
    const url = String(candidate?.url || '').trim();
    if (!url) continue;
    if (/mega\.nz/i.test(url)) {
      const resolved = await resolveMegaCandidate(ctx, url);
      if (resolved.length) {
        normalized.push(...resolved);
      } else {
        normalized.push(candidate);
      }
      continue;
    }
    normalized.push(candidate);
  }
  return dedupeCandidates(normalized);
}

function buildServerCandidates(streamList = [], downloads = []) {
  const out = [];
  for (const entry of Array.isArray(streamList) ? streamList : []) {
    const downloadUrl = String(entry?.download_url || '').trim();
    const embedUrl = String(entry?.embed_url || '').trim();
    if (downloadUrl) {
      out.push({
        url: downloadUrl,
        source: 'stream_download',
        server: String(entry?.title || entry?.server || 'desconocido'),
      });
    } else if (embedUrl) {
      out.push({
        url: embedUrl,
        source: 'stream_embed',
        server: String(entry?.title || entry?.server || 'desconocido'),
      });
    }
  }
  for (const d of Array.isArray(downloads) ? downloads : []) {
    const url = String(d?.url || '').trim();
    if (!url) continue;
    out.push({
      url,
      source: 'download_table',
      server: String(d?.server || 'desconocido'),
    });
  }
  return out;
}

function buildMegaCandidatesFromEpisodePayload(episodePayload = {}) {
  const result = episodePayload && typeof episodePayload === 'object' ? episodePayload : {};
  const merged = [];

  const pushEntry = (entry, source = 'mega') => {
    const url = String(entry?.url || entry?.download_url || '').trim();
    if (!url || !/mega\.(nz|co\.nz)/i.test(url)) return;
    merged.push({
      url,
      source,
      server: String(entry?.server || 'MEGA').trim() || 'MEGA',
      language: normalizeLanguageLabel(entry?.language_group || entry?.language || ''),
    });
  };

  const megaDownloads = Array.isArray(result?.mega_downloads) ? result.mega_downloads : [];
  for (const item of megaDownloads) pushEntry(item, String(item?.source || 'mega_downloads'));

  const downloads = Array.isArray(result?.downloads) ? result.downloads : [];
  for (const item of downloads) pushEntry(item, 'downloads');

  const streams = Array.isArray(result?.streams) ? result.streams : [];
  for (const item of streams) pushEntry(item, 'streams');

  const best = String(result?.best_download_url || '').trim();
  if (best && /mega\.(nz|co\.nz)/i.test(best)) {
    merged.unshift({
      url: best,
      source: 'api_best',
      server: String(result?.best_download_server || 'MEGA').trim() || 'MEGA',
      language: normalizeLanguageLabel(result?.best_download_language || ''),
    });
  }

  return dedupeCandidates(merged);
}

function dedupeCandidates(candidates = []) {
  const seen = new Set();
  const out = [];
  for (const item of candidates) {
    const url = String(item?.url || '').trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push(item);
  }
  return out;
}

async function canDownloadCandidate(axios, candidate) {
  const url = String(candidate?.url || '').trim();
  if (!url) return false;
  try {
    const head = await axios.head(url, {
      timeout: 12000,
      maxRedirects: 5,
      validateStatus: () => true,
    });
    if (head?.status >= 200 && head?.status < 400) return true;
  } catch {}
  try {
    const resp = await axios.get(url, {
      responseType: 'stream',
      timeout: 18000,
      maxRedirects: 5,
      validateStatus: () => true,
    });
    const ok = resp?.status >= 200 && resp?.status < 400;
    try { resp?.data?.destroy?.(); } catch {}
    return ok;
  } catch {}
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MÓDULO PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  command: ['anime', 'animeflv', 'animesel', 'animeep', 'animedl'],
  description: '🎬 Descargador de anime con búsqueda y menús textuales',
  categoria: 'descargas',
  run: async (client, m, args, from, isCreator, ctx = {}) => {
    const prefix = ctx?.prefix || '.';
    const axios = ctx?.axios;
    const cmdUsed = String(ctx?.commandName || 'anime').trim().toLowerCase();
    const query = String(args.join(' ') || '').trim();

    if (!axios) {
      await client.sendMessage(from, { text: '❌ Axios no disponible en contexto.' }, { quoted: m });
      return;
    }

    await react(client, m, '⏳');

    try {
      if (cmdUsed === 'anime') {
        let list = [];
        let title = 'Top Anime (Recientes)';

        if (query) {
          const search = await callApi(ctx, 'animeflv/search', { q: query, limit: 20 });
          list = Array.isArray(search?.results) ? search.results : [];
          title = `Resultados: "${query}"`;
        } else {
          const latest = await callApi(ctx, 'animeflv/latest', { limit: 30 });
          const rows = Array.isArray(latest?.results) ? latest.results : [];
          const seen = new Set();
          for (const item of rows) {
            const slug = animeSlugFromEpisodeUrl(item?.episode_url || '');
            if (!slug || seen.has(slug)) continue;
            seen.add(slug);
            list.push({
              title: String(item?.title || slug),
              anime_slug: slug,
              episode_label: item?.episode_label || '',
            });
            if (list.length >= 15) break;
          }
        }

        if (!list.length) {
          await client.sendMessage(from, { text: '❌ No encontré animes para mostrar.' }, { quoted: m });
          await react(client, m, '⚠️');
          return;
        }

        let msg = header(title);
        msg += section('Animes Disponibles');
        
        for (let i = 0; i < list.length; i++) {
          const item = list[i];
          const slug = normalizeSlug(item?.anime_slug || item?.title || '');
          const ep = shortText(item?.episode_label || 'Reciente', 20);
          msg += `${String(i + 1).padStart(2, '0')}. *${shortText(item?.title || slug, 45)}*\n    ${DECORATORS.arrow} ${ep}\n`;
        }

        msg += section('Comandos');
        msg += `${DECORATORS.bullet} Para ver temporadas:\n`;
        msg += `${DECORATORS.arrow} *${prefix}animesel <slug>*\n\n`;
        msg += `${DECORATORS.bullet} O busca un anime:\n`;
        msg += `${DECORATORS.arrow} *${prefix}anime <nombre>*\n`;

        msg += `\n${decorline()}`;

        await client.sendMessage(from, { text: msg }, { quoted: m });
        await react(client, m, '✅');
        return;
      }

      if (cmdUsed === 'animesel') {
        const sel = parseAnimeSelect(query);
        if (!sel.slug) {
          await client.sendMessage(from, { text: `❌ Uso: *${prefix}animesel <slug>*` }, { quoted: m });
          await react(client, m, '⚠️');
          return;
        }

        const decodedTitle = decodeURIComponent(sel.title || '').trim();
        const baseTitle = decodedTitle
          .replace(/\b(temporada|season|s)\s*\d+\b/gi, '')
          .replace(/\d{1,2}(st|nd|rd|th)\s*season/gi, '')
          .trim() || decodedTitle || sel.slug.replace(/-/g, ' ');

        const seasonSearch = await callApi(ctx, 'animeflv/search', { q: baseTitle, limit: 30 });
        const results = sortSeasonResults(Array.isArray(seasonSearch?.results) ? seasonSearch.results : [], sel.slug);

        const seasonRows = [];
        const seen = new Set();
        for (const item of results) {
          const itemSlug = normalizeSlug(item?.anime_url?.split('/anime/')[1] || item?.title || '');
          if (!itemSlug || seen.has(itemSlug)) continue;
          seen.add(itemSlug);
          seasonRows.push({
            slug: itemSlug,
            title: shortText(item?.title || itemSlug, 58),
          });
        }

        if (!seasonRows.length) {
          await client.sendMessage(from, { text: '❌ No encontré temporadas para ese anime.' }, { quoted: m });
          await react(client, m, '⚠️');
          return;
        }

        let msg = header('Temporadas Encontradas');
        
        for (let i = 0; i < seasonRows.length; i++) {
          const item = seasonRows[i];
          msg += `${String(i + 1).padStart(2, '0')}. *${item.title}*\n`;
        }

        msg += section('Para Ver Episodios');
        msg += `${DECORATORS.arrow} *${prefix}animeep <slug>*\n`;
        msg += `\n${decorline()}`;

        await client.sendMessage(from, { text: msg }, { quoted: m });
        await react(client, m, '✅');
        return;
      }

      if (cmdUsed === 'animeep') {
        const parsedEp = parseAnimeEp(query);
        const slug = parsedEp.slug;
        const page = parsedEp.page;
        
        if (!slug) {
          await client.sendMessage(from, { text: `❌ Uso: *${prefix}animeep <slug>*` }, { quoted: m });
          await react(client, m, '⚠️');
          return;
        }

        const detail = await callApi(ctx, `animeflv/anime/${encodeURIComponent(slug)}`, { episode_limit: 3000 });
        const payload = detail?.result || detail || {};
        const episodes = Array.isArray(payload?.episodes) ? payload.episodes : [];
        const animeTitle = String(payload?.title || slug).trim();

        if (!episodes.length) throw new Error('No hay episodios para ese anime.');

        const ordered = episodes.slice().sort((a, b) => Number(b?.episode || 0) - Number(a?.episode || 0));
        const pageSize = 15;
        const totalPages = Math.max(1, Math.ceil(ordered.length / pageSize));
        const safePage = Math.min(Math.max(page, 1), totalPages);
        const start = (safePage - 1) * pageSize;
        const chunk = ordered.slice(start, start + pageSize);
        const languageMap = await fetchEpisodeLanguageMap(ctx, slug, chunk);

        let msg = header(`${animeTitle} (${safePage}/${totalPages})`);
        msg += section('Episodios Disponibles');

        for (const ep of chunk) {
          const lang = languageMap.get(Number(ep.episode || 0)) === 'LAT' ? '🌎 LAT' : '📖 SUB';
          msg += `${String(ep.episode).padStart(3, '0')}. *Episodio ${ep.episode}* ${lang}\n`;
          msg += `     ${DECORATORS.arrow} ${prefix}animedl ${slug}|${ep.episode}|AUTO\n`;
        }

        if (safePage > 1 || safePage < totalPages) {
          msg += section('Navegación');
          if (safePage > 1) {
            msg += `${DECORATORS.arrow} ${prefix}animeep ${slug}|${safePage - 1}\n`;
          }
          if (safePage < totalPages) {
            msg += `${DECORATORS.arrow} ${prefix}animeep ${slug}|${safePage + 1}\n`;
          }
        }

        msg += `\n${decorline()}`;

        await client.sendMessage(from, { text: msg }, { quoted: m });
        await react(client, m, '✅');
        return;
      }

      if (cmdUsed === 'animedl') {
        const parsed = parseAnimeDl(query);
        if (!parsed.slug || !Number.isFinite(parsed.episode) || parsed.episode <= 0) {
          await client.sendMessage(from, { text: `❌ Uso: *${prefix}animedl <slug>|<episodio>|<idioma>*` }, { quoted: m });
          await react(client, m, '⚠️');
          return;
        }

        const episodeSlug = `${parsed.slug}-${parsed.episode}`;
        const episodeData = await callApi(ctx, `animeflv/episode/${encodeURIComponent(episodeSlug)}`);
        const episodePayload = episodeData?.result || episodeData || {};
        const apiBestUrl = String(episodePayload?.best_download_url || '').trim();
        const apiBestLang = normalizeLanguageLabel(String(episodePayload?.best_download_language || '').trim());
        const apiBestServer = String(episodePayload?.best_download_server || '').trim();
        const selectedLang = apiBestLang !== 'AUTO' ? apiBestLang : normalizeLanguageLabel(parsed.lang);

        let candidates = buildMegaCandidatesFromEpisodePayload(episodePayload);
        if (!candidates.length) {
          const streamsLegacy = episodePayload?.streams || {};
          const downloadsLegacy = Array.isArray(episodePayload?.downloads) ? episodePayload.downloads : [];
          const streamListLegacy = selectedLang && !Array.isArray(streamsLegacy) ? streamsLegacy[selectedLang] : [];
          candidates = buildServerCandidates(streamListLegacy, downloadsLegacy)
            .filter((item) => /mega\.(nz|co\.nz)/i.test(String(item?.url || '')));
          if (apiBestUrl && /mega\.(nz|co\.nz)/i.test(apiBestUrl)) {
            candidates.unshift({
              url: apiBestUrl,
              source: 'api_best',
              server: apiBestServer || 'MEGA',
              language: selectedLang,
            });
          }
        }

        if (!candidates.length) throw new Error('No hay enlaces para descargar ese episodio.');
        candidates = await normalizeCandidatesThroughMegaApi(ctx, candidates);
        if (!candidates.length) {
          throw new Error('No pude convertir enlaces MEGA a descarga directa.');
        }

        let statusMsg = `${DECORATORS.star} Revisando servidores del episodio *${parsed.episode}*\n`;
        statusMsg += `${DECORATORS.bullet} Idioma: *${selectedLang || 'AUTO'}*\n`;
        statusMsg += `${DECORATORS.bullet} Encontrados: *${candidates.length}* enlaces\n`;

        await client.sendMessage(from, { text: statusMsg }, { quoted: m });

        const workingCandidates = [];
        for (const candidate of candidates) {
          if (await canDownloadCandidate(axios, candidate)) {
            workingCandidates.push(candidate);
          }
        }
        const finalCandidates = workingCandidates.length ? workingCandidates : candidates;

        let sent = false;
        let lastError = '';

        for (const candidate of finalCandidates) {
          const url = String(candidate?.url || '').trim();
          let tmpPath = '';

          try {
            const estimated = await getRemoteSize(axios, url);
            if (estimated > MAX_DOWNLOAD_BYTES) {
              throw new Error(`Archivo supera límite (${bytesToHuman(estimated)}).`);
            }

            const detail = await callApi(ctx, `animeflv/anime/${encodeURIComponent(parsed.slug)}`, { episode_limit: 1 });
            const animeTitle = extractTitle(detail?.result || detail, parsed.slug);
            const fileName = `${animeTitle} - Episodio ${parsed.episode}.mp4`;

            let dlMsg = `${DECORATORS.star} Descargando episodio *${parsed.episode}*...\n`;
            dlMsg += `${DECORATORS.bullet} Servidor: *${candidate?.server || 'desconocido'}*\n`;
            dlMsg += `${DECORATORS.bullet} Tamaño estimado: *${bytesToHuman(estimated)}*\n`;

            await client.sendMessage(from, { text: dlMsg }, { quoted: m });

            const downloaded = await downloadToTempFile(axios, url, fileName);
            tmpPath = downloaded.tmpPath;
            const realSize = downloaded.sizeBytes;
            const contentType = String(downloaded.contentType || '').toLowerCase();
            const finalUrl = String(downloaded.finalUrl || url).toLowerCase();

            if (finalUrl.includes('.m3u8')) {
              throw new Error('Fuente inválida: playlist M3U8.');
            }
            if (
              contentType.includes('application/vnd.apple.mpegurl') ||
              contentType.includes('application/x-mpegurl') ||
              contentType.includes('text/html') ||
              contentType.includes('application/json')
            ) {
              throw new Error(`Tipo inválido: ${contentType || 'desconocido'}`);
            }
            if (realSize < MIN_VALID_VIDEO_BYTES) {
              const invalidPayload = await looksLikeNonVideoPayload(tmpPath);
              if (invalidPayload) {
                throw new Error(`Archivo inválido (${bytesToHuman(realSize)}).`);
              }
            }

            const asVideo = realSize > 0 && realSize <= MAX_VIDEO_INLINE_BYTES;
            const caption = [
              `${DECORATORS.check} *DESCARGA COMPLETADA*`,
              `${DECORATORS.lineThin}`,
              `🎬 *${animeTitle}*`,
              `📺 Episodio: *${parsed.episode}*`,
              `🈯 Idioma: *${selectedLang || 'AUTO'}*`,
              `🖥️  Servidor: *${candidate?.server || 'desconocido'}*`,
              `📦 Tamaño: *${bytesToHuman(realSize)}*`,
              `${DECORATORS.lineThin}`,
              asVideo ? '📤 Enviado como video' : '📄 Enviado como documento',
            ].join('\n');

            await client.sendMessage(
              from,
              asVideo
                ? {
                    video: fs.readFileSync(tmpPath),
                    mimetype: 'video/mp4',
                    caption,
                  }
                : {
                    document: fs.readFileSync(tmpPath),
                    mimetype: 'video/mp4',
                    fileName,
                    caption,
                  },
              { quoted: m }
            );

            sent = true;
            break;
          } catch (err) {
            lastError = String(err?.message || err);
          } finally {
            if (tmpPath) {
              try {
                await fs.promises.unlink(tmpPath);
              } catch {}
            }
          }
        }

        if (!sent) throw new Error(lastError || 'No pude descargar el episodio.');
        await react(client, m, '✅');
        return;
      }

      await client.sendMessage(from, { text: `❌ Comando no válido.` }, { quoted: m });
      await react(client, m, '⚠️');
    } catch (error) {
      await react(client, m, '❌');
      const errorMsg = [
        `${DECORATORS.cross} *ERROR EN ANIME*`,
        `${DECORATORS.lineThin}`,
        `${DECORATORS.bullet} ${String(error?.message || error).slice(0, 100)}`,
        `${DECORATORS.lineThin}`,
        `Para soporte: contacta al owner del bot`,
      ].join('\n');
      await client.sendMessage(from, { text: errorMsg }, { quoted: m });
    }
  },
};
