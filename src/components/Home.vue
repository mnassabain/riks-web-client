<template>
  <div class="row my-5">
    <div class="col-md-6 offset-md-3">
      <h1> Welcome to Risk game </h1>
      <div class="card">
        <div class="card-body">
          <h3 class="text-center my-4">Login</h3>
          <div class="form-group">
           <input v-model="login" type="text" placeholder="Login" class="form-control">
          </div>
          <div class="form-group">
           <input v-model="password" type="password" placeholder="Password" class="form-control">
          </div>
          <div class="form-group text-center">
            <button @click="loginUser ()" class="btn form-control btn-success">Login</button>
            <router-link :to="{ path: '/Register' }" class="btn btn-link">Register</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {
      login: '',
      password: ''
    }
  },
  methods: {
      loginUser () {
        console.log(this.login, this.password)
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
