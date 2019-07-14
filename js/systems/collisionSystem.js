// no flow checking cuz it's annoying

const {subtract, distance} = require('../utils/vectors');
const {config} = require('../config');
const {getPlayerByID, getClientPlayerID} = require('../selectors/selectors');
const {dispatchToServer} = require('../utils/clientToServer');
const React = require('React');
const Button = require('../ui/Button.react');

import type {Store} from '../types';

const initCollisionSystem = (store: Store): void => {

  let time = store.getState().game.time;
  const {dispatch} = store;
  store.subscribe(() => {
    const state = store.getState();
    // only check on a new tick
    if (state.game.time == time || state.game.tickInterval == null) {
      return;
    }
    time = state.game.time;

    // ship collides with sun
    let gameOver = false;
    let message = '';
    let loserID = null;
    const {sun} = state.game;
    for (const id in state.game.ships) {
      const ship = state.game.ships[id];
      const distVec = subtract(ship.position, sun.position);
      const dist = distance(distVec);
      if (dist < sun.radius) {
        gameOver = true;
        message = getPlayerByID(state, id).name + ' ran into the sun!';
        loserID = id;
      }
    }

    // ship collides with projectile
    for (const id in state.game.ships) {
      for (const projectile of state.game.projectiles) {
        const ship = state.game.ships[id];
        const distVec = subtract(ship.position, projectile.position);
        const dist = distance(distVec);
        // don't get hit by your own laser you just fired
        if (dist < config.laserSpeed &&
          !(projectile.playerID == id && projectile.history.length < 5)
        ) {
          gameOver = true;
          message = getPlayerByID(state, id).name + ' was hit by a ' + projectile.type + '!';
          loserID = id;
        }
      }
    }

    if (gameOver) {
      console.log('gameover', message);
      const thisClientID = getClientPlayerID(state);
      // stop game
      const readyAction = {type: 'SET_PLAYER_READY', playerID: thisClientID, ready: false};
      dispatchToServer(thisClientID, readyAction);
      dispatch(readyAction);
      dispatch({type: 'STOP_TICK'});
      // update scores
      for (const id in state.game.ships) {
        const player = getPlayerByID(state, id);
        if (player.id != loserID) {
          dispatch({type: 'SET_PLAYER_SCORE', playerID: player.id, score: player.score + 1});
        }
      }
      // dispatch modal with message
      const winOrLose = thisClientID == loserID ? 'You Lose!' : 'You Win!';
      dispatch({
        type: 'SET_MODAL', title: winOrLose, text: message,
        buttons: [
          <Button
            label="Play Again"
            onClick={() => {
              dispatch({type: 'DISMISS_MODAL'});
              const setReadyAction = {
                type: 'SET_PLAYER_READY',
                playerID: thisClientID,
                ready: true,
              };
              dispatchToServer(thisClientID, setReadyAction);
              dispatch(setReadyAction);
            }}
          />,
        ],
      });
    }
  });
}

module.exports = {initCollisionSystem};
