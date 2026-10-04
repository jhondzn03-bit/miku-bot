module.exports = {
  command: ['setapi', 'apikey', 'apiurl'],
  description: 'Configura API base y API key para descargas',
  isOwner: true,
  categoria: 'owner',
  run: async (client, m, args, from, isCreator, ctx = {}) => {
    const saveSettings = ctx?.saveSettings;
    const settings = ctx?.settings || {};

    if (typeof saveSettings !== 'function') {
      await client.sendMessage(from, { text: 'No pude acceder al guardado de settings.' }, { quoted: m });
      return;
    }

    const mode = String(args[0] || '').toLowerCase();
    const value = String(args.slice(1).join(' ') || '').trim();

    if (!mode) {
      await client.sendMessage(from, {
        text:
          '*CONFIG API*\n\n' +
          `Base actual: ${settings.apiBaseUrl || '-'}\n` +
          `Key actual: ${settings.apiKey ? 'configurada' : '-'}\n\n` +
          '- .setapi base https://dv-yer-api.online\n' +
          '- .setapi key TU_API_KEY\n' +
          '- .setapi auto',
      }, { quoted: m });
      return;
    }

    if (mode === 'auto') {
      saveSettings({
        apiBaseUrl: 'https://dv-yer-api.online',
        apiKey: 'dvyer911840240197',
      });
      await client.sendMessage(from, { text: 'API configurada automaticamente para dv-yer-api.online' }, { quoted: m });
      return;
    }

    if (!value) {
      await client.sendMessage(from, { text: 'Falta valor. Usa .setapi base <url> o .setapi key <apikey>' }, { quoted: m });
      return;
    }

    if (mode === 'base') {
      saveSettings({ apiBaseUrl: value });
      await client.sendMessage(from, { text: `API base guardada: ${value}` }, { quoted: m });
      return;
    }

    if (mode === 'key') {
      saveSettings({ apiKey: value });
      await client.sendMessage(from, { text: 'API key guardada correctamente.' }, { quoted: m });
      return;
    }

    await client.sendMessage(from, { text: 'Usa: .setapi base <url> | .setapi key <apikey> | .setapi auto' }, { quoted: m });
  },
};
