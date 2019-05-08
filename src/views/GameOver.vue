<template>
<body class="center">
  <div class="text-center col-lg-6">
    <h1>{{ message }}</h1>
    <img class="gameOverIllustration" :src="setSrcImg()">
    <h2>Winner: {{ winner }}</h2>
    <div class="my-5">
      <button @click="mainMenu()" tag="button" class="button validate-button my-1">Main Menu</button>
    </div>
  </div>
</body>
</template>

<script>
export default {
  name: "GameOver",
  data() {
    return {
      winner: "",
      message: ""
    };
  },
  methods: {
    mainMenu: function() {
      this.$router.push({ path: "/MainMenu" });
    },
    setSrcImg: function() {
      this.winner = localStorage.getItem("winner");
      var myName = localStorage.getItem("login");

      if (myName === this.winner) {
        return require("@/assets/icons/medal.svg");
      } else {
        return require("@/assets/icons/grave.svg");
      }
    }
  },
  created() {
    this.winner = localStorage.getItem("winner");
    var myName = localStorage.getItem("login");

    if (myName === this.winner) {
      this.message = "Congratulations!";
    } else {
      this.message = "Game Over";
    }
  }
};
</script>

<style src="../css/Menu.css" scoped></style>
<style>
body {
  background-color: #27282d;
}
</style>