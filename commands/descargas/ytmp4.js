const {
  extractMediaUrl,
  extractTitle,
  extractMediaCandidates,
  toAbsoluteUrl
} = require('./_api');

const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

function isYouTubeUrl(text = '') {
  return /(?:youtu\.be\/|youtube\.com\/)/i.test(String(text || ''));
}

async function react(client, m, emoji) {
  try {
    await client.sendMessage(m.key.remoteJid, { react: { text: emoji, key: m.key } });
  } catch {}
}

// Descarga ultra resistente
async function downloadVideo(axios, url, retries = 8) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`[YTMP4DL] Intento ${i+1}/${retries}`);

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
          'Referer': 'https://dv-yer-api.online',
          'Origin': 'https://dv-yer-api.online',
          'Accept': 'video/mp4,*/*'
        },
        timeout: 300000,
      });

      console.log(`[YTMP4DL] ✅ Éxito ${ (response.data.length / (1024*1024)).toFixed(2) } MB`);
      return Buffer.from(response.data);
    } catch (error) {
      const status = error.response?.status;
      console.log(`[YTMP4DL] ❌ Fallo ${i+1}: ${status || error.code}`);

      if (i === retries - 1) throw error;
      const wait = (status === 502 || status === 503) ? 15000 : 8000;
      await new Promise(r => setTimeout(r, wait));
    }
  }
}

async function processVideoWithFFmpeg(inputBuffer, outputPath) {
  return new Promise((resolve, reject) => {
    const temp = path.join(__dirname, `temp_${Date.now()}.mp4`);
    fs.writeFileSync(temp, inputBuffer);

    ffmpeg(temp)
      .outputOptions(['-c:v libx264', '-c:a aac', '-movflags +faststart', '-preset ultrafast', '-crf 23', '-pix_fmt yuv420p'])
      .on('end', () => { fs.unlink(temp, () => {}); resolve(); })
      .on('error', (err) => { fs.unlink(temp, () => {}); reject(err); })
      .save(outputPath);
  });
}

module.exports = {
  command: ['ytmp4', 'video', 'play2'],
  description: 'Descargar video YouTube (ytmp4dl)',
  categoria: 'descargas',

  run: async (client, m, args, from, isCreator, ctx = {}) => {
    const query = String(args.join(' ') || '').trim();
    if (!query) {
      return client.sendMessage(from, { text: `🎤 *HATSUNE MIKU*\nUso: .ytmp4 <nombre | link>` }, { quoted: m });
    }

    await react(client, m, '🎤');
    let tempPath = null;

    try {
      const axios = ctx?.axios;
      if (!axios) throw new Error('Axios no disponible');

      const apiBase = 'https://dv-yer-api.online';
      const apiKey = 'dvyer985747404183';
      let targetUrl = '';

      if (/^\d+$/.test(query)) {
        const index = parseInt(query) - 1;
        targetUrl = global.playResults?.[from]?.[index]?.url;
      }

      if (!targetUrl) {
        targetUrl = query;
        if (!isYouTubeUrl(query)) {
          await react(client, m, '🔍');
          const search = await axios.get(`${apiBase}/ytsearch`, { params: { q: query, limit: 1, apikey: apiKey } });
          targetUrl = search?.data?.results?.[0]?.url || '';
        }
      }

      if (!targetUrl) return client.sendMessage(from, { text: '❌ No encontré resultados' }, { quoted: m });

      await react(client, m, '📥');

      // ←←← USAMOS ytmp4dl (el más estable) ←←←
      const res = await axios.get(`${apiBase}/ytmp4dl`, {
        params: { url: targetUrl, quality: '360p', mode: 'link', apikey: apiKey },
        timeout: 90000
      });

      const result = res.data || {};
      const title = extractTitle(result) || result.title || 'Video';

      let mediaUrl = result.stream_url || result.download_url || result.url || extractMediaUrl(result);

      if (!mediaUrl) {
        const candidates = [...extractMediaCandidates(result, apiBase)].filter(Boolean);
        mediaUrl = candidates[0];
      }

      if (!mediaUrl) throw new Error('No se obtuvo enlace');

      console.log('Media URL:', mediaUrl);

      await react(client, m, '💾');
      const buffer = await downloadVideo(axios, mediaUrl);

      await react(client, m, '⚙️');
      tempPath = path.join(__dirname, `temp_${Date.now()}.mp4`);

      let finalBuffer = buffer;
      try {
        await processVideoWithFFmpeg(buffer, tempPath);
        finalBuffer = fs.readFileSync(tempPath);
      } catch (e) { console.log('FFmpeg falló'); }

      const size = (finalBuffer.length / (1024*1024)).toFixed(2);

      const caption = `🎬 *VIDEO DESCARGADO*\n📀 ${title}\n📊 ${size} MB\n🎥 360p\n🛠️ ytmp4dl`;

      await client.sendMessage(from, { video: finalBuffer, caption, mimetype: 'video/mp4' }, { quoted: m });
      await react(client, m, '✅');

    } catch (error) {
      console.error(error);
      await react(client, m, '❌');
      await client.sendMessage(from, { 
        text: error.response?.status === 502 
          ? '🌩️ Servidor saturado (502). Intenta de nuevo en 20 segundos.' 
          : `❌ Error: ${error.message}`
      }, { quoted: m });
    } finally {
      if (tempPath && fs.existsSync(tempPath)) unlinkAsync(tempPath).catch(() => {});
    }
  }
};
