'use strict';

var _require = require('../config'),
    config = _require.config;

var _require2 = require('../selectors/selectors'),
    getClientPlayerID = _require2.getClientPlayerID,
    getPlayerColor = _require2.getPlayerColor,
    getEntityByID = _require2.getEntityByID;

var _require3 = require('../entities/ship'),
    renderShip = _require3.renderShip;

var _require4 = require('../entities/projectile'),
    renderProjectile = _require4.renderProjectile;

var _require5 = require('../entities/asteroid'),
    renderAsteroid = _require5.renderAsteroid;

/**
 * Render things into the canvas
 */
var initRenderSystem = function initRenderSystem(store) {

  var time = store.getState().game.time;
  var canvas = null;
  var ctx = null;
  store.subscribe(function () {
    var state = store.getState();
    // only check on a new tick
    if (state.game.time == time && state.game.tickInterval != null) {
      return;
    }
    // important to track time this way so this only happens once per tick
    time = state.game.time;

    if (!canvas) {
      canvas = document.getElementById('canvas');
      if (!canvas) return; // don't break
      ctx = canvas.getContext('2d');
    }

    // clear
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

    render(state, ctx);
  });
};

var render = function render(state, ctx) {
  var game = state.game;

  // scale solar system to the canvas

  ctx.save();
  ctx.scale(config.canvasWidth / config.width, config.canvasHeight / config.height);

  // render ships and their target
  for (var id in game.ships) {
    renderShip(state, ctx, id);

    var ship = game.ships[id];
    var targetEntity = getEntityByID(game, ship.target);
    if (targetEntity != null) {
      ctx.save();
      ctx.strokeStyle = getPlayerColor(state, ship.playerID);
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(targetEntity.position.x, targetEntity.position.y, 50, 0, Math.PI * 2);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }

  // render projectiles
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = game.projectiles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var projectile = _step.value;

      renderProjectile(state, ctx, projectile);
    }

    // render asteroids
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = game.asteroids[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var asteroid = _step2.value;

      renderAsteroid(state, ctx, asteroid);
    }

    // render sun
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  var sun = game.sun;

  ctx.fillStyle = 'yellow';
  ctx.beginPath();
  ctx.arc(sun.position.x, sun.position.y, sun.radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();

  // render planets
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = game.planets[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var planet = _step3.value;

      ctx.fillStyle = 'steelblue';
      ctx.beginPath();
      ctx.arc(planet.position.x, planet.position.y, planet.radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }

    // render explosions
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = game.explosions[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var explosion = _step4.value;

      if (explosion.radius <= 0) {
        continue;
      }
      ctx.globalAlpha = 1 - (config.explosion.age - explosion.age) / config.explosion.age;
      ctx.fillStyle = explosion.color;
      ctx.beginPath();
      ctx.arc(explosion.position.x, explosion.position.y, explosion.radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  ctx.restore();
};

module.exports = { initRenderSystem: initRenderSystem };