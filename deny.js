const fs = require('fs');

module.exports = function (bot) {
  const CONFIG_PATH = './plotconfig.json';
  const DATA_PATH = './deniedPlayers.json';

  let config = {
    PlotArea: { x1: 0, y1: 0, z1: 0, x2: 10, y2: 255, z2: 10 }
  };

  if (fs.existsSync(CONFIG_PATH)) {
    try {
      config = JSON.parse(fs.readFileSync(CONFIG_PATH));
    } catch (err) {
      console.error('[AutoPlotDeny] Fehler beim Laden von plotconfig.json:', err);
    }
  } else {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  }

  let denied = {};
  if (fs.existsSync(DATA_PATH)) {
    try {
      denied = JSON.parse(fs.readFileSync(DATA_PATH));
    } catch (err) {
      console.error('[AutoPlotDeny] Fehler beim Lesen von deniedPlayers.json:', err);
    }
  }

  function saveDenied() {
    fs.writeFileSync(DATA_PATH, JSON.stringify(denied, null, 2));
  }

  function isInPlot(pos) {
    const { x1, y1, z1, x2, y2, z2 } = config.PlotArea;
    return (
      pos.x >= Math.min(x1, x2) &&
      pos.x <= Math.max(x1, x2) &&
      pos.y >= Math.min(y1, y2) &&
      pos.y <= Math.max(y1, y2) &&
      pos.z >= Math.min(z1, z2) &&
      pos.z <= Math.max(z1, z2)
    );
  }

  bot.on('physicTick', () => {
    for (const player of Object.values(bot.players)) {
      if (!player.entity) continue;
      const name = player.username;
      if (denied[name]) continue;
      const pos = player.entity.position;
      if (isInPlot(pos)) {
        bot.chat(`/p deny ${name}`);
        denied[name] = true;
        saveDenied();
        console.log(`[AutoPlotDeny] ${name} wurde automatisch per /p deny gesichert.`);
      }
    }
  });

  bot.once('spawn', () => {
    console.log('[AutoPlotDeny] aktiv');
  });

  process.on('exit', saveDenied);
};

