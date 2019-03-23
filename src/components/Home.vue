<template>
<body>
    <div class="col-lg-6">
      <img src="../assets/logo.svg" class="img-fluid" alt="Responsive image">
      <h3 class="text-center my-4">Login</h3>
      <div class="form-group">
        <input v-model="login" type="text" placeholder="Login" class="form-control">
      </div>
      <div class="form-group">
        <input v-model="password" type="password" placeholder="Password" class="form-control">
      </div>
      <div class="form-group text-center">
        <router-link
          :to="{ path: '/Login' }"
          v-on:click="loginUser"
          tag="button"
          class="button button1"
        >Login</router-link>
        <router-link :to="{ path: '/Register' }" class="button button1">Register</router-link>
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
