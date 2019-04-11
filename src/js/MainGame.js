import { Packet } from "../Packet";
import { map } from './Map';

const phases = {
    PREPHASE: -1,
    PREPARING: 0,
    ATTACK: 1,
    REINFORCEMENT: 2
};


// This function works as a controller

/*
 Start game

 Create players

 Get events from server

 Send info to server

 Make the "view" display things
*/
export class MainGame {

    constructor() {
        this.currentPhase = phases['PREPHASE'];
        this.map = map;
        this.playerList = [];
        this.currentPlayer = undefined;
        
        this.handleIncommingMessages();
        this.innerLoop();
    }

    startGame() {

    }
    
    nextPhase() {
        this.currentPhase = (this.currentPhase + 1) % 3;
    }

    sendToServer(packet) {
        this.$socket.send(packet.getJson());
    }

    synchronize() {
        this.sendToServer(new Packet('GAME_STATUS'));
    }
    
    useSet(player, token1, token2, token3){

        if(0 /* number of tokens is greater than 4 */)
        {
            var params = {
                player : player,
                token1: token1,
                token2: token2,
                token3: token3
            } 
            this.$socket.send(new Packet('USE_TOKENS', params).getJson())
        }
    }
    handleIncommingMessages(){
        this.$socket.onmessage = function(d){
            var msg = JSON.parse(d.data);
            if(msg.data.error){
                // TODO: handle error
            }
            else{
                switch (msg.type) {
                    case Packet.getTypeOf('GAME_STATUS'):
                    
                        break;

                    case Packet.getTypeOf('REINFORCEMENT'):
                        
                        break;

                    default:
                        break;
                }
            }  
         }
    }

    innerLoop(){
        this.synchronize();

        setInterval(function(){
            this.synchronize();
        },1000);
    }