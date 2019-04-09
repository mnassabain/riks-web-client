<template>
<body class="center">
  <div class="text-center col-lg-6">
    <div>
      <h1>Create your room</h1>
    </div>
    <div class="input-block">
      <input v-model="nameOfRoom" id="nameOfRoom" type="text" placeholder="Room Name">
      <input
        v-model="passwordOfRoom"
        id="passwordOfRoom"
        type="password"
        placeholder="Room Password"
      >
    </div>
    <div>
      <button @click="createGame" tag="button" class="button validate-button my-1">Create Room</button>
    </div>
    <div class="additional-button-block">
      <v-btn class="button second-button my-1" @click="Cancel">Cancel</v-btn>
    </div>
  </div>
</body>
</template>

<script>
import {Packet} from '../Packet.js'

export default {
  name: 'CreateGame',
  data () {
    return {
      nameOfRoom: '',
      passwordOfRoom: '',
      maxPlayers: ''
    }
  },
  methods: {
    createGame () {
      var params = {
        lobbyName: this.nameOfRoom,
        lobbyPassword: this.passwordOfRoom,
        maxPlayers: 8,
        mapName: ''
      }

      this.$socket.send(new Packet('CREATE_LOBBY', params).getJson())
      this.$router.push({path: '/Lobby'})
    },
    Cancel () {
      return this.$router.push({path: '/MainMenu'})
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
