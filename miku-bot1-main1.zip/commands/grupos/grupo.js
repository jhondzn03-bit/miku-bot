const cron = require('node-cron');
const moment = require('moment-timezone');

const groupSchedules = global.__groupSchedules || (global.__groupSchedules = new Map());

function parseGroupSchedule(args = []) {
  if (args.length < 2) return null;

  const timeRaw = args[0];
  const timezone = args.slice(1).join(' ');

  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(timeRaw);
  if (!match) return null;
  if (!moment.tz.zone(timezone)) return null;

  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
    timezone,
  };
}

function scheduleGroupSetting(client, chatId, mode, hour, minute, timezone) {
  const key = `${chatId}:${mode}`;

  const existing = groupSchedules.get(key);
  if (existing?.task) {
    existing.task.stop();
    existing.task.destroy?.();
  }

  const task = cron.schedule(
    `${minute} ${hour} * * *`,
    async () => {
      try {
        await client.groupSettingUpdate(chatId, mode);
      } catch (err) {
        console.error(`[group-schedule] ${key}`, err?.message || err);
      }
    },
    { timezone }
  );

  groupSchedules.set(key, { task, mode, hour, minute, timezone, chatId });
  return true;
}

module.exports = {
  command: ['grupo', 'cerrar', 'abrir'],
  description: 'Abrir, cerrar o programar horario del grupo',
  categoria: 'grupos',
  admin: true,
  group: true,

  run: async (client, m, args, from) => {
    let action = String(args[0] || '').toLowerCase();

    const rawCmd = String(
      m?.message?.conversation ||
      m?.message?.extendedTextMessage?.text ||
      ''
    ).toLowerCase();

    if (rawCmd.startsWith('.cerrar')) action = 'cerrar';
    if (rawCmd.startsWith('.abrir')) action = 'abrir';

    if ((action === 'cerrar' || action === 'abrir') && args.length >= 3) {
      const scheduleData = parseGroupSchedule(args.slice(1));

      if (!scheduleData) {
        return client.sendMessage(from, {
          text: `❌ Formato de horario inválido.\n\nEjemplo correcto:\n➜ .grupo ${action} 20:00 America/Lima`
        }, { quoted: m });
      }

      const mode = action === 'cerrar' ? 'announcement' : 'not_announcement';
      scheduleGroupSetting(client, from, mode, scheduleData.hour, scheduleData.minute, scheduleData.timezone);

      return client.sendMessage(from, {
        text:
`╭━━━〔 ⏰ HORARIO DE GRUPO 〕━━━⬣

✅ Programado con éxito.

📌 Acción: *${action === 'cerrar' ? 'Cerrar grupo' : 'Abrir grupo'}*
🕒 Hora: *${String(scheduleData.hour).padStart(2, '0')}:${String(scheduleData.minute).padStart(2, '0')}*
🌍 Zona Horaria: *${scheduleData.timezone}*

━━━━━━━━━━━━━━━━━━
💙 Miku Bot`,
      }, { quoted: m });
    }

    if (!['abrir', 'cerrar', 'open', 'close'].includes(action)) {
      return client.sendMessage(from, {
        text:
`╭━━━〔 👥 CONTROL DE GRUPO 〕━━━⬣

🌸 Uso correcto inmediato:
➜ .grupo abrir
➜ .grupo cerrar

⏰ Programar horario diario:
➜ .grupo cerrar 20:00 America/Lima
➜ .grupo abrir 07:00 America/Lima

💙 Administración del grupo`
      }, { quoted: m });
    }

    const close = action === 'cerrar' || action === 'close';

    await client.groupSettingUpdate(
      from,
      close ? 'announcement' : 'not_announcement'
    );

    if (close) {
      await client.sendMessage(from, {
        text:
`╭━━━〔 🔒 GRUPO CERRADO 〕━━━⬣

✅ Estado actualizado

🚫 Solo los administradores pueden enviar mensajes.

━━━━━━━━━━━━━━━━━━
💙 Protección activada`
      }, { quoted: m });
    } else {
      await client.sendMessage(from, {
        text:
`╭━━━〔 🔓 GRUPO ABIERTO 〕━━━⬣

✅ Estado actualizado

💬 Todos los participantes pueden enviar mensajes.

━━━━━━━━━━━━━━━━━━
💙 Chat habilitado`
      }, { quoted: m });
    }
  },
};
