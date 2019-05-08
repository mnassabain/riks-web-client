<template>
<body class="center">
  <div class="container">
    <div class="row text-center">
      <div class="col">
        <div class="mb-3">
          <h1>About</h1>
        </div>
      </div>
    </div>
    <div class="row text-center">
      <div class="col">
        <h2>Client Development</h2>
        <h5>Mohamed Mousaoui</h5>
        <h5>Thomas Millot</h5>
        <h5>Freddy Nawfal</h5>
        <h5>Marco Nassabain</h5>
        <h5>Adberahmane Moussaoui</h5>
        <h5>Zhigang Peng</h5>
        <p></p>
        <h2>Server Development</h2>
        <h5>Dimitri Mlotokowski</h5>
        <h5>Yossef Rostaqi</h5>
        <h5>Raphaël Schwehr</h5>
        <h5>Marco Nassabain</h5>
        <h5>Eddy Pambou Moubogha</h5>
        <p></p>
      </div>
      <div class="col">
        <h2>Client-Server Connexion</h2>
        <h5>Marco Nassabain</h5>
        <h5>Freddy Nawfal</h5>
        <h5>Mohamed Mousaoui</h5>
        <h5>Adberahmane Moussaoui</h5>
        <h5>Raphaël Schwehr</h5>
        <h5>Eddy Pambou Moubogha</h5>
        <p></p>
        <p></p>
        <h2>Documentation</h2>
        <h5>Raphaël Schwehr</h5>
        <h5>Freddy Nawfal</h5>
        <h5>Mohamed Mousaoui</h5>
        <p></p>
      </div>
      <div class="col">
        <h2>Database</h2>
        <h5>Raphaël Schwehr</h5>
        <h5>Zhigang Peng</h5>
        <p></p>
        <h2>Graphics, Visuals & Logo</h2>
        <h4>Thomas Millot</h4>
        <p></p>
        <h2>Map by</h2>
        <h5>
          <a href="https://github.com/raddrick/risk-map-svg">Anders Riutta</a>
        </h5>
        <p></p>
        <h2>Icons by</h2>
        <h5>
          <a href="https://www.freepik.com/">Freepik,</a>
          <a href="https://www.flaticon.com/authors/prettycons">Prettycons,</a>
        </h5>
        <h5>
          <a href="https://www.flaticon.com/authors/smashicons">Smashicons,</a>
          <a href="https://www.flaticon.com/authors/becris">Becris,</a>
        </h5>
        <h5>
          <a href="https://www.flaticon.com/authors/photo3idea-studio">Photo3idea-studio</a>
        </h5>
      </div>
    </div>
    <div class="row text-center">
      <div class="col">
        <div class="mt-3">
          <router-link to="/MainMenu" tag="button" class="button second-button my-1">Main Menu</router-link>
        </div>
      </div>
    </div>
  </div>
</body>
</template>

<script>
import { Packet } from "../Packet.js";

export default {
  name: "About"
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="../css/Menu.css" scoped></style>
<style>
html,
body {
  background-color: #27282d;
}

a:link {
  color: #fdf6eb;
  background-color: transparent;
}

a:visited {
  color: #fdf6eb;
  background-color: transparent;
}
</style>
