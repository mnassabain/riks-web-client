<template>
  <div id="app">
    <img src="./assets/Logo.svg" style="width:40%; margin-top:60px">
    <div class="container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import Home from '@/components/Home'
import Login from '@/views/Login'
import Register from '@/views/Register'

export default {
  name: 'App',
  components: {
    Home,
    Login,
    Register
  }
}
</script>

<script>
this.$options.sockets.onmessage = (data) => console.log(data)

</script>



<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /*margin-top: 60px;*/
  background-color: #2c3e50
}
</style>
