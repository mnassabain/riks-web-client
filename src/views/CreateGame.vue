<template>
  <div class="row my-5">
    <div class="col-md-6 offset-md-3">
      <h1> Create a new Risk game </h1>
      <div class="card">
        <div class="card-body">
          <h3 class="text-center my-4">Create your room</h3>
          <div class="form-group">
           <input v-model="nameOfRoom" type="text" placeholder="Name of the room" class="form-control text-center">
          </div>
          <div class="form-group">
           <input id="passwordOfRoom" v-model="passwordOfRoom" type="password" placeholder="Password of the room" class="form-control text-center">
          </div>
          <div class="form-group">
           <input id="numberOfPlayers" type="number" min="2" max="6" class="form-control text-center" value="2">
          </div>
          <div class="form-group text-center">
            <router-link :to="{ path: '/Start' }" tag="button" class="btn form-control btn-success text-center">Done</router-link>
            OR
            <router-link :to="{ path: '/JoinGame' }" class="btn btn-link">Join game</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreateGame',
  data () {
    return {
      nameOfRoom: '',
      passwordOfRoom: ''
    }
  },
  methods: {
    createGame () {
      console.log(this.nameOfRoom, this.passwordOfRoom)
    }
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
