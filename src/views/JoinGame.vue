<template>
<body class="center">
  <div class="text-center col-lg-6">
    <div>
      <h1>Rooms</h1>
    </div>
    <div class="rooms">

      <room v-for="item in items" :key="item.id" :data="item"
        @join="joinRoom()" class="lobby-list-room"/>
      
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
