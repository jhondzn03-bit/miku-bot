'use strict';

const fs   = require('fs');
const path = require('path');

const COMMANDS_DIR = path.join(process.cwd(), 'commands');

/**
 * Carga y recarga todos los comandos desde la carpeta /commands (recursivo).
 * Guarda los comandos en global.comandos (Map).
 */
function reloadCommands() {
  if (!global.comandos) {
    global.comandos = new Map();
  } else {
    global.comandos.clear();
  }

  let total = 0;

  function loadDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        loadDir(fullPath);
        continue;
      }

      // Solo archivos .js, ignorar _api.js y similares (sin campo "command")
      if (!entry.name.endsWith('.js')) continue;

      try {
        // Limpiar caché de require para recarga en caliente
        delete require.cache[require.resolve(fullPath)];
        const mod = require(fullPath);

        if (!mod || !mod.command) continue;

        const aliases = Array.isArray(mod.command) ? mod.command : [mod.command];

        for (const alias of aliases) {
          if (typeof alias === 'string' && alias.trim()) {
            global.comandos.set(alias.trim().toLowerCase(), mod);
          }
        }

        total++;
      } catch (err) {
        console.error(`[reloadCommands] Error cargando ${fullPath}: ${err.message}`);
      }
    }
  }

  loadDir(COMMANDS_DIR);
  console.log(`[reloadCommands] ${global.comandos.size} aliases cargados desde ${total} archivos.`);
}

module.exports = { reloadCommands };
