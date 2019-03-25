<template>
<body class="center">
  <div class="text-center col-lg-6">
    <div>
      <h1>Rooms</h1>
    </div>
    <div class="rooms">
      <ul v-for="item in items" :key="item.id">
        <router-link to="/Start" tag="button" class="button menu-button room-button">{{ item.text }}</router-link>
      </ul>
    </div>
    <div class="additional-button-block">
      <router-link to="/MainMenu" tag="button" class="button second-button my-1">Cancel</router-link>
    </div>
  </div>
</body>
</template>

<script>
export default {
  name: "JoinGame",
  data() {
    return {
      items: [
        { id: 0, text: "room1 2/6" },
        { id: 1, text: "room2 4/6" },
        { id: 2, text: "room3 6/6" }
      ]
    };
  },
  methods: {
    JoinGame() {
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
