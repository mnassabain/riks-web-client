<template>
<body class="center">
  <div class="text-center col-lg-6">
    <div>
      <h1>Lobby</h1>
    </div>
    <div class="rooms">
      <ul v-for="(player) in players" :key="player.id">
        <button tag="button" class="button menu-button">
          {{player}}
        </button>
      </ul>
    </div>
    <div class="additional-button-block">
        <button tag="button" class="button validate-button my-1" @click="getReady">Ready</button>
        <button tag="button" class="button second-button my-1" @click="leaveLobby">Back</button>
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
   getReady(){
       // TODO: send ready message to server
   },
   leaveLobby(){
       this.$socket.send(new Packet("LEAVE_GAME").getJson());
   }
  },
  created(){
     var vm = this;
     this.$socket.send(new Packet("LOBBY_STATE").getJson());
     this.$socket.onmessage = function(d){
        console.log("lobby state");
        console.log(d);
        var msg = JSON.parse(d.data);
        if(msg.data.error){
            // TODO: handle error
        }
        else{
            if(d.type == new Packet("LOBBY_STATE").type){
                vm.players = msg.data.gameData.playerNames;
                console.log(msg.data.gameData);
            }
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
