<template>
<<<<<<< HEAD
  <div class="row my-5">
    <div class="col-md-6 offset-md-3">
      <h1> Welcome to Risk game </h1>
      <div class="card">
        <div class="card-body">
          <h3 class="text-center my-4">Connect</h3>
          <div class="form-group">
           <input v-model="login" type="text" placeholder="Login" class="form-control">
          </div>
          <div class="form-group">
           <input v-model="password" type="password" placeholder="Password" class="form-control">
          </div>
          <div class="form-group text-center">
            <v-btn block large @click="connection" id="create-btn">login</v-btn>            
            <router-link :to="{ path: '/Register' }" class="btn btn-link">Register</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
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
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
=======
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
export default {
  name: "Home",
  data() {
    return {
      login: "",
      password: ""
    };
  },
  methods: {
    loginUser() {
      console.log(this.$socket);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="../css/Menu.css" scoped></style>
<style>
body {
  background-color: #27282d;
>>>>>>> fusion
}
</style>
