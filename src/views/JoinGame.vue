<template>
  <div class="row my-5">
    <div class="col-md-6 offset-md-3">
      <h1> Join a room game of Risk </h1>
      <div class="card">
        <div class="card-body">
          <h3 class="text-center my-4">Join Game</h3>
          <div class="form-group">
           <input v-model="tag" id="tag" type="text" placeholder="Enter tag" class="form-control text-center">
          </div>
          <div class="form-group">
            <ul v-for="item in items" :key="item.id">
                <li>
                    <button> {{ item.text }} </button>
                </li>
            </ul>
          </div>
          <div class="form-group text-center">
            <router-link :to="{ path: '/Start' }" tag="button" class="btn form-control btn-success text-center">Done</router-link>
            OR
            <router-link :to="{ path: '/CreateGame' }" class="btn btn-link">Create Game</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

// <div class="form-group">
//   <ul v-for="item in items" :key="item.id">
//       <li>
//           <button> {{ item.text }} </button>
//       </li>
//   </ul>
// </div>

export default {
  name: 'JoinGame',
  data () {
    return {
      items: [
        { id: 0, text: 'room1 \t 2/6' },
        { id: 1, text: 'room2 \t 4/6' },
        { id: 2, text: 'room3 \t 6/6' }
      ]
    }
  },
  methods: {
    JoinGame () {
      console.log(this.nameOfRoom, this.passwordOfRoom)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="../css/Menu.css" scoped></style>
