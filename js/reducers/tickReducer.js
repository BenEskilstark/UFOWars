// @flow

const {computeNextEntity} = require('../utils/gravity');
const {queueAdd} = require('../utils/queue');
const {subtract, distance} = require('../utils/vectors');
const {updateShip, updateProjectile} = require('../utils/updateEntities');
const {config} = require('../config');
const {sin, cos, abs, sqrt} = Math;
const {gameReducer} = require('./gameReducer');
const {invariant} = require('../utils/errors');

import type {Ship, GameState, Entity, Action} from '../types';

const tickReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'START_TICK':
      // this behavior bundled into START
      // if (!state.tickInterval) {
      //   state.tickInterval = setInterval(
      //     () => store.dispatch({type: 'TICK'}),
      //     config.msPerTick,
      //   );
      // }
      return state;
    case 'STOP_TICK':
      clearInterval(state.tickInterval);
      state.tickInterval = null;
      return state;
    case 'TICK':
      return handleTick(state);
  }
  return state;
};

/**
 * Updates the gamestate in place for performance/laziness
 */
const handleTick = (state: GameState): GameState => {
  state.time = state.time + 1;

  const {sun, planets} = state;
  const masses = [sun, ...planets];

  for (const id in state.ships) {
    updateShip(state, id, 1 /* one tick */);
    const ship: Ship = state.ships[id];
    ship.future = [];
    let futureShip = {...ship};
    while (ship.future.length < config.maxFutureSize) {
      futureShip = {...computeNextEntity(masses, futureShip)};
      ship.future.push(futureShip);
    }
  }

  // update planets
  state.planets = state.planets.map(planet => {
    const history: Array<Entity> = planet.history;
    queueAdd(history, planet, config.maxHistorySize);
    return {
      ...planet,
      ...computeNextEntity([sun], planet),
      history,
    };
  });

  // update projectiles
  for (let i = 0; i < state.projectiles.length; i++) {
    // handle missiles
    if (state.projectiles[i].type != 'missile') {
      continue;
    }
    const missile = state.projectiles[i];
    missile.age += 1;
    switch (missile.target) {
      case 'Ship': {
        let targetShip = null;
        for (const id in state.ships) {
          if (id != missile.playerID) {
            targetShip = state.ships[id];
            break;
          }
        }
        invariant(targetShip != null, 'Missile has no target ship');
        const dist = subtract(targetShip.position, missile.position);
        missile.theta = Math.atan2(dist.y, dist.x);
        break;
      }
      case 'Missile': {
        let targetMissile = null;
        for (const projectile of state.projectiles) {
          if (
            projectile.type == 'missile' &&
            projectile.playerID != missile.playerID
          ) {
            targetMissile = projectile;
            break;
          }
        }
        if (targetMissile == null) {
          break; // if no missile to target, just shoot wherever
        }
        const dist = subtract(targetMissile.position, missile.position);
        missile.theta = Math.atan2(dist.y, dist.x);
        break;
      }
      case 'Planet': {
        const targetPlanet = state.planets[0];
        const dist = subtract(targetPlanet.position, missile.position);
        missile.theta = Math.atan2(dist.y, dist.x);
        break;
      }
    }
    if (missile.age > config.missile.thrustAt && missile.fuel.cur > 0) {
      missile.fuel.cur -= 1;
      missile.thrust = config.missile.thrust;
    }

    updateProjectile(state, i, 1 /* one tick */);
  }

  // check on queued actions
  let nextState = state;
  const nextActionQueue = [];
  for (const action of state.actionQueue) {
    if (action.time == state.time) {
      nextState = gameReducer(nextState, action);
    } else {
      nextActionQueue.push(action);
    }
  }

  // projectiles colliding with sun
  let nextProjectiles = state.projectiles.filter(projectile => {
    const dist = distance(subtract(projectile.position, sun.position));
    return dist > sun.radius;
  });
  // clean up old missiles
  nextProjectiles = nextProjectiles.filter(projectile => {
    return !(projectile.type == 'missile' && projectile.age > config.missile.maxAge)
  });

  return {
    ...nextState,
    projectiles: nextProjectiles,
    actionQueue: nextActionQueue,
  };
}

module.exports = {tickReducer};
