// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import 'vuetify/dist/vuetify.min.css'
import 'raivue/dist/raivue.css'
import Vuetify from 'vuetify'
import Raivue from 'raivue'
import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import VueNativeSock from 'vue-native-websocket'
import App from './App'
import router from './router'
import store from './store'
import {
  SOCKET_ONOPEN,
  SOCKET_ONCLOSE,
  SOCKET_ONERROR,
  SOCKET_ONMESSAGE,
  SOCKET_RECONNECT,
  SOCKET_RECONNECT_ERROR
} from './store/mutation-type'

const mutations = {
  SOCKET_ONOPEN,
  SOCKET_ONCLOSE,
  SOCKET_ONERROR,
  SOCKET_ONMESSAGE,
  SOCKET_RECONNECT,
  SOCKET_RECONNECT_ERROR
}


// D3 library
import * as d3 from 'd3'

// import * as howler from 'howler'

// add bugsnag
import * as bugsnag from 'bugsnag-js'
import * as bugsnagVue from 'bugsnag-vue'
const bugsnagKey = false
if (bugsnagKey) {
  const bugsnagClient = bugsnag(bugsnagKey)
  bugsnagClient.use(bugsnagVue(Vue))
}

Vue.config.productionTip = false

Vue.use(d3);
Vue.use(Vuetify)
Vue.use(Raivue)
Vue.use(VueNativeSock, `ws://localhost:9002`, {
  reconnection: true,
  format: 'json', 
  store: store,
  mutations: mutations })

new Vue({
  router,
  store,
  render: h => h(App),
  beforeCreate () {
    // before creating vue app, check if current path doesn't match stored path
    // check if store contains a route first
    if (this.$store.state.route && (this.$route.path !== this.$store.state.route.path)) {
      this.$router.push(this.$store.state.route.path)
    }
    // vue router sync with vuex
    sync(store, router) // done. Returns an unsync callback fn
  }
}).$mount('#app')

Vue.use(d3)
// Vue.use(howler)
