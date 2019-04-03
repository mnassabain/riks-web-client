import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import MainMenu from '@/views/MainMenu'
import Register from '@/views/Register'
import CreateGame from '@/views/CreateGame'
import JoinGame from '@/views/JoinGame'
import Lobby from '@/views/Lobby'
import Start from '@/views/Start'
import GameWindow from '@/views/GameWindow'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/Register', name: 'Register', component: Register },
    { path: '/MainMenu', name: 'MainMenu', component: MainMenu },
    { path: '/CreateGame', name: 'CreateGame', component: CreateGame },
    { path: '/JoinGame', name: 'JoinGame', component: JoinGame },
    { path: '/Start', name: 'Start', component: Start },
    { path: '/Lobby', name: 'Lobby', component: Lobby },
    { path: '/GameWindow', name: 'GameWindow', component: GameWindow },
  ],
});
