<template>
<body class="center">
  <div class="text-center col-lg-6">
    <div>
      <h1>Lobby</h1>
    </div>
    <div class="rooms">
      <ul v-for="(player) in players" :key="player.id">
        <button tag="button" class="button player-button">{{player}}</button>
      </ul>
    </div>
    <div>
      <button tag="button" class="button validate-button my-1" @click="getReady" v-if="myId == players[0]">
        Start
      </button>

      <h3 v-else>
        Waiting for host to start game...                
      </h3>
    </div>
    <div class="additional-button-block">
      <button tag="button" class="button second-button my-1" @click="leaveLobby">Back</button>
    </div>
  </div>
</body>
</template>

<script>
import { Packet } from "../Packet.js";

export default {
  name: "Lobby",
  data() {
    return {
      players: [],
      myId: undefined
    };
  },
  methods: {
    getReady() {
      // msgType READY to add
      this.$socket.send(new Packet("START_GAME").getJson());
    },
    leaveLobby() {
      this.$socket.send(new Packet("LEAVE_GAME").getJson());
      this.$router.push({ path: "/MainMenu" });
    }
  },
  created() {
    this.myId = localStorage.getItem('login')

    var vm = this;
    this.$socket.send(new Packet("LOBBY_STATE").getJson());
    this.$socket.onmessage = function(d) {
      console.log("lobby state");
      console.log(d);
      var msg = JSON.parse(d.data);
      if (msg.data && msg.data.error === true) {
        alert(msg.data.response)
        return
      } else {
        if (msg.type == Packet.prototype.getTypeOf("LOBBY_STATE")) {
          vm.players = msg.data.gameData.playerNames;
          console.log(msg.data.gameData);
        } else if (msg.type == Packet.prototype.getTypeOf("LEAVE_GAME")) {
          delete vm.$socket.onmessage;
          vm.$router.push({ path: "/MainMenu" });
        } else if (msg.type == Packet.prototype.getTypeOf("START_GAME")) {
          delete vm.$socket.onmessage;
          vm.$router.push({ path: "/GameWindow" });
        }
      }
    };
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
