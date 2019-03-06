<template>
  <div class="row my-5">
    <div class="col-md-6 offset-md-3">
      <h1> Welcome to Risk game </h1>
      <div class="card">
        <div class="card-body">
          <div class="form-group text-center">
            <router-link to="/CreateGame" tag="button" class="btn form-control btn-success">Create Game</router-link>
          </div>
          <div class="form-group text-center">
            <router-link to="/JoinGame" tag="button" class="btn form-control btn-success">Join Game</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data () {
    return {
      pseudo: '',
      login: '',
      password: ''
    }
  },
  methods: {
    // registerUser() {
    //   console.log(this.pseudo, this.login, this.password)
    // }
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
