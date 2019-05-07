<template>
<body class="center">
  <div class="text-center col-lg-6">
    <div>
      <h1>Rooms</h1>
    </div>
    <div class="rooms">

      <room v-for="item in items" :key="item.id" :data="item"
        @join="joinRoom()" class="lobby-list-room"/>
      
      
      <!-- <ul v-for="(item) in items" :key="item.id"> -->
        <!-- <button
          v-on:click="JoinGame(item.lobbyID)"
          tag="button"
          class="button menu-button room-button"
          v-bind="item.id"
        >{{ item.lobbyName }} - {{item.nbPlayers}}/{{item.maxPlayers}}</button>
        <div v-if="item.password !== ''">This room needs a password ! please enter the password to join the room</div>
        <input v-if="item.password !== ''" id="passwordloby" type="password" placeholder="Password" v-model="password"> -->
      <!-- </ul> -->
    </div>
    <div class="additional-button-block">
      <router-link to="/MainMenu" tag="button" class="button second-button my-1">Cancel</router-link>
    </div>
  </div>
</body>
</template>

<script>
import { Packet } from "../Packet.js";
import Room from '@/components/Room.vue';

export default {
  name: "JoinGame",
  components: {
    'room': Room,
  },
  data() {
    return {
      items: [],
      password: '',
    };
  },
  methods: {
    // verify(data) {
    //   var response = JSON.parse(data)
    //   var needPassword = false
    //   if (response.data.error == true) {
    //     //alert("Error: " + response.data.response)
    //     needPassword = true
    //     return
    //   } else {
    //     delete this.$socket.onmessage;

    //     /* redirect user */
    //     this.$router.push({ path: "/Lobby" });
    //   }
    // },
    // JoinGame(item) {
    //   var params = {
    //   // CAUTION : dirty way to test the game flow
    //   // TODO : securise this access
    //     lobbyID: item,
    //     lobbyPassword: this.password
    //     /*lobbyID: this.item.id,
    //     lobbyPassword: this.passwordloby*/
    //   }
    //   this.$socket.send(new Packet("JOIN_LOBBY", params).getJson())

    //   /* message listener */
    //   this.$socket.onmessage = data => this.verify(data.data)
    // },

    joinRoom() {
      this.$router.push({ path: "/Lobby" });
    }
  },
  created() {
    var vm = this
    this.$socket.send(new Packet("LOBBY_LIST").getJson())
    this.$socket.onmessage = function(d) {
      var msg = JSON.parse(d.data)
      if (!msg.data.error) {
        vm.items = msg.data.gameList
        console.log(msg.data.gameList)
      }
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
