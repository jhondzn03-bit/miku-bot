module.exports = {
  command: ['date', 'fecha', 'dia'],
  description: 'Muestra la fecha y hora actual del servidor',
  categoria: 'sistema',

  run: async (client, m, args, from) => {
    const now = new Date();

    const DIAS   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    const MESES  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

    const dia     = DIAS[now.getDay()];
    const num     = String(now.getDate()).padStart(2,'0');
    const mes     = MESES[now.getMonth()];
    const anio    = now.getFullYear();
    const hora    = String(now.getHours()).padStart(2,'0');
    const minutos = String(now.getMinutes()).padStart(2,'0');
    const segs    = String(now.getSeconds()).padStart(2,'0');

    // Determinar estación (hemisferio sur, Perú)
    const mo = now.getMonth() + 1;
    const estacion =
      mo >= 12 || mo <= 2 ? '☀️ Verano'  :
      mo >= 3  && mo <= 5 ? '🍂 Otoño'   :
      mo >= 6  && mo <= 8 ? '❄️ Invierno' : '🌸 Primavera';

    const text =
`꧁𖨆᭄𐂂꧂ 𝑴𝑰𝑲𝑼 - 𝑩𝑶𝑻 ꧁𖨆᭄𐂂꧂
　ೃ⁀➷ 𝓗𝓪𝓽𝓼𝓾𝓷𝓮 𝓜𝓲𝓴𝓾 ❦

꧁ᬊ᭄𖦹꧂━━━━━━━━━━━━꧁ᬊ᭄𖦹꧂

≿━━━━━━━━━━━━━━━━━━━━━≾
╭─ 〘 📅 𝔉𝔢𝔠𝔥𝔞 & 𝔗𝔦𝔢𝔪𝔭𝔬 〙
│
│: ̗̀➛ 📆 *Día:* _${dia}_
│: ̗̀➛ 🗓️ *Fecha:* _${num} de ${mes} del ${anio}_
│: ̗̀➛ 🕒 *Hora:* _${hora}:${minutos}:${segs}_
│: ̗̀➛ ${estacion}
│
╰────────────────
≾━━━━━━━━━━━━━━━━━━━━━≿

꧁𓊈᭄𖧷꧂ 𝓜𝓲𝓴𝓾 𝓑𝓸𝓽 ✦ ꧁𓊈᭄𖧷꧂`;

    await client.sendMessage(from, { text }, { quoted: m });
  },
};
