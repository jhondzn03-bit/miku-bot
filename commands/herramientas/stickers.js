const {
  downloadMediaBuffer,
  ffmpegToWebp,
  getMimeType,
  getQuotedOrCurrentMessage,
} = require('../../utils/mediaTools');

module.exports = {
  command: ['s', 'sticker', 'stiker', 'stick'],
  description: 'Convierte una imagen o video en sticker',
  categoria: 'herramientas',

  run: async (client, m, args, from, isCreator, ctx = {}) => {
    const target = getQuotedOrCurrentMessage(m);
    const mime = getMimeType(ctx.getContentType, target);

    const isImage = mime.startsWith('image/');
    const isVideo = mime.startsWith('video/');

    if (!isImage && !isVideo) {
      return client.sendMessage(
        from,
        {
          text: `╭━━━〔 🎟️ STICKER 〕━━━⬣

🌸 Usa este comando respondiendo una imagen o video.

➜ Responde una foto y escribe *.s*
➜ Responde un video corto y escribe *.s*

💡 También puedes enviar la imagen con el comando en el caption.`,
        },
        { quoted: m }
      );
    }

    if (isVideo) {
      const seconds = Number(
        target?.message?.videoMessage?.seconds || 0
      );

      if (seconds > 8) {
        return client.sendMessage(
          from,
          {
            text: '❌ El video es muy largo. Usa uno de máximo 8 segundos para sticker.',
          },
          { quoted: m }
        );
      }
    }

    try {
      const media = await downloadMediaBuffer(ctx, client, m);

      const webp = ffmpegToWebp(media, {
        inputExt: isVideo ? 'mp4' : 'jpg',
        video: isVideo,
      });

      console.log('Es Buffer:', Buffer.isBuffer(webp));
      console.log('Bytes:', webp?.length);

      if (!Buffer.isBuffer(webp) || !webp.length) {
        throw new Error('No se pudo generar el sticker WEBP');
      }

      await client.sendMessage(
        from,
        {
          sticker: Buffer.from(webp),
        },
        {
          quoted: m,
        }
      );

    } catch (e) {
      console.error(e);

      await client.sendMessage(
        from,
        {
          text: `❌ No pude crear el sticker.\n${String(
            e?.message || e
          ).slice(0, 180)}`,
        },
        {
          quoted: m,
        }
      );
    }
  },
};