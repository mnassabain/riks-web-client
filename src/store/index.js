import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import * as Cookies from 'js-cookie'
import {
  SOCKET_ONOPEN,
  SOCKET_ONCLOSE,
  SOCKET_ONERROR,
  SOCKET_ONMESSAGE,
  SOCKET_RECONNECT,
  SOCKET_RECONNECT_ERROR
} from './mutation-type'

Vue.use(Vuex)
const inFifteenMinutes = new Date(new Date().getTime() + 15 * 60 * 1000)

export default new Vuex.Store({
  plugins: [createPersistedState({
    storage: {
      getItem: key => Cookies.get(key),
      // Please see https://github.com/js-cookie/js-cookie#json, on how to handle JSON.
      setItem: (key, value) => Cookies.set(key, value, { expires: inFifteenMinutes }),
      removeItem: key => Cookies.remove(key)
    }
  })],
  state: {
    socket: {
      isConnected: false,
      message: '',
      reconnectError: false,
    }
  },
  mutations: {
<<<<<<< HEAD
    [SOCKET_ONOPEN](state, event) {
      console.info(state, event)
      state.socket.isConnected = true
=======
<<<<<<<< HEAD:src/store/index.js
    SOCKET_CONNECT (state) {
      console.log('Connected')
      state.connected = true
    },
    SOCKET_DISCONNECT (state) {
      console.log('Disconnected')
      state.connected = false
    },
    SOCKET_MESSAGE (state, message) {
      state.game = message
      state.turn = message.starting_color
      state.room = message.game_id
      state.error = null
    },
    SOCKET_JOIN_ROOM (state, message) {
      state.error = null
      state.room = message.room
    },
    SOCKET_ERROR (state, message) {
      state.error = message.error
      console.log(message)
    },
    set_turn (state, team) {
      state.turn = team
========
    [SOCKET_ONOPEN](state, event) {
      console.info(state, event)
      state.socket.isConnected = true
>>>>>>>> fusion:RiskUI/src/store/index.js
>>>>>>> fusion
    },
    [SOCKET_ONCLOSE](state, event) {
      state.socket.isConnected = false
    },
    [SOCKET_ONERROR](state, event) {
      console.error(state, event)
    },
    // default handler called for all methods
    [SOCKET_ONMESSAGE](state, message) {
      console.log("===== MESSAGE =====");
      console.log(message);
      state.socket.message = message
    },
    // mutations for reconnect methods
    [SOCKET_RECONNECT](state, count) {
      console.info(state, count)
    },
    [SOCKET_RECONNECT_ERROR](state) {
      state.socket.reconnectError = true;
    }
  }
})
