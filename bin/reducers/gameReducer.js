'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _require = require('../config'),
    config = _require.config;

var _require2 = require('./fireProjectileReducer'),
    fireProjectileReducer = _require2.fireProjectileReducer;

var _require3 = require('../utils/updateEntities'),
    updateShip = _require3.updateShip,
    updateProjectile = _require3.updateProjectile;

var _require4 = require('../entities/explosion'),
    makeExplosion = _require4.makeExplosion;

var _require5 = require('../entities/asteroid'),
    makeAsteroid = _require5.makeAsteroid;

var gameReducer = function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_TURN':
      {
        // re-sync if necessary
        if (action.time < state.time) {
          var timeDiff = state.time - action.time;
          updateShip(state, action.playerID, timeDiff, { thetaSpeed: action.thetaSpeed }, true // should rewind history
          );
          return state;
        } else if (action.time > state.time) {
          return _extends({}, state, {
            actionQueue: [].concat(_toConsumableArray(state.actionQueue), [action])
          });
        } else {
          return _extends({}, state, {
            ships: _extends({}, state.ships, _defineProperty({}, action.playerID, _extends({}, state.ships[action.playerID], {
              thetaSpeed: action.thetaSpeed
            })))
          });
        }
      }
    case 'SET_THRUST':
      {
        // re-sync if necessary
        if (action.time < state.time) {
          var _timeDiff = state.time - action.time;
          updateShip(state, action.playerID, _timeDiff, { thrust: action.thrust, future: [] }, true // should rewind history
          );
          return state;
        } else if (action.time > state.time) {
          return _extends({}, state, {
            actionQueue: [].concat(_toConsumableArray(state.actionQueue), [action])
          });
        } else {
          return _extends({}, state, {
            ships: _extends({}, state.ships, _defineProperty({}, action.playerID, _extends({}, state.ships[action.playerID], {
              thrust: action.thrust,
              future: []
            })))
          });
        }
      }
    case 'FIRE_MISSILE':
    case 'FIRE_LASER':
      return fireProjectileReducer(state, action);
    case 'MAKE_EXPLOSION':
      {
        var position = action.position,
            age = action.age,
            rate = action.rate,
            color = action.color,
            radius = action.radius;

        return _extends({}, state, {
          explosions: [].concat(_toConsumableArray(state.explosions), [makeExplosion(position, rate, age, color, radius)])
        });
      }
    case 'SHIFT_TARGET':
      var playerID = action.playerID,
          targetID = action.targetID;

      return _extends({}, state, {
        ships: _extends({}, state.ships, _defineProperty({}, playerID, _extends({}, state.ships[playerID], {
          target: targetID
        })))
      });
    case 'DESTROY_MISSILE':
      {
        var id = action.id;

        var nextMissiles = state.projectiles.filter(function (projectile) {
          return projectile.id != id;
        });
        return _extends({}, state, {
          projectiles: nextMissiles
        });
      }
    case 'MAKE_ASTEROID':
      {
        var _position = action.position,
            velocity = action.velocity,
            _id = action.id;

        var asteroid = makeAsteroid(_position, velocity);
        asteroid.id = _id;
        window.nextID = _id + 13; // HACK
        asteroid.theta += Math.random() * Math.PI;
        return _extends({}, state, {
          asteroids: [].concat(_toConsumableArray(state.asteroids), [asteroid])
        });
      }
    case 'DESTROY_ASTEROID':
      {
        var _id2 = action.id;

        var nextAsteroids = state.asteroids.filter(function (projectile) {
          return projectile.id != _id2;
        });
        return _extends({}, state, {
          asteroids: nextAsteroids
        });
      }

  }

  return state;
};

module.exports = { gameReducer: gameReducer };