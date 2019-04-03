<template>
<body class="center">
  <div class="text-center col-lg-6">
    <div>
      <h1>Lobby</h1>
    </div>
    <div class="rooms">
      <ul v-for="(player) in players" :key="player.id">
        <button tag="button" class="button menu-button room-button">
          {{player}}
        </button>
      </ul>
    </div>
    <div class="additional-button-block">
      <router-link to="/MainMenu" tag="button" class="button second-button my-1">Back</router-link>
    </div>
  </div>
</body>
</template>

<script>

import {Packet} from "../Packet.js";

export default {
  name: 'Lobby',
  data () {
    return {
      players: [],
    }
  },
  methods: {
   
  },
  created(){
     var vm = this;
     this.$socket.send(new Packet("LOBBY_STATE").getJson());
     this.$socket.onmessage = function(d){
         console.log("lobby state");
         console.log(d);
       var msg = JSON.parse(d.data);
       if(!msg.data.error){
         vm.players = msg.data.gameData.playerNames;
         console.log(msg.data.gameData);
       }
     }
   }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="../css/Menu.css" scoped></style>
<style>
body {
  background-color: #27282d;
}
</style>
