'use strict';

var _require = require('../config'),
    config = _require.config;

var _require2 = require('../selectors/selectors'),
    getClientPlayerID = _require2.getClientPlayerID;

var _require3 = require('../utils/clientToServer'),
    dispatchToServer = _require3.dispatchToServer;

var initKeyboardControlsSystem = function initKeyboardControlsSystem(store) {
  var dispatch = store.dispatch;

  var state = store.getState();
  var playerID = getClientPlayerID(state);

  document.onkeydown = function (ev) {
    var state = store.getState();
    var _state$game = state.game,
        time = _state$game.time,
        ships = _state$game.ships;

    switch (ev.keyCode) {
      case 37:
        {
          // left
          if (ships[playerID].thetaSpeed == -1 * config.ship.thetaSpeed) {
            return; // don't dispatch redundantly
          }
          var action = {
            type: 'SET_TURN', time: time, playerID: playerID, thetaSpeed: -1 * config.ship.thetaSpeed
          };
          dispatchToServer(playerID, action);
          dispatch(action);
          break;
        }
      case 38:
        {
          // up
          if (ships[playerID].thrust == config.ship.thrust) {
            return; // don't dispatch redundantly
          }
          var _action = { type: 'SET_THRUST', time: time, playerID: playerID, thrust: config.ship.thrust };
          dispatchToServer(playerID, _action);
          dispatch(_action);
          break;
        }
      case 39:
        {
          // right
          if (ships[playerID].thetaSpeed == config.ship.thetaSpeed) {
            return; // don't dispatch redundantly
          }
          var _action2 = { type: 'SET_TURN', time: time, playerID: playerID, thetaSpeed: config.ship.thetaSpeed };
          dispatchToServer(playerID, _action2);
          dispatch(_action2);
          break;
        }
    }
  };

  document.onkeyup = function (ev) {
    var state = store.getState();
    var time = state.game.time;

    switch (ev.keyCode) {
      case 37:
        {
          // left
          var action = { type: 'SET_TURN', time: time, playerID: playerID, thetaSpeed: 0 };
          dispatchToServer(playerID, action);
          dispatch(action);
          break;
        }
      case 38:
        {
          // up
          var _action3 = { type: 'SET_THRUST', time: time, playerID: playerID, thrust: 0 };
          dispatchToServer(playerID, _action3);
          dispatch(_action3);
          break;
        }
      case 39:
        {
          // right
          var _action4 = { type: 'SET_TURN', time: time, playerID: playerID, thetaSpeed: 0 };
          dispatchToServer(playerID, _action4);
          dispatch(_action4);
          break;
        }
      case 32:
        {
          // space
          var _action5 = { type: 'FIRE_LASER', time: time, playerID: playerID };
          dispatchToServer(playerID, _action5);
          dispatch(_action5);
          break;
        }
    }
  };
};

module.exports = { initKeyboardControlsSystem: initKeyboardControlsSystem };