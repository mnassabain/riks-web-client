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
        this.activePlayerReinforcement = 0;
        this.btnState = false ; /* for the nextPhase button */
        this.currentUserName = localStorage.name; 
        
        this.handleIncommingMessages();
        this.innerLoop();
    }

    /* dealing with nextPhase button state
       after the END_PHASE message is emitted , the server will go to the next phase
       if everything is correct 
    */
    /**
     * 
     * @param  player : player from the server after CURRENT_PHASE message
     * @param  phase : phase  from the server after CURRENT_PHASE message
     */
    nextPhaseBtnState(player, phase)
    {
        if(player.name == this.currentUserName && this.currentPhase != phase)
        {
            this.btnState = true ;
            this.currentPlayer = player ;
            this.currentPhase = phase ;
        }
        else
        {
            this.btnState = false ;
        }
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
    
    /* this function must be triggered  when the active player clicks on a territory
    to put an unit during the first phase */
    useSet(player, token1, token2, token3){

        if(0 /* check if number of tokens is greater than 4 */)
        {
            var params = {
                player : player,
                token1: token1,
                token2: token2,
                token3: token3
            } 
            this.$socket.send(new Packet('USE_TOKENS', params).getJson());
        }
    }

    /* this function must be triggered  when the active player clicks on a territory
    to put an unit during the first phase */
    useReinforcement(player, territory,unit)
    {
        if(this.currentPhase == 0 && this.activePlayerReinforcement > 0)
        {
            putUnit(player,territory,unit);
        }

    }
    putUnit(player, territory,unit){

        var params = {
            player: player,
            territory: territory,
            unit: unit
        }

        this.$socket.send(new Packet('PUT', params).getJson());

    }

    endPhase(player)
    {   
        var params =  {player: player};
        this.$socket.send(new Packet('END_PHASE',params).getJson());
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
                        this.activePlayerReinforcement += msg.unit;

                        break;

                    case Packet.getTypeOf('CURRENT_PHASE'):
                       /* nextPhaseBtnState(msg.player,msg.nextPhase) */
                       break;
                    
                    /* a PUT message implies a PUT message from the  client */
                    case Packet.getTypeOf('PUT'):
                    /*change the color of a territory */
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