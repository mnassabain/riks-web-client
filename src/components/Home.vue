<template>
<body>
    <div class="col-lg-5">
      <img src="../assets/logo.svg" class="img-fluid mb-2" alt="Responsive image">
      <h1 class="text-center mb-4">The game of global domination</h1>
      <div class="form-group my-3 mt-5">
        <input v-model="login" type="text" class="my-1" placeholder="LogIn">
        <input v-model="password" type="password" class="my-1 mb-2" placeholder="Password">
      </div>
      <div class="text-center mt-4">
        <router-link
          :to="{ path: '/Login' }"
          v-on:click="loginUser"
          tag="button"
          class="button login-button my-1"
        >Log In</router-link>
      </div>
      <div class="text-center mt-5">
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
