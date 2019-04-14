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
    nextPhaseBtnState(phase)
    {
        if(this.currentPlayer.name == this.currentUserName && this.currentPhase != phase)
        {
            this.btnState = true ;
            this.currentPhase = phase ;
        }
        else
        {
            this.btnState = false ;
        }
    }
    
    useTokensResponse (name, units)
    {   
        /* only the active player does not see this notifcation */
        if(name != this.currentUserName)
        {
             /*return name + "has received " + units + "unit(s)" ;*/
            console.log(name + "has received " + units + " unit(s)");
        }
        else
        {   
            /* only visible by the active player */
            console.log("you have has received " + units + " unit(s)");
        }
    }

    putResponse(name,territory, units)
    {
        if(name != this.currentUserName)
        {

          /*return name + "has putted " + units + "unit(s) on" + territory ; */
          console.log(name + "has putted " + units + " unit(s) on " + territory);  
        }
        else
        {
           /*return name + "has putted " + units + "unit(s) on" + territory ; */
          console.log("you have putted " + units + " unit(s) on" + territory); 
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
    useSet(token1, token2, token3){

        if(0 /* check if number of tokens is greater than 4 */)
        {
            var params = {
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
        if(this.activePlayerReinforcement > 0)
        {
            putUnit(player,territory,unit);
        }

    }
    putUnit(territory,units){

        /* PUT message can only be emitted during phases -1 , 0 */
        if(this.currentPhase == - 1 || this.currentPhase == 0)
        {
            var params = {
                territory: territory,
                units: units
            }
    
            this.$socket.send(new Packet('PUT', params).getJson());

        }

    }

    endPhase()
    {   
        this.$socket.send(new Packet('END_PHASE').getJson());
    }

    updateReinforcement(player)
    {
        if(this.currentPhase == 0)
        {
            this.activePlayerReinforcement -- ;
        }
        
        /* if the player has used his reinforcement and he has less than 4 tokens
        send the END_PHASE message to the server */
        if(this.activePlayerReinforcement == 0)
        {
            this.endPhase();
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
                    /* get player list */
                        break;

                    case Packet.getTypeOf('REINFORCEMENT'):
                        this.activePlayerReinforcement = msg.units;

                        break;

                    case Packet.getTypeOf('CURRENT_PHASE'):
                       this.nextPhaseBtnState(msg.phase);
                       break;
                    
                    /* a PUT message implies a PUT message from the  client */
                    case Packet.getTypeOf('PUT'):
                        this.updateReinforcement();
                        /*this.putResponse(msg.player.name,msg.territory,msg.units); */
                       /*change the color of a territory during the pre-phase */
                        break;

                    case Packet.getTypeOf('USE_TOKENS'):
                        /*this.useTokensResponse(msg.player.name,msg.units); */
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