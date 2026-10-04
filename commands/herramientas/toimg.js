const {
  downloadMediaBuffer,
  ffmpegStickerToImage,
  getMimeType,
  getQuotedOrCurrentMessage,
} = require('../../utils/mediaTools');

module.exports = {
  command: ['toimg', 'img', 'sticker2img', 'stickerimg'],
  description: 'Convierte un sticker en imagen',
  categoria: 'herramientas',

  run: async (client, m, args, from, isCreator, ctx = {}) => {
    const target = getQuotedOrCurrentMessage(m);
    const mime = getMimeType(ctx.getContentType, target);
    const isSticker = mime === 'image/webp';

    if (!isSticker) {
      return client.sendMessage(from, {
        text:
`╭━━━〔 🖼️ TO IMG 〕━━━⬣

🌸 Responde a un sticker con:

➜ *.toimg*

💡 Convierte stickers en imagen.`
      }, { quoted: m });
    }

    try {
      const media = await downloadMediaBuffer(ctx, client, m);
      const image = ffmpegStickerToImage(media);

      await client.sendMessage(from, {
        image,
        caption: '✅ Sticker convertido a imagen.',
      }, { quoted: m });
    } catch (e) {
      await client.sendMessage(from, {
        text: `❌ No pude convertir el sticker.\n${String(e?.message || e).slice(0, 180)}`,
      }, { quoted: m });
    }
  },
};
