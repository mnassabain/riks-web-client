<template>
  <div class="row my-5">
    <div class="col-md-6 offset-md-3">
      <h1> Starting Game </h1>
      <div class="card">
        <div class="card-body">
          <h3 class="text-center my-4">Players</h3>
          <div class="form-group">
           <div class="form-group">
            <ul v-for="item in items" :key="item.id">
                <li>
                    {{ item.text }}
                </li>
            </ul>
          </div>
          <div class="form-group text-center">
            <router-link :to="{ path: '/GameWindow' }" tag="button" class="btn form-control btn-success text-center">Start</router-link>
            OR
            <router-link :to="{ path: '/Home' }" class="btn btn-link">Cancel</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>

export default {
  name: 'Start',
  data () {
    return {
      items: [
        { id: 0, text: 'Player 1' },
        { id: 1, text: 'Player 2' },
        { id: 2, text: 'Player 3' }
      ]
    }
  },
  methods: {
    startGame () {
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
