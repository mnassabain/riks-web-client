export var SupportedColors = {
  0: "#3D76E2",//blue
  1: "#DF4C4C",//red
  2: "#59AD4A",//green
  3: "#F6D63D",//yellow
  4: "#F0713C",//orange
  5: "#9367DA",//purple
};

export class Player {
  constructor(id, name, color) {
    this.displayName = name;
    this.id = id;
    this.color = SupportedColors[color];
    this.reinforcements = 0;
    this.tokens = {}
    this.nbTerritories = 0;
  }

getSupportedColors(i) {
    return SupportedColors[i]    
  }

}