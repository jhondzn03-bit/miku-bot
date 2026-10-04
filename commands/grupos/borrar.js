module.exports = {
  command: ['borrar', 'delete', 'del', 'eliminar'],
  description: 'Borra un mensaje (responder el mensaje a borrar)',
  categoria: 'grupos',
  admin: true,
  group: true,

  run: async (client, m, args, from) => {
    const ctx    = m?.message?.extendedTextMessage?.contextInfo;
    const stanza = ctx?.stanzaId;
    const participant = ctx?.participant;

    if (!stanza || !participant) {
      return client.sendMessage(from, {
        text:
`꧁𖤝᭄𐙚꧂ BORRAR MENSAJE ꧁𖤝᭄𐙚꧂

🌸 *Uso:*
➜ Responde el mensaje que quieras borrar
   y escribe *.borrar*

🗑️ El mensaje será eliminado.`
      }, { quoted: m });
    }

    try {
      await client.sendMessage(from, {
        delete: {
          remoteJid: from,
          fromMe:    false,
          id:        stanza,
          participant,
        }
      });
    } catch {
      await client.sendMessage(from, {
        text: '❌ No pude borrar ese mensaje. Asegúrate de que el bot sea admin.'
      }, { quoted: m });
    }
  },
};
