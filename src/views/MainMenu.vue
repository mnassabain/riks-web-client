<template>
<body>
  <div class="text-center col-lg-6">
    <div class="logo-block">
      <img draggable="false" src="../assets/logo.svg" class="img-fluid logo">
      <h2>The game of global domination</h2>
    </div>
    <div class="buttons-block">
      <router-link to="/JoinGame" tag="button" class="button menu-button my-2">Join a game</router-link>
      <router-link to="/CreateGame" tag="button" class="button menu-button my-2">Create a game</router-link>
    </div>
    <div class="buttons-block">
      <router-link to="" tag="button" class="button settings-button my-2">Settings</router-link>
      <button tag="button" class="button logout-button my-2" @click="logout">Log Out</button>
    </div>
  </div>
</body>
</template>

<script>
import {Packet} from "../Packet.js";
// import _ from "howler"

export default {
  name: "MainMenu",
  methods: {
    // playSound() {
    //   console.log('plop')
    //   var sound = new _.Howl({ src: ['../assets/musics/The_Road_Ahead.mp3'] })
    //   sound.play()
    // }
    verify(data) {
      var response = JSON.parse(data)
      if (response.data.error == true) {
        alert("Error: " + response.data.response)
        return
      } else {
        delete this.$socket.onmessage;
        /* redirect user */
        this.$router.push({ path: "/" });
      }
    },
    logout() {
      this.$socket.send(new Packet("DISCONNECT").getJson());
       /* message listener */
      this.$socket.onmessage = data => this.verify(data.data)
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
