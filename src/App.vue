<template>
  <div id="app">
    <div class="container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import Home from '@/components/Home'
import MainMenu from '@/views/MainMenu'
import Register from '@/views/Register'

export default {
  name: 'App',
  components: {
    Home,
    MainMenu,
    Register
  }
}
</script>

<script>
//this.$options.sockets.onmessage = (data) => console.log(data)
</script>



<style>
#app {
  font-family: 'Copperplate';
  src:  url('./assets/fonts/Copperplate.ttf');
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /*margin-top: 60px;*/
  background-color: #2c3e50;
}
</style>
