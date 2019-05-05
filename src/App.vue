<template>
  <div id="app">
    <div class="container">
      <router-view></router-view>
    </div>
    <audio autoplay>
      <source src="./assets/music/menuTheme.mp3" type="audio/mpeg">
    Your browser does not support the audio element.
    </audio>
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
  },
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
  /*margin-top: 60px;*/
  background-color: #2c3e50;
}
</style>
