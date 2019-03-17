<template>
  <div class="row my-5">
    <div class="col-md-6 offset-md-3">
      <h1> Welcome to Risk game </h1>
      <div class="card">
        <div class="card-body">
          <h3 class="text-center my-4">Register</h3>
          <div class="form-group">
           <input id="player-pseudo" type="text" placeholder="Pseudo" class="form-control">
          </div>
          <!-- <div class="form-group">
           <input id="player-login" type="text" placeholder="Login" class="form-control">
          </div>
          <div class="form-group">
           <input id="player-login-conf" type="text" placeholder="Confirm Login" class="form-control">
          </div> -->
          <div class="form-group">
           <input id="psswd" type="password" placeholder="Password" class="form-control">
          </div>
          <div class="form-group">
           <input id="psswd-conf" type="password" placeholder="Confirm Password" class="form-control">
          </div>
          <div class="form-group text-center">
            <router-link :to="{ path: '/Login' }" tag="button" class="btn form-control btn-success">Register</router-link>
            <router-link to="/" class="btn btn-link">Login</router-link>
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
    registerUser () {
      console.log(this.pseudo, this.login, this.password)
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
