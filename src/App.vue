
<template>
  <div id="app">
    <!-- <img src="./assets/logo.svg" style="width:40%"> -->
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

<style>
#app {
  font-family: 'Copperplate';
  src:  url('./assets/fonts/Copperplate.ttf');
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
