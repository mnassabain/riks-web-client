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
      <button @click="createGame" class="button validate-button my-1">Create Room</button>
    </div>
    <div class="additional-button-block">
      <button class="button second-button my-1" @click="Cancel">Cancel</button>
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
    verify(data) {
      var response = JSON.parse(data)
      if (response.data.error == true) {
        alert("Error: " + response.data.response)
        return
      } else {
        delete this.$socket.onmessage;

        /* redirect user */
        this.$router.push({ path: "/Lobby" });
      }
    },
    createGame () {
      var params = {
        lobbyName: this.nameOfRoom,
        lobbyPassword: this.passwordOfRoom,
        maxPlayers: 6,
        mapName: 'standard'
      }

      this.$socket.send(new Packet('CREATE_LOBBY', params).getJson())
      //this.$router.push({path: '/Lobby'})

       /* message listener */
      this.$socket.onmessage = data => this.verify(data.data)
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
