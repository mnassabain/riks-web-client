import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import * as Cookies from 'js-cookie'

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
    connected: false,
    game: {},
    room: '',
    username: '',
    error: '',
    turn: ''
  },
  getters: {
  },
  mutations: {
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
    },
    set_game (state, game) {
      state.game = game
    },
    set_room (state, room) {
      state.room = room
    },
    set_username (state, username) {
      state.username = username
    },
    reset_error (state) {
      state.room = ''
      state.error = ''
    },
    reset_room (state) {
      state.game = {}
    }
  }
})
