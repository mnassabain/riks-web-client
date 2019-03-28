<template>
<body>
  <div class="text-center col-lg-6">
    <div class="logo-block">
      <img src="../assets/logo.svg" class="img-fluid logo">
      <h2>The game of global domination</h2>
    </div>
    <div class="buttons-block">
      <router-link to="/JoinGame" tag="button" class="button menu-button my-2">Join a game</router-link>
      <router-link to="/CreateGame" tag="button" class="button menu-button my-2">Create a game</router-link>
    </div>
    <div class="buttons-block">
      <router-link to="" tag="button" class="button settings-button my-2">Settings</router-link>
      <router-link to="/" tag="button" class="button logout-button my-2">Log Out</router-link>
    </div>
  </div>
</body>
</template>

<script>

// import _ from "howler"

export default {
  name: "MainMenu",
  data() {},
  methods: {
    // playSound() {
    //   console.log('plop')
    //   var sound = new _.Howl({ src: ['../assets/musics/The_Road_Ahead.mp3'] })
    //   sound.play()
    // }
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
