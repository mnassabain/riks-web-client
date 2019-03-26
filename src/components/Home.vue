<template>
<body>
  <div class="text-center col-lg-6">
    <div class="logo-block">
      <img src="../assets/logo.svg" class="img-fluid logo">
      <h2>The game of global domination</h2>
    </div>
    <div class="input-block">
      <input id="user" type="text" placeholder="User Name">
      <input id="password" type="password" placeholder="Password">
    </div>
    <div>
      <router-link
        :to="{ path: '/MainMenu' }"
        v-on:click="loginUser"
        tag="button"
        class="button validate-button my-1"
      >Log In</router-link>
    </div>
    <div class="additional-button-block">
      <h3>Not registered yet?</h3>
      <router-link
        :to="{ path: '/Register' }"
        tag="button"
        class="button second-button my-1"
      >Register</router-link>
    </div>
  </div>
</body>
</template>

<script>
import {Packet} from "../Packet.js";

export default {
  name: 'Home',
  data () {
    return {
      login: '',
      password: ''
    }
  },
  methods: {
    connection() {
      localStorage.login = this.login
      localStorage.password = this.password
      var params = {
        userID: this.login,
        userPassword: this.password,
      };
      this.$socket.send(new Packet("CONNECT", params).getJson())
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="../css/Menu.css" scoped></style>
<style>
body {
  background-color: #27282d;
}
</style>
