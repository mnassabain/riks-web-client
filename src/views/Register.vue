<template>
<body class="center">
  <div class="text-center col-lg-6">
    <div>
      <h1>Register</h1>
    </div>
    <div class="input-block">
      <input id="user" type="text" placeholder="User Name">
      <input id="password" type="password" placeholder="Password">
      <input id="psswd-conf" type="password" placeholder="Confirm password">
    </div>
    <div>
      <button
        @click="registerUser"
        tag="button"
        class="button validate-button my-1"
      >Register</button>
    </div>
    <div class="additional-button-block">
      <h3>Already have an account?</h3>
      <router-link to="/" tag="button" class="button second-button my-1">Log In</router-link>
    </div>
  </div>
</body>
</template>

<script>
import {Packet} from "../Packet.js";

export default {
  name: 'Register',
  data () {
    return {
      login: '',
      password: ''
    }
  },
  methods: {
    registerUser () {
      var params = {
        userID: this.login,
        userPassword: this.password,
      };

      this.$socket.send(new Packet("SIGN_UP", params).getJson());
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
