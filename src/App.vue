
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

<style>
#app {
  font-family: 'Copperplate';
  src:  url('./assets/fonts/Copperplate.ttf');
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
</style>
