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
            /* only the active player sees this notification */
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


    /** Move x units from one territory to another (phase 3)
     * 
     * PRIVATE FUNCTION DO NOT USE: View should use tryFortify method!
     *
     * @param tSource: source territory; from where the units will be taken
     * @param tDest: destination territory; where the units will be placed
     * @param nbUnits: The number of units to move
     *  
    **/
    fortify(tSource,tDest, nbUnits) {
        /* continent which contains the source territory */
        var cSource = Map.getContinentOf(tSource);
        
        /* continent which contains the destination territory */
        var cDest = Map.getContinentOf(tDest);

        /* move units */
        this.map.cSource.tSource.soldiers -= nbUnits;
        this.map.cDest.tDest.soldiers += nbUnits; 
    }


    /** Try to move x units from one territory to another (phase 3)
     *
     * @param tSource: source territory; from where the units will be taken
     * @param tDest: destination territory; where the units will be placed
     * @param nbUnits: The number of units to move
     *  
    **/
    tryFortify(tSource, tDest, nbUnits) {
        /* continent which contains the source territory */
        var cSource = Map.getContinentOf(tSource);
        
        /* continent which contains the destination territory */
        var cDest = Map.getContinentOf(tDest);

        /* check if it's phase 3 */
        if (this.currentPhase != phases['FORTIFY']);

        /* check if the player controls those territories */
        if (map.cSource.tSource.player != map.cDest.tDest.player || 
            map.cSource.tSource.player != this.currentPlayer.id) {
                console.log('Action not permitted: you do not control the territories');
                return;
            }
            
        /* check if the number of units is ok */
        if (map.cSource.tSource.soldiers <= nbUnits) {
            console.log('Action not permitted: not enough units');
            return;
        }

        /* TODO: check if the territories are adjacent */

        /* if all tests pass notify server */
        var data = {
            'source': tSource,
            'destination': tDest,
            'units': nbUnits
        };

        sendToServer(new Packet('MOVE', data));
    }


    handleIncommingMessages(){
        this.$socket.onmessage = function(d){
            var msg = JSON.parse(d.data);
            if(msg.data.error){
                // print different responses of the standar server when there is an error 
                switch(msg.type)
                {
                    case Packet.getTypeOf('ATTACK'):
                        console.log(msg.type + ":" +msg.data.response);
                        break;
                    
                    case Packet.getTypeOf('CONNECT'):
                        console.log(msg.type + ":" +msg.data.response);
                        break;
                    
                    case Packet.getTypeOf('CREATE_LOBBY'):
                        console.log(msg.type + ":" +msg.data.response);
                        break;
                        
                    case Packet.getTypeOf('DEFEND'):
                        console.log(msg.type + ":" +msg.data.response);
                        break;
                        
                    case Packet.getTypeOf('DISCONNECT'):
                        console.log(msg.type + ":" +msg.data.response);
                        break;
                    
                    case Packet.getTypeOf('EDIT_LOBBY'):
                        console.log(msg.type + ":" +msg.data.response);
                        break;

                    case Packet.getTypeOf('END_PHASE'):
                        console.log(msg.type + ":" +msg.data.response);
                        break;

                    case Packet.getTypeOf('GAME_STATUS'):
                        console.log(msg.type + ":" +msg.data.response);
                        break;

                    case Packet.getTypeOf('JOIN_LOBBY'):
                        console.log(msg.type + ":" +msg.data.response);
                        break;

                    case Packet.getTypeOf('KICK_FROM_LOBBY'):
                        console.log(msg.type + ":" +msg.data.response);
                        break;

                    case Packet.getTypeOf('LEAVE_GAME'):
                        console.log(msg.type + ":" +msg.data.response);
                        break;

                    case Packet.getTypeOf('LOBBY_LIST'):
                        console.log(msg.type + ":" +msg.data.response);
                        break;

                    case Packet.getTypeOf('MOVE'):
                        console.log(msg.type + ":" +msg.data.response);
                        break;

                    case Packet.getTypeOf('PLAYER_PROFILE'):
                        console.log(msg.type + ":" +msg.data.response);
                        break;

                    case Packet.getTypeOf('PUT'):
                        console.log(msg.type + ":" +msg.data.response);
                        break;

                    case Packet.getTypeOf('SIGN_UP'):
                        console.log(msg.type + ":" +msg.data.response);
                        break;

                    case Packet.getTypeOf('START_GAME'):
                        console.log(msg.type + ":" +msg.data.response);
                        break;

                    case Packet.getTypeOf('USE_TOKENS'):
                        console.log(msg.type + ":" +msg.data.response);
                        break;
                    default:
                        break;
                }
                
            }
            else{
                switch (msg.type) {
                    
                    case Packet.getTypeOf('ATTACK'):

                        break;

                    case Packet.getTypeOf('ATTACKED'):

                        break;

                    case Packet.getTypeOf('COMBAT_RESULTS'):

                        break;

                    case Packet.getTypeOf('CURRENT_PHASE'):
                        this.nextPhaseBtnState(msg.phase);

                        break;

                    case Packet.getTypeOf('DEFEND'):
                        
                        break;

                    case Packet.getTypeOf('ERROR'):
                        //print the type of the error in the console 
                        this.ErrorHandling();
                        break;

                    case Packet.getTypeOf('GAME_OVER'):

                        break;

                    case Packet.getTypeOf('GAME_RESULTS'):

                        break;

                    case Packet.getTypeOf('GAME_STATUS'):
                        /* get player list */
                        break;

                    case Packet.getTypeOf('GIVE_TOKENS'):

                        break;

                    case Packet.getTypeOf('KICKED'):

                        break;

                    case Packet.getTypeOf('LEAVE_GAME'):

                        break;

                    case Packet.getTypeOf('LOBBY_STATE'):

                        break;

                    case Packet.getTypeOf('MOVE'):

                        fortify(msg.data.source,
                            msg.data.destination, 
                            msg.data.units);

                        break;

                    case Packet.getTypeOf('PLAYER_ELIMINATION'):

                        break;

                    case Packet.getTypeOf('PLAYER_PROFILE'):

                        break;

                    /* a PUT message implies a PUT message from the  client */
                    case Packet.getTypeOf('PUT'):
                        this.updateReinforcement();
                        /*this.putResponse(msg.player.name,msg.territory,msg.units); */
                        /*change the color of a territory during the pre-phase */

                        break;

                    case Packet.getTypeOf('REINFORCEMENT'):
                        this.activePlayerReinforcement = msg.units;
                        break;

                    case Packet.getTypeOf('START_GAME'):

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
}