// @flow

const {initState} = require('../state/initState');
const {gameReducer} = require('./gameReducer');
const {tickReducer} = require('./tickReducer');
const {modalReducer} = require('./modalReducer');
const {playerReducer} = require('./playerReducer');
const {lobbyReducer} = require('./lobbyReducer');
const {chatReducer} = require('./chatReducer');
const {animationReducer} = require('./animationReducer');

import type {State, Action} from '../types';

const rootReducer = (state: State, action: Action): State => {
  if (state === undefined) return initState();

  switch (action.type) {
    case 'CREATE_GAME':
    case 'JOIN_GAME':
    case 'START':
    case 'LOCAL_CHAT':
      return lobbyReducer(state, action);
    case 'CREATE_PLAYER':
    case 'SET_PLAYER_NAME':
    case 'SET_PLAYER_SCORE':
    case 'SET_PLAYER_READY':
      return playerReducer(state, action);
    case 'SET_MODAL':
    case 'DISMISS_MODAL':
      return modalReducer(state, action);
    case 'START_TICK':
    case 'STOP_TICK':
    case 'TICK':
      if (!state.game) return state;
      return {
        ...state,
        game: tickReducer(state.game, action),
      };
    case 'SET_TURN':
    case 'SET_THRUST':
    case 'FIRE_LASER':
    case 'FIRE_MISSILE':
    case 'MAKE_EXPLOSION':
    case 'SHIFT_TARGET':
    case 'DESTROY_MISSILE':
    case 'MAKE_ASTEROID':
    case 'DESTROY_ASTEROID':
      if (!state.game) return state;
      return {
        ...state,
        game: gameReducer(state.game, action),
      };
    case 'CHAT':
    case 'SET_CHAT':
      return chatReducer(state, action);
    case 'STEP_ANIMATION':
      if (!state.game) return state;
      return {
        ...state,
        game: animationReducer(state.game, action),
      };
  }
  return state;
};

module.exports = {rootReducer}
