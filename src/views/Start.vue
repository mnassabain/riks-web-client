<template>
<body class="center">
  <div class="text-center col-lg-6">
    <div>
      <h1>Room</h1>
    </div>
    <div class="list">
      <!--ul v-for="item in items" :key="item.id">
        <h3>{{ item.text }}</h3>
      </ul-->
      <ul v-for="(player) in players" :key="player.id">
        <h3>{{ player }}</h3>
      </ul>
    </div>
    <div>
      <button @click="startGame" tag="button" class="button validate-button my-1">Start the Game <br/>(/!\ clic 2 times)</button>
    </div>
    <div class="additional-button-block">
      <button @click="leaveGame" tag="button" class="button second-button my-1">Cancel</button>
      <!-- <router-link to="/MainMenu" tag="button" class="button second-button my-1">Cancel</router-link> -->
    </div>
  </div>
</body>
</template>

<script>
import {Packet} from "../Packet.js";

export default {
  name: 'Start',
  data () {
    return {
      players: [],
      // items: [
      //   { id: 0, text: 'Player 1' },
      //   { id: 1, text: 'Player 2' },
      //   { id: 2, text: 'Player 3' }
      // ]
    }
  },
  // CAUTION the following must to be improved
  // TODO change button clics and messages handling behaviour
  methods: {
    startGame () {
      this.$socket.send(new Packet("START_GAME").getJson());
      console.log('send START_GAME')
    },

   leaveGame(){
       this.$socket.send(new Packet("LEAVE_GAME").getJson());
       console.log('send LEAVE_GAME')
       this.$router.push({path: "\MainMenu"})
       delete vm.$socket.onmessage;
   }
  },
  created(){
     var vm = this;
     this.$socket.send(new Packet("LOBBY_STATE").getJson());
     console.log("send LOBBY_STATE");

     this.$socket.onmessage = function(d){
        console.log(d);
        var msg = JSON.parse(d.data);
        if(msg.data.error){
            // TODO: handle error
            console.log("ERROR");
            console.log(msg)
            if(msg.type == 14)
              vm.$router.push({path: "\GameWindow"})

            delete vm.$socket.onmessage;
        }
        else{
            if(msg.type == new Packet("LOBBY_STATE").type){
                console.log("recv LOBBY_STATE");
                vm.players = msg.data.gameData.playerNames
                console.log(msg.data.gameData)
            }else if(msg.type == new Packet("START_GAME").type){
                console.log("recv START_GAME");
                //vm.players = msg.data.gameData.playerNames
                console.log(msg.data.gameData)
                this.$router.push({path: "\GameWindow"})
            }else if(msg.type == new Packet("GAME_STATUS").type){
                console.log("recv GAME_STATUS");
                //vm.players = msg.data.gameData.playerNames
                console.log(msg.data.gameData)
                this.$router.push({path: "\GameWindow"})
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