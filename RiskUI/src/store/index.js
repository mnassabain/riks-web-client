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
    [SOCKET_ONOPEN](state, event) {
      console.info(state, event)
      state.socket.isConnected = true
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
