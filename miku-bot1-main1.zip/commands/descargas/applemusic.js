const { callApi, extractMediaCandidates } = require('./_api');

async function react(client, m, emoji) {
  try {
    await client.sendMessage(m.key.remoteJid, { react: { text: emoji, key: m.key } });
  } catch {}
}

function isAppleMusicUrl(text = '') {
  return /music\.apple\.com\//i.test(String(text || ''));
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

function msToMinSec(ms = 0) {
  const total = Math.max(0, Number(ms || 0));
  const min = Math.floor(total / 60000);
  const sec = Math.floor((total % 60000) / 1000);
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function buildTrackInfo(track = {}, fallbackQuery = '') {
  const title = String(track?.title || fallbackQuery || 'Cancion').trim();
  const artist = String(track?.artist || 'Desconocido').trim();
  const album = String(track?.album || '').trim();
  const duration = msToMinSec(track?.duration_ms || 0);
  return { title, artist, album, duration };
}

module.exports = {
  command: ['applemusic', 'am', 'appledl'],
  description: 'Busca y descarga canciones de Apple Music en MP3',
  categoria: 'descargas',
  run: async (client, m, args, from, isCreator, ctx = {}) => {
    const raw = String(args.join(' ') || '').trim();
    if (!raw) {
      await client.sendMessage(from, {
        text: 'Uso:\n.applemusic <busqueda> |<pick opcional>\n.applemusic <link de Apple Music>\nEj: .applemusic ozuna |2',
      }, { quoted: m });
      return;
    }

    await react(client, m, '⏳');

    try {
      let songUrl = '';
      let info = { title: 'Cancion', artist: 'Desconocido', album: '', duration: '00:00' };

      if (isAppleMusicUrl(raw)) {
        songUrl = raw;
      } else {
        const { query, pick } = parseQueryAndPick(raw);
        if (!query) {
          await client.sendMessage(from, { text: 'Escribe una busqueda valida. Ej: .applemusic humbe amor de cine |1' }, { quoted: m });
          return;
        }

        const searchResult = await callApi(ctx, 'applemusicsearch', { q: query, limit: 10, type: 'song' });
        const results = Array.isArray(searchResult?.results) ? searchResult.results : [];
        if (!results.length) {
          await client.sendMessage(from, { text: 'No encontre resultados en Apple Music.' }, { quoted: m });
          return;
        }

        const index = Math.min(Math.max(pick, 1), results.length) - 1;
        const selected = results[index] || results[0];
        songUrl = String(selected?.apple_music_url || selected?.song_url || selected?.url || '').trim();
        info = buildTrackInfo(selected, query);

        if (!songUrl) {
          await client.sendMessage(from, { text: 'No pude obtener URL de la cancion seleccionada.' }, { quoted: m });
          return;
        }
      }

      const dlResult = await callApi(ctx, 'applemusicdl', { url: songUrl, mode: 'link' });
      const mediaUrls = extractMediaCandidates(dlResult, String(ctx?.settings?.apiBaseUrl || 'https://dv-yer-api.online'));

      if (!mediaUrls.length) {
        await client.sendMessage(from, { text: 'La API no devolvio audio descargable.' }, { quoted: m });
        return;
      }

      const finalTitle = String(dlResult?.title || info.title || 'Cancion').trim();
      let sent = false;
      let lastError = '';
      for (const url of mediaUrls) {
        try {
          await client.sendMessage(from, {
            audio: { url },
            mimetype: 'audio/mpeg',
            fileName: `${finalTitle}.mp3`,
            ptt: false,
          }, { quoted: m });
          sent = true;
          break;
        } catch (e) {
          lastError = String(e?.message || e);
        }
      }

      if (!sent) throw new Error(lastError || 'No pude enviar el audio de Apple Music.');
      await react(client, m, '✅');
    } catch (error) {
      await react(client, m, '❌');
      await client.sendMessage(from, { text: `Error en .applemusic: ${String(error?.message || error)}` }, { quoted: m });
    }
  },
};
