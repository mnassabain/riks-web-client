var SupportedColors = {
    RED: "red", // TODO : replace with the corresponding color code
    GREEN: "green",
    YELLOW: "yellow",
    ORANGE: "orange",
    BLUE: "blue",
    PURPLE: "purple"
}


export class Player{
    constructor(id, name, color){
        this.displayName = name
        this.id = id
        this.color = SupportedColors[color];
    }
}