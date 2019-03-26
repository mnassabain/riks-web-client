import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
<<<<<<< HEAD
import Login from '@/views/Login'
=======
import MainMenu from '@/views/MainMenu'
>>>>>>> fusion
import Register from '@/views/Register'
import CreateGame from '@/views/CreateGame'
import JoinGame from '@/views/JoinGame'
import Start from '@/views/Start'
<<<<<<< HEAD
=======
import GameWindow from '@/views/GameWindow'
>>>>>>> fusion

Vue.use(Router)

export default new Router({
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/Register', name: 'Register', component: Register },
<<<<<<< HEAD
    { path: '/Login', name: 'Login', component: Login },
    { path: '/CreateGame', name: 'CreateGame', component: CreateGame },
    { path: '/JoinGame', name: 'JoinGame', component: JoinGame },
    { path: '/Start', name: 'Start', component: Start }
=======
    { path: '/MainMenu', name: 'MainMenu', component: MainMenu },
    { path: '/CreateGame', name: 'CreateGame', component: CreateGame },
    { path: '/JoinGame', name: 'JoinGame', component: JoinGame },
    { path: '/Start', name: 'Start', component: Start },
    { path: '/GameWindow', name: 'GameWindow', component: GameWindow }
>>>>>>> fusion

  ]
})
