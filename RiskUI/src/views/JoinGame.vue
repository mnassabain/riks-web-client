<template>
  <div class="row my-5">
    <div class="col-md-6 offset-md-3">
      <h1> Join a room game of Risk </h1>
      <div class="card">
        <div class="card-body">
          <h3 class="text-center my-4">Join Game</h3>
          <div class="form-group">
           <input v-model="lobbyID" id="tag" type="text" placeholder="Enter tag" class="form-control text-center">
          </div>
          <div class="form-group">
            <ul v-for="item in items" :key="item.id">
                <li>
                    <button> {{ item.text }} </button>
                </li>
            </ul>
          </div>
          <div class="form-group text-center">
            <button @click="JoinGame" tag="button" class="btn form-control btn-success text-center">Join</button>
            OR
            <router-link :to="{ path: '/CreateGame' }" class="btn btn-link">Create Game</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
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
  mounted(){
    this.$socket.send(new Packet("LOBBY_LIST").getJson());
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
