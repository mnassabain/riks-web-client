<template>
<body class="center">
  <div class="text-center col-lg-6">
    <div>
      <h1>Register</h1>
    </div>
    <div class="input-block">
      <input id="user" type="text" placeholder="User Name" v-model="login">
      <input id="password" type="password" placeholder="Password" v-model="password">
      <input id="psswd-conf" type="password" placeholder="Confirm password" v-model="passwordConfirm">
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
import {Packet} from '../Packet.js'

export default {
  name: 'Register',
  data () {
    return {
      login: '',
      password: '',
      passwordConfirm: ''
    }
  },
  methods: {
      verify(data) {
      var response = JSON.parse(data)

      if (response.data.error == true)
      {
        alert('Error when registring: ' + response.data.response)
        return
      }
      else
      {
        delete this.$socket.onmessage
        /* redirect user */
        this.$router.push('/')
      }
    },

    registerUser () {
      if (this.password != this.passwordConfirm)
      {
        alert('Password is wrong ! please try again')
        return
      }

      var params = {
        userID: this.login,
        userPassword: this.password
      }
      this.$socket.send(new Packet('SIGN_UP', params).getJson())
      
      /* message listner */
      this.$socket.onmessage = (data) => this.verify(data.data)
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
