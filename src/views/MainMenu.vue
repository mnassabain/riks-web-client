<template>
<body>
  <div class="text-center col-lg-6">
    <div class="logo-block">
      <img src="../assets/logo.svg" class="img-fluid logo">
      <h2>The game of global domination</h2>
    </div>
    <div class="buttons-block">
      <router-link
        :to="{ path: '/JoinGame' }"
        tag="button"
        class="button menu-button my-2"
      >Join a game</router-link>
      <router-link
        :to="{ path: '/CreateGame' }"
        tag="button"
        class="button menu-button my-2"
      >Create a game</router-link>
    </div>
    <div class="buttons-block">
      <router-link :to="{ path: '' }" tag="button" class="button settings-button my-2">Settings</router-link>
      <router-link to="/" tag="button" class="button logout-button my-2">Log Out</router-link>
    </div>
  </div>
</body>
</template>

<script></script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="../css/Menu.css" scoped></style>
