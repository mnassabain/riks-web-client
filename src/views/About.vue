<template>
<body class="center">
  <div class="text-center col-lg-6">
    <div>
      <h1>About</h1>
    </div>
    <div></div>
    <div class="additional-button-block">
      <button class="button second-button my-1" @click="Cancel">Cancel</button>
    </div>
  </div>
</body>
</template>

<script>
export default {
  name: "About",
  data() {},
  methods: {
    Cancel() {
      return this.$router.push({ path: "/MainMenu" });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="../css/Menu.css" scoped></style>
<style>
body {
  background-color: #27282d;
}
</style>
