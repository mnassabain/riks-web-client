<template>
<body class="center">
  <div class="text-center col-lg-6">
    <div>
      <h1>Create your room</h1>
    </div>
    <div class="input-block">
      <input v-model="nameOfRoom" id="nameOfRoom" type="text" placeholder="Room Name">
      <input
        v-model="passwordOfRoom"
        id="passwordOfRoom"
        type="password"
        placeholder="Room Password"
      >
    </div>
    <div>
      <router-link to="/Start" tag="button" class="button validate-button my-1">Create Room</router-link>
    </div>
    <div class="additional-button-block">
      <router-link to="/MainMenu" tag="button" class="button second-button my-1">Cancel</router-link>
    </div>
  </div>
</body>
</template>

<script>
export default {
  name: "CreateGame",
  data() {
    return {
      nameOfRoom: "",
      passwordOfRoom: ""
    };
  },
  methods: {
    createGame() {
      console.log(this.nameOfRoom, this.passwordOfRoom);
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
