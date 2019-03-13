// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import 'vuetify/dist/vuetify.min.css'
import 'raivue/dist/raivue.css'

import VueSocketio from 'vue-socket.io'
import Vuetify from 'vuetify'
import Raivue from 'raivue'
import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import App from './App'
import router from './router'
import store from './store'
import './registerServiceWorker'

// add bugsnag
import * as bugsnag from 'bugsnag-js'
import * as bugsnagVue from 'bugsnag-vue'
const bugsnagKey = false
if (bugsnagKey) {
  const bugsnagClient = bugsnag(bugsnagKey)
  bugsnagClient.use(bugsnagVue(Vue))
}

Vue.config.productionTip = false

Vue.use(Vuetify)
Vue.use(Raivue)
Vue.use(VueSocketio, "http://192.168.43.17:9002", store)

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
