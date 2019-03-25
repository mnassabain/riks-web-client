<template>
<body class="center">
  <div class="text-center col-lg-6">
    <div>
      <h1>Room</h1>
    </div>
    <div class="list">
      <ul v-for="item in items" :key="item.id">
        <h3>{{ item.text }}</h3>
      </ul>
    </div>
    <div>
      <router-link to="/GameWindow" tag="button" class="button validate-button my-1">Start the Game</router-link>
    </div>
    <div class="additional-button-block">
      <router-link to="/MainMenu" tag="button" class="button second-button my-1">Cancel</router-link>
    </div>
  </div>
</body>
</template>

<script>
export default {
  name: "Start",
  data() {
    return {
      items: [
        { id: 0, text: "Player 1" },
        { id: 1, text: "Player 2" },
        { id: 2, text: "Player 3" }
      ]
    };
  },
  methods: {
    startGame() {}
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
