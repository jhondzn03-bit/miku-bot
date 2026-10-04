'use strict';

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║         STICKER  —  MIKU-BOT  |  FSOCIETY                   ║
 * ║  Convierte imagen, video o GIF en sticker de WhatsApp        ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Uso:
 *   .s              → convierte imagen/video/GIF respondido
 *   .s Pack | Autor → sticker con pack y autor personalizados
 */

'use strict';

const fs   = require('fs');
const os   = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const {
  getMimeType,
  getQuotedOrCurrentMessage,
} = require('../../utils/mediaTools');

const DEFAULT_PACK   = '🌸 Miku Bot';
const DEFAULT_AUTHOR = '✦ FSociety';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'miku-sticker-'));
}

// Convierte buffer a webp usando ffmpeg
function convertToWebp(inputBuffer, { inputExt = 'jpg', isVideo = false, isGif = false } = {}) {
  const tempDir    = makeTempDir();
  const inputFile  = path.join(tempDir, `input.${inputExt}`);
  const outputFile = path.join(tempDir, 'output.webp');

  try {
    fs.writeFileSync(inputFile, inputBuffer);

    const args = ['-y'];

    if (isVideo || isGif) {
      args.push('-t', '7');
    }

    args.push(
      '-i', inputFile,
      '-vcodec', 'libwebp',
      '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba',
      '-loop', (isVideo || isGif) ? '0' : '1',
      '-preset', 'default',
      '-an',
      '-vsync', '0',
      '-quality', '80',
      outputFile,
    );

    execFileSync('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] });
    return fs.readFileSync(outputFile);
  } finally {
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
  }
}

// Agrega metadata EXIF al webp usando node-webpmux
async function addStickerMetadata(webpBuffer, packName, authorName) {
  try {
    const { Image } = require('node-webpmux');
    const img = new Image();
    await img.load(webpBuffer);

    const json = JSON.stringify({
      'sticker-pack-id':        `miku-${Date.now()}`,
      'sticker-pack-name':      String(packName   || DEFAULT_PACK),
      'sticker-pack-publisher': String(authorName || DEFAULT_AUTHOR),
      'emojis':                 ['🌸'],
    });

    const exifBuffer = Buffer.concat([
      Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00]),
      Buffer.from([0x01, 0x00]),
      Buffer.from([0x41, 0x57, 0x07, 0x00]),
      (() => { const b = Buffer.alloc(4); b.writeUInt32LE(json.length, 0); return b; })(),
      (() => { const b = Buffer.alloc(4); b.writeUInt32LE(0x1A, 0); return b; })(),
      Buffer.from([0x00, 0x00, 0x00, 0x00]),
      Buffer.from(json),
    ]);

    img.exif = exifBuffer;
    return await img.save(null);
  } catch {
    // Si node-webpmux falla, devolver webp sin metadata
    return webpBuffer;
  }
}

// Detecta el tipo de media
function detectMedia(getContentType, target) {
  const mime     = getMimeType(getContentType, target);
  const msgData  = target?.message || {};
  const isGifVid = msgData?.videoMessage?.gifPlayback === true;

  const isImage = (mime.startsWith('image/') && !mime.includes('gif')) || mime.includes('webp');
  const isGif   = mime.includes('gif') || isGifVid;
  const isVideo = mime.startsWith('video/') && !isGifVid;

  return {
    isImage,
    isVideo,
    isGif,
    mime,
    isValid: isImage || isVideo || isGif,
  };
}

// ──────────────────────────────────────────────────────────────────────────────

module.exports = {
  command: ['s', 'sticker', 'stiker', 'stick', 'stik'],
  description: 'Convierte imagen, video o GIF en sticker',
  categoria: 'herramientas',

  run: async (client, m, args, from, isCreator, ctx = {}) => {
    const { getContentType, downloadMediaMessage } = ctx;

    // Parsear pack y autor: .s NombrePack | Autor
    let packName   = DEFAULT_PACK;
    let authorName = DEFAULT_AUTHOR;

    if (args.length > 0) {
      const joined = args.join(' ');
      const parts  = joined.split('|');
      if (parts[0]?.trim()) packName   = parts[0].trim();
      if (parts[1]?.trim()) authorName = parts[1].trim();
    }

    // Obtener mensaje objetivo
    const target = getQuotedOrCurrentMessage(m);
    const media  = detectMedia(getContentType, target);

    if (!media.isValid) {
      return client.sendMessage(from, {
        text:
`╭━━━〔 🎟️ STICKER 〕━━━⬣

🌸 *¿Cómo usar?*

➜ Responde una *imagen* con *.s*
➜ Responde un *video* corto con *.s*
➜ Responde un *GIF* con *.s*
➜ Envía imagen con *.s* en el caption

📦 *Personalizar pack y autor:*
➜ *.s Mi Pack | Mi Nombre*

⚠️ Videos: máximo *7 segundos*

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽`
      }, { quoted: m });
    }

    // Validar duración de video
    if (media.isVideo) {
      const secs = Number(
        target?.message?.videoMessage?.seconds ||
        target?.message?.videoMessage?.duration || 0
      );
      if (secs > 8) {
        return client.sendMessage(from, {
          text:
`╭━━━〔 🎟️ STICKER 〕━━━⬣

❌ *Video muy largo* (${secs}s)
⏱️ Máximo permitido: *7 segundos*

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽`
        }, { quoted: m });
      }
    }

    // Reacción de procesando
    try {
      await client.sendMessage(from, { react: { text: '⏳', key: m.key } });
    } catch {}

    try {
      if (typeof downloadMediaMessage !== 'function') {
        throw new Error('downloadMediaMessage no disponible');
      }

      const buffer = await downloadMediaMessage(target, 'buffer');

      // Detectar extensión
      let inputExt = 'jpg';
      if (media.isVideo || media.isGif)    inputExt = 'mp4';
      else if (media.mime.includes('png')) inputExt = 'png';
      else if (media.mime.includes('gif')) inputExt = 'gif';
      else if (media.mime.includes('webp'))inputExt = 'webp';

      // Convertir a webp
      const webpBuffer = convertToWebp(buffer, {
        inputExt,
        isVideo: media.isVideo,
        isGif:   media.isGif,
      });

      // Agregar metadata
      const finalBuffer = await addStickerMetadata(webpBuffer, packName, authorName);

      // Enviar sticker
      await client.sendMessage(from, { sticker: finalBuffer }, { quoted: m });

      try {
        await client.sendMessage(from, { react: { text: '✅', key: m.key } });
      } catch {}

    } catch (e) {
      try {
        await client.sendMessage(from, { react: { text: '❌', key: m.key } });
      } catch {}

      const errMsg = String(e?.message || e);
      let hint = '';
      if (errMsg.toLowerCase().includes('ffmpeg')) hint = '\n💡 Instala ffmpeg: sudo apt install ffmpeg -y';
      if (errMsg.includes('downloadMediaMessage')) hint = '\n💡 No se pudo descargar el archivo.';

      await client.sendMessage(from, {
        text:
`╭━━━〔 🎟️ STICKER — ERROR 〕━━━⬣

❌ *No pude crear el sticker*

\`${errMsg.slice(0, 150)}\`${hint}

━━━━━━━━━━━━━━━━━━
💙 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽`
      }, { quoted: m });
    }
  },
};
