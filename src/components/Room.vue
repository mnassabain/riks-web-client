<template>
    <div class="game-container">
        
      <button
          @click="onClick"
          tag="button"
          class="button menu-button room-button"
          v-bind="data.id"
        >
          {{ data.lobbyName }} - {{data.nbPlayers}}/{{data.maxPlayers}}
      </button>
        
      <div v-if="data.password !== ''" id="password-warning" v-bind:class="{ 'hidden-element': !clicked }">
        This room needs a password ! please enter the password to join the room
      </div>
        
      <input v-if="data.password !== ''" id="passwordloby" v-bind:class="{ 'hidden-element': !clicked }" type="password" placeholder="Password" v-model="password">


    </div>
</template>

<script>
import { Packet } from "../Packet.js";

export default {
    name: 'Room',
    data() {
      return {
        password: '',
        clicked: false,
      }
    },
    props: [
      'data'
    ],
    methods: {
      onClick() {
        if (!this.clicked) {
          if (this.data.password === '') {
            this.joinRoom()
          }
          else {
            this.clicked = true
          }
          return
        }

        if (this.password == '') {
          this.clicked = !this.clicked
        }
        else {
          this.joinRoom()
        }
      },

      joinRoom() {
        var params = {
          // CAUTION : dirty way to test the game flow
          // TODO : securise this access
            lobbyID: this.data.lobbyID,
            lobbyPassword: this.password
            /*lobbyID: this.item.id,
            lobbyPassword: this.passwordloby*/
        }
        this.$socket.send(new Packet("JOIN_LOBBY", params).getJson())

        /* message listener */
        this.$socket.onmessage = data => this.verify(data.data)
      },

      verify(data) {
        var response = JSON.parse(data)
        var needPassword = false

        if (response.data.error == true) {
          alert("Error: " + response.data.response)
          this.password = ''
          // needPassword = true
          return
        } else {
          delete this.$socket.onmessage;

          /* redirect user */
          // this.$router.push({ path: "/Lobby" });
          this.$emit('join');
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

.hidden-element {
  display: none;
}
</style>