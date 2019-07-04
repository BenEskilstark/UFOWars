'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('../physics/gravity'),
    computeNextEntity = _require.computeNextEntity;

var _require2 = require('../utils/queue'),
    queueAdd = _require2.queueAdd;

var _require3 = require('../config'),
    config = _require3.config;

var sin = Math.sin,
    cos = Math.cos,
    abs = Math.abs,
    sqrt = Math.sqrt;


/**
 * Updates the gamestate in place for performance/laziness
 */
var tickReducer = function tickReducer(state) {
  state.time = state.time + 1;

  var sun = state.sun;

  // update ships

  for (var id in state.ships) {
    var ship = state.ships[id];
    var history = ship.history;
    queueAdd(history, ship, config.queueSize);
    state.ships[id] = _extends({}, ship, computeNextEntity(sun, ship, ship.thrust), {
      history: history
    });
  }

  // update planets
  state.planets = state.planets.map(function (planet) {
    var history = planet.history;
    queueAdd(history, planet, config.queueSize);
    return _extends({}, planet, computeNextEntity(sun, planet), {
      history: history
    });
  });

  // TODO update projectiles/lasers/missiles

  // TODO update paths

  return state;
};

module.exports = { tickReducer: tickReducer };