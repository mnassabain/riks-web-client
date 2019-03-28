<template>
<body class="center">
  <div class="text-center col-lg-6">
    <div>
      <h1>Rooms</h1>
    </div>
    <div class="rooms">
      <ul v-for="item in items" :key="item.id">
        <button @click="JoinGame" tag="button" class="button menu-button room-button">{{ item.text }}</button>
      </ul>
    </div>
    <div class="additional-button-block">
      <router-link to="/MainMenu" tag="button" class="button second-button my-1">Cancel</router-link>
    </div>
  </div>
</body>
</template>

<script>

import {Packet} from "../Packet.js";

export default {
  name: 'JoinGame',
  data () {
    return {
      items: [
        { id: 0, text: 'room1 \t 2/6' },
        { id: 1, text: 'room2 \t 4/6' },
        { id: 2, text: 'room3 \t 6/6' }
      ],
      lobbyID: '',
      lobbyPassword: ''
    }
  },
  methods: {
    JoinGame () {
      var params = {
        playerID: "",
        lobbyID: this.lobbyID,
        lobbyPassword: this.lobbyPassword
      };
      this.$socket.send(new Packet("JOIN_LOBBY", params).getJson());
    }
  },
  // created(){
  //   this.$socket.send(new Packet("LOBBY_LIST").getJson());
  //   this.$socket.onmessage = function(d){
  //     var msg = JSON.parse(d.data);
  //     if(!msg.data.error){
  //       this.$set(this.items, msg.data.gameList);
  //     }
  //   }
  // }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="../css/Menu.css" scoped></style>
<style>
body {
  background-color: #27282d;
}
</style>
