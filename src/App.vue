<template>
  <div id="app">
    <div class="container">
      <router-view></router-view>
    </div>

    <span id="audio">
      <audio autoplay loop id="bg-music" >
        <source src="./assets/music/gameTheme.mp3" type="audio/mpeg" v-if="$route.name === 'GameWindow'">
        <source src="./assets/music/menuTheme.mp3" type="audio/mpeg" v-else>
        <!-- <source> -->
      Your browser does not support the audio element.
      </audio>
    </span>
    

    
    
  </div>
  
</template>

<script>
import Home from '@/components/Home'
import MainMenu from '@/views/MainMenu'
import Register from '@/views/Register'
import { watch } from 'fs';


export default {
  name: 'App',
  components: {
    Home,
    MainMenu,
    Register
  },
  data(){
    return {
      audio: undefined,
    }
  },
  mounted(){
    this.audio = document.getElementById("bg-music")
    this.audio.volume = 0.1
    
  },
  watch: {
    $route (to, from){
        if(to.name == "GameWindow"){
          this.audio.pause()
          this.audio.load()
          this.audio.play()
        }
    }
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
  /*margin-top: 60px;*/
  background-color: #2c3e50;
}
</style>
