<template>
<body>
  <div class="text-center col-lg-5">
    <div class="logo-block">
      <img src="../assets/logo.svg" class="img-fluid logo">
      <h2>The game of global domination</h2>
    </div>
    <div class="input-block">
      <input v-model="login" type="text" placeholder="LogIn">
      <input v-model="password" type="password" placeholder="Password">
    </div>
    <div class="login-bu">
      <router-link
        :to="{ path: '/Login' }"
        v-on:click="loginUser"
        tag="button"
        class="button login-button my-1"
      >Log In</router-link>
    </div>
    <div class="register-block">
      <h3>Not registered yet?</h3>
      <router-link :to="{ path: '/Register' }" class="button register-button my-1">Register</router-link>
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
      this.$socket.emit("test", { data: "test1" });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="../css/Menu.css" scoped></style>
