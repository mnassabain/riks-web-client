<template>
<body>
  <div class="text-center col-lg-6">
    <div class="logo-block">
      <img draggable="false" src="../assets/logo.svg" class="img-fluid logo">
      <h2>The game of global domination</h2>
    </div>
    <form @submit="validateForm">
      <div class="input-block">
      <input id="user" type="text" placeholder="User Name" v-model="login">
      <input id="password" type="password" placeholder="Password" v-model="password">
      </div>
      <div>
        <button
          :to="{ path: '/MainMenu' }"
          @click="loginUser"
          tag="button"
          class="button validate-button my-1"
          type="submit"
        >Log In</button>
      </div>
    </form>
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
import { Packet } from "../Packet.js";

export default {
  name: "Home",
  data() {
    return {
      login: "",
      password: ""
    };
  },
  methods: {
    validateForm(e){
      e.preventDefault()
    },
    verify(data) {
      var response = JSON.parse(data);

      if (response.data.error == true) {
        alert("Error when connecting: " + response.data.response);
      } else {
        

        delete this.$socket.onmessage;
        /* redirect user */
        this.$router.push("/MainMenu");
      }
    },

    loginUser() {
      if (this.login === "" || this.password === "") {
        alert("please enter your login and password");
        return;
      }

      localStorage.login = this.login;
      localStorage.password = this.password;
      var params = {
        userID: this.login,
        userPassword: this.password
      };

      /* message listener */
      this.$socket.onmessage = data => this.verify(data.data);

      /* send message */
      this.$socket.send(new Packet("CONNECT", params).getJson());
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="../css/Menu.css" scoped></style>
<style>
body {
  background-color: #27282d;
}
</style>
