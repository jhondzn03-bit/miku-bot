const API_BASE = 'https://dv-yer-api.online';
const API_KEY = 'dvyer985747404183';

async function react(client, m, emoji) {
  try {
    await client.sendMessage(m.key.remoteJid, {
      react: {
        text: emoji,
        key: m.key
      }
    });
  } catch {}
}

function formatDuration(seconds = 0) {
  const total = Math.max(0, Number(seconds || 0));
  const min = Math.floor(total / 60);
  const sec = Math.floor(total % 60);
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function shortText(text = '', max = 40) {
  text = String(text || '');
  return text.length > max ? text.slice(0, max) + '...' : text;
}

module.exports = {
  command: ['play'],
  description: 'Buscar música en YouTube',
  categoria: 'descargas',

  run: async (client, m, args, from, isCreator, ctx = {}) => {

    const axios = ctx?.axios;
    const prefix = ctx?.prefix || '.';

    if (!axios) {
      return client.sendMessage(from, {
        text: '❌ Axios no disponible.'
      }, { quoted: m });
    }

    const query = args.join(' ').trim();

    if (!query) {
      return client.sendMessage(from, {
        text:
`「 🎤 𝓗𝓪𝓽𝓼𝓾𝓷𝓮 𝓜𝓲𝓴𝓾 𝓜𝓾𝓼𝓲𝓬 」

📌 *Uso:*
│: ̗̀➛ \`${prefix}play <nombre de canción>\`

⋆｡‧˚ʚ🌸ɞ˚‧｡⋆ _¡Busca tu canción favorita!_`
      }, { quoted: m });
    }

    await react(client, m, '🎤');

    try {

      const response = await axios.get(`${API_BASE}/ytsearch`, {
        params: {
          q: query,
          limit: 3,
          apikey: API_KEY
        },
        timeout: 60000
      });

      const results = Array.isArray(response?.data?.results)
        ? response.data.results
        : [];

      if (!results.length) {
        return client.sendMessage(from, {
          text: '❌ No encontré resultados.'
        }, { quoted: m });
      }

      const top = results
        .slice(0, 3)
        .filter(v => v?.url);

      if (!top.length) {
        return client.sendMessage(from, {
          text: '❌ No encontré resultados válidos.'
        }, { quoted: m });
      }

      global.playResults = global.playResults || {};
      global.playResults[from] = top;

      let text =
`꧁༒✦ 𝑴𝑰𝑲𝑼 - 𝑷𝑳𝑨𝒀𝑬𝑹 ✦༒꧂
　ೃ⁀➷ 𝓗𝓪𝓽𝓼𝓾𝓷𝓮 𝓜𝓲𝓴𝓾 ❦￤
꧁༒✦━━━━━━━━━━━━✦༒꧂

🔍 ꜱᴇᴀʀᴄʜ
│: ̗̀➛ ${query}

`;

      top.forEach((item, index) => {
        const nums = ['①', '②', '③'];
        const decs = [
          '⊹₊⟡⋆。°✩⟡₊⊹',
          '✦•┈┈┈┈┈┈┈┈•✦',
          '°❀⋆.ೃ࿔*:･°❀⋆'
        ];
        text +=
`${decs[index]}
${nums[index]} 𝑹𝒆𝒔𝒖𝒍𝒕𝒂𝒅𝒐 ${index + 1}
│: ̗̀➛ 🎵 *ᴛɪᴛʟᴇ:* ${shortText(item.title)}
│: ̗̀➛ 📺 *ᴄᴀɴᴀʟ:* ${shortText(item.channel || 'Desconocido', 25)}
│: ̗̀➛ ⏱️ *ᴅᴜʀᴀᴄɪᴏ́ɴ:* ${formatDuration(item.duration_seconds)}
╰┈➤ _listo para descargar_

`;
      });

      text +=
`≿━━━━━━━━━━━━━━━━━━━━━≾

🎧 ᴀᴜᴅɪᴏ ᴅᴏᴡɴʟᴏᴀᴅ
│: ̗̀➛ \`${prefix}ytmp3 1\`
│: ̗̀➛ \`${prefix}ytmp3 2\`
│: ̗̀➛ \`${prefix}ytmp3 3\`

🎬 ᴠɪᴅᴇᴏ ᴅᴏᴡɴʟᴏᴀᴅ
│: ̗̀➛ \`${prefix}ytmp4 1\`
│: ̗̀➛ \`${prefix}ytmp4 2\`
│: ̗̀➛ \`${prefix}ytmp4 3\`

≾━━━━━━━━━━━━━━━━━━━━━≿
꧁❦•── 🌸 𝓜𝓲𝓴𝓾 𝓟𝓵𝓪𝔂𝓮𝓻 ──•❦꧂`;

      if (top[0]?.thumbnail) {
        await client.sendMessage(from, {
          image: { url: top[0].thumbnail },
          caption: text
        }, { quoted: m });
      } else {
        await client.sendMessage(from, { text }, { quoted: m });
      }

      await react(client, m, '✅');

    } catch (error) {

      console.error(error);
      await react(client, m, '❌');
      await client.sendMessage(from, {
        text: `❌ *Error:*\n${error.message}`
      }, { quoted: m });
    }
  }
};