'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('../utils/gravity'),
    computeNextEntity = _require.computeNextEntity;

var _require2 = require('../utils/queue'),
    queueAdd = _require2.queueAdd;

var _require3 = require('../config'),
    config = _require3.config;

var updateShip = function updateShip(state, id, numTicks, nextShipProps, shouldRewindHistory) {

  // rewind history
  if (shouldRewindHistory) {
    // rewind ship
    var prevShipPos = null;
    for (var i = 0; i < numTicks; i++) {
      prevShipPos = state.ships[id].history.pop();
    }
    var ship = state.ships[id];
    state.ships[id] = _extends({}, ship, prevShipPos, nextShipProps);
  }

  var sun = state.sun;

  for (var _i = 0; _i < numTicks; _i++) {
    var _ship = state.ships[id];
    var history = _ship.history;

    // rewind planets to their positions at that tick
    var rewoundPlanets = [];
    for (var j = 0; j < state.planets.length; j++) {
      var planet = state.planets[j];
      var prevPlanetPos = planet.history[planet.history.length - numTicks - _i];
      rewoundPlanets.push(_extends({}, planet, prevPlanetPos));
    }
    var masses = [sun].concat(rewoundPlanets);

    queueAdd(history, _ship, config.maxHistorySize);
    state.ships[id] = _extends({}, _ship, computeNextEntity(masses, _ship, _ship.thrust), {
      history: history
    });
  }
};

var updateProjectile = function updateProjectile(state, j, numTicks) {
  var sun = state.sun,
      planets = state.planets;

  var masses = [sun]; // HACK: missiles don't care about gravity of anything other than the sun
  for (var i = 0; i < numTicks; i++) {
    var projectile = state.projectiles[j];
    var history = projectile.history;
    queueAdd(history, projectile, config.maxHistorySize);
    state.projectiles[j] = _extends({}, projectile, computeNextEntity(masses, projectile, projectile.thrust || 0, true /*no smart theta*/), {
      history: history
    });
  }
};

var updateGenericEntity = function updateGenericEntity(state, entity) {
  var sun = state.sun,
      planets = state.planets;

  var masses = [sun].concat(_toConsumableArray(planets));
  return _extends({}, entity, computeNextEntity(masses, entity, 0 /* no thrust */));
};

module.exports = {
  updateShip: updateShip,
  updateProjectile: updateProjectile,
  updateGenericEntity: updateGenericEntity
};