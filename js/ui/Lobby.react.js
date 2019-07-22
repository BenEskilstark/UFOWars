
const React = require('React');
const {
  getNextGameID,
  getClientPlayerID,
  getClientPlayer,
  getClientGame,
  getPlayerByID,
} = require('../selectors/selectors');
const {dispatchToServer} = require('../utils/clientToServer');
const Button = require('./Button.react');

/**
 * props: {store}
 * state: {...state.getState()}
 */

class Lobby extends React.Component {

  constructor(props) {
    super(props);
    props.store.subscribe(() => {
      this.setState({...this.props.store.getState()});
    });
    this.state = {...this.props.store.getState()};
  }

  render() {
    const state = this.state;
    const {players, games} = state;
    const clientPlayer = getClientPlayer(state);
    const clientGame = getClientGame(state);

    let hostedGame = null;
    const gameRows = [];
    for (const gameID in games) {
      if (gameID == 0) {
        continue;
      }
      const game = games[gameID];
      const host = game.players[0];
      if (host == clientPlayer.id) {
        hostedGame = (
          <div className="hostedGame">
            <p>Joined: {
              game.players.length == 2
                ? getPlayerByID(state, game.players[1]).name
                : 'None'
            }</p>
            {this.startButton()}
          </div>
        );
        continue;
      }
      const hostName = getPlayerByID(state, host).name;
      gameRows.push(
        <div className="gameRow" key={'gameRow_' + host}>
          <p>Host: {hostName}</p>
          <p># Players: {game.players.length}</p>
          <p>
            {game.started
              ? 'Game in progress'
              : this.joinButton(game.id, game.players.length > 1)
            }
          </p>
        </div>
      );
    }

    return (
      <div className="lobby">
        {this.playerNameRow()}
        {this.createButton()}
        {hostedGame}
        <div className="gameRows">
          {gameRows}
        </div>
        {this.chatBar()}
      </div>
    );
  }

  chatBar() {
    const dispatch = this.props.store.dispatch;
    const state = this.state;
    const clientPlayer = getClientPlayer(this.state);
    return (
      <div className="chatBar">
        <textarea rows={40} cols={60}
          disabled={true} readOnly={true} value={state.chat}
          style={{resize: 'none'}}
        />
        <div>
          <input
            type="text"
            size={55}
            value={state.localChat}
            onChange={(ev) => {
              dispatch({type: 'LOCAL_CHAT', message: ev.target.value});
            }}
          />
          <Button
            label="Send"
            onClick={() => {
              const chatAction = {
                type: 'CHAT',
                playerID: clientPlayer.id,
                message: state.localChat,
              };
              dispatch(chatAction);
              dispatchToServer(clientPlayer.id, chatAction);
            }}
          />
        </div>
      </div>
    );
  }

  playerNameRow() {
    const clientPlayer = getClientPlayer(this.state);
    const dispatch = this.props.store.dispatch;
    return (
      <div className="nameRow">
         Name:
         <input
            type="text"
            value={clientPlayer.name}
            onChange={(ev) => {
              const nameChangeAction = {
                type: 'SET_PLAYER_NAME',
                playerID: clientPlayer.id,
                name: ev.target.value,
              };
              dispatch(nameChangeAction);
              dispatchToServer(clientPlayer.id, nameChangeAction);
            }}
          />
      </div>
    );
  }

  startButton() {
    const state = this.state;
    const playerID = getClientPlayerID(state);
    const clientGame = getClientGame(state);
    const gameReady = clientGame.players.length == 2;
    const {dispatch} = this.props.store;
    return (
      <Button
        label="Start Game"
        onClick={() => {
          // NEVER dispatch START to yourself!
          const readyAction = {type: 'SET_PLAYER_READY', playerID, ready: true};
          dispatchToServer(playerID, readyAction);
          dispatch(readyAction);
        }}
        disabled={!gameReady}
      />
    );
  }

  createButton() {
    const gameID = getNextGameID(this.state);
    const playerID = getClientPlayerID(this.state);
    const clientGame = getClientGame(this.state);
    const {dispatch} = this.props.store;
    return (
      <div style={{margin: '4px'}}>
        <Button
          label="Create Game"
          onClick={() => {
            const createAction = {type: 'CREATE_GAME', playerID, gameID};
            dispatchToServer(playerID, createAction);
            dispatch(createAction);
          }}
          disabled={clientGame.id != 0}
        />
      </div>
    );
  }

  joinButton(gameID, disabled) {
    const playerID = getClientPlayerID(this.state);
    const {dispatch} = this.props.store;
    return (
      <Button
        label="Join Game"
        onClick={() => {
          const joinAction = {type: 'JOIN_GAME', playerID, gameID};
          dispatchToServer(playerID, joinAction);
          dispatch(joinAction);

          const readyAction = {type: 'SET_PLAYER_READY', playerID, ready: true};
          dispatchToServer(playerID, readyAction);
          dispatch(readyAction);
        }}
        disabled={disabled}
      />
    );
  }
}

module.exports = Lobby;
