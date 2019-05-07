<template>
    <div class="game-over-container">
        <h1>{{ message }}</h1>
        <h2>Winner: {{ winner }}</h2>
        <router-link to="/">Main Menu</router-link>
    </div>
</template>

<script>
export default {
    name: 'GameOver',
    data() {
        return {
            winner: '',
            message: '',
        }
    },
    created() {
        this.winner = localStorage.getItem('winner')
        var myName = localStorage.getItem('login')

        if (myName === this.winner) {
            this.message = 'Congratulations!'
        }
        else {
            this.message = 'Game Over'
        }
    }
}
</script>

<style src="../css/Menu.css" scoped></style>
<style>

body {
  background-color: #27282d;
}

.game-over-container 
{
    height: 100%;
    width: 100%;
    box-sizing: border-box;
}

.game-over-container h1
{
    color: white;
}

.game-over-container h2
{
    color: white;
}
</style>