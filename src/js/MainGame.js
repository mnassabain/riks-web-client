import { Packet } from "../Packet";
import { map, getContinentOf, areAdjacent } from './Map';
import { Player } from './Player.js'

const phases = {
    PREPHASE: -1,
    REINFORCEMENT: 0,
    OFFENSE: 1,
    FORTIFICATION: 2
};

/* To store the GameWindow view */
var view

// This function works as a controller

/*
 Start game

 Create players

 Get events from server

 Send info to server

 Make the "view" display things
*/
export class MainGame {
    constructor(v) {
        this.currentPhase = phases['PREPHASE'];
        this.map = map;
        this.playerList = [];
        this.currentPlayer = undefined;
        this.activePlayerReinforcement = 0;
        this.btnState = false ; /* for the nextPhase button */
        this.currentUserName = localStorage.name;

        // copy of the object DynamicGameWindow
        view = v
        this.$socket = view.$socket
        //console.log('view object received')
        //console.log(view)

        this.handleIncommingMessages();
        v.$socket.send(new Packet("GAME_STATUS").getJson());

        //this.innerLoop();
    }

    /**
     * Sets game data with informations sent by server via GAME_STATUS message
     *
     * @param data : data sent by server
     */
    static setGameData(data){
        this.gameData = data
        this.players = this.gameData.players
        // console.log('gameData')
        // console.log(this.gameData)

        //Setting the first player according to server data
        //console.log(this.gameData.activePlayer)
        this.firstPlayer = this.gameData.activePlayer;
        this.currentPlayer = this.firstPlayer;
        
        

        /* Set the player localstorage */
        MainGame.setPlayerLocalStorage(data)

        /* Update the view's players array */
        MainGame.updateViewPlayers(data)

        console.log('players')
        console.log(view.players)

        MainGame.setMapData(data)

        this.startGame()
    }

    static setPlayersData(data){

    }


    /**
     * Sets the player localStorage with data matching his name in the array
     *
     * @param data : data sent by the server
     */
    static setPlayerLocalStorage(data){
        for(var i = 0; i <data.players.length; i++){
            if(this.gameData.players[i].name == localStorage.login){
                //console.log('match')
                //console.log(this.players[i].name)
                localStorage.setItem('myId', i)
                localStorage.setItem('myColor', Player.getSupportedColors(i))
                localStorage.setItem('reinforcements', data.players[i].reinforcements)
                localStorage.setItem('territories', 0)
                localStorage.setItem('token1', data.players[i].tokens.tok1)
                localStorage.setItem('token2', data.players[i].tokens.tok2)
                localStorage.setItem('token3', data.players[i].tokens.tok3)
                localStorage.setItem('tokenJoker', data.players[i].tokens.tok4)
                console.log('localstorage')
                console.log(localStorage)
            }else{
                //console.log('no match found')
            }
        }
    }

    /**
     * Update the players list of the DynamicGameWindow view
     *
     * @param data : data sent by the server
     */
    static updateViewPlayers(data){
        view.players = data.players
        console.log('players')
        console.log(view.players)
    }

    static setMapData(data){
        console.log('data.board')
        console.log(data.board)
        var i = 0;
        Object.keys(map).forEach(key => {
            var continentName = map[key]
            for(var countries in continentName){
                if(typeof data.board[i] !== 'undefined' && typeof data.board[i].terId !== 'undefined'){
                    console.log(countries)
                    console.log(data.board[i].terId)
                }
                i++
            }            
        })
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

    /*Response to PUT event*
     *
     * @param name  the name of the active player
     * @param units the quantity of units placed on the map
     */
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
        console.log('startGame function')
        GameWindow.diplayMessage('Welcome to RiKS World!')
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
    /**
     *
     * @param token1  first token
     * @param token2  second token
     * @param token3  third token
     */
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
    /**
     *
     * @param player  the player's id
     * @param territory  the territory to put unit
     * @param unit  the number of unit
     */
    useReinforcement(player, territory,unit)
    {
        if(this.activePlayerReinforcement > 0)
        {
            putUnit(player,territory,unit);
        }
    }

    /**
     *
     * @param territory  the targeted territory
     * @param units  the number of units
     */
   putUnit(territory , units) {


        /* PUT message can only be emitted during phases -1 , 0 */
        if(this.currentPhase == 0)
        {
          var continent  = getContinentOf(territory);
          var data = { territory: territory, units: units };

          if(this.map[continent][territory].player !=  this.currentPlayer.id)
          {
                console.log("you are not the owner's territrory . you cannot put units here ");
          }
          else
          {
            this.$socket.send(new Packet('PUT', data).getJson());
          }

        }
    }


    endPhase()
    {
        this.$socket.send(new Packet('END_PHASE').getJson());
    }

    /**
     *
     * @param player  the active player
     */
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

    /** Try to launch an attack
     *
     * @param tSource the attacking territory
     * @param tDest the defending territory
     * @param nbUnits the number of attacking units
     *
     * @return 0 if no problem, -1 if there is problem
     */
    tryAttack(tSource, tDest, nbUnits) {
        var cSource = getContinentOf(tSource);
        var cDest = getContinentOf(tDest);

        /* check phase */
        if (this.currentPhase != phases['OFFENSE']) {
            console.log('Action not permitted: incorrect phase');
            return -1;
        }

        /* check if the player controls the attacking territory territories */
        if (this.map[cSource][tSource].player != this.currentPlayer.id) {
            console.log('Action not permitted: you do not control the territory');
            return -1;
        }

        /* check if the attacked territory doesn't belong to the attacking player */
        if (this.map[cDest][tDest].player == this.map[cSource][tSource]) {
            console.log('Action not permitted: cannot attack own territory');
            return -1;
        }

        /* check if the number of units is ok */
        if (this.map[cSource][tSource].soldiers <= nbUnits) {
            console.log('Action not permitted: not enough units');
            return -1;
        }

        /* check if the territories are adjacent */
        if (!areAdjacent(tSource, tDest)) {
            console.log('Action not permitted: territories not adjacent');
            return -1;
        }

        /* if all tests pass notify server */
        var data = {
            'source': tSource,
            'destination': tDest,
            'units': nbUnits
        };

        sendToServer(new Packet('ATTACK', data));

        return 0;
    }

    /** Called when an attack is happening
     *
     * PRIVATE METHOD: DO NOT CALL FROM VIEW
     *
     * @param tSource attacking territory
     * @param tDest attacked territory
     * @param nbUnits number of attacking units
     */
    attack(tSource, tDest, nbUnits) {
        /* display that an attack is happening */
        console.log('Attack started from ' + tSource + ' onto ' + tDest +
            ' with ' + nbUnits + ' units');
    }


    /** Called when the player is being attacked
     *
     * PRIVATE METHOD: DO NOT CALL FROM VIEW
     *
     * @param nbUnits number of attacking units
     */
    attacked(nbUnits) {
        /* display that the player is being attacked, let him defend */
        console.log('You are being attacked with ' + nbUnits);
    }


    /** Try to defend territory
     *
     * @param tDest defending territory (maybe not necessary?)
     * @param nbUnits number of units chosen to defend
     *
     * @return 0 if no problem, -1 if there is problem
     */
    tryDefend(tDest, nbUnits) {
        var cDest = getContinentOf(tDest);

        /* check if the territory has the number of units */
        if (this.map[cDest][tDest].soldiers < nbUnits) {
            console.log('Action not permitted: not enough units');
            return -1;
        }

        /* check if the player owns the territory ? */

        /* notify server */
        var data = {
            'units': nbUnits
        };

        this.sendToServer(new Packet('DEFEND', data));

        return 0;
    }

    /** Called when a player is defending
     *
     * PRIVATE METHOD: DO NOT CALL FROM VIEW
     *
     * @param defender defending player
     * @param nbUnits number of defending units
     */
    defend(defender, nbUnits) {
        /* show that the player is defending */
        console.log('Player ' + defender + ' is defending with ' + nbUnits +
            ' units');
    }

    /** Called when we receive combat results
     *
     * PRIVATE METHOD: DO NOT CALL FROM VIEW
     *
     * @param tSource attacking territory
     * @param tDest defending territory
     * @param attackerLoss unit loss
     * @param defenderLoss unit loss
     */
    finishedCombat(tSource, tDest, attackerLoss, defenderLoss) {
        /* show combat results ? */
        console.log('Combat results: attacking territory ' + tSource +
            'lost ' + attackerLoss + ' units, defending territory ' + tDest +
            'lost ' + defenderLoss + ' units.');

        var cSource = getContinentOf(tSource);
        var cDest = getContinentOf(tDest);

        /* apply losses */
        this.map[cSource][tSource].soldiers -= attackerLoss;
        this.map[cDest][tDest].soldiers -= defenderLoss;

        /* if there are no more units on the territory */
        if (this.map[cDest][tDest].soldiers <= 0) {
            this.map[cDest][tDest].player = this.map[cSource][tSource].player;
            /* TODO: determine the number of soldiers to place */
            this.map[cDest][tDest].soldiers = 1;

            console.log('Territory ' + tDest + ' is conquered by the attacker');

            /* TODO: check if defending player is dead, or in playerElimination? */
        }
    }

    /** Called when a player gets eliminated
     *
     * PRIVATE METHOD: DO NOT CALL FROM VIEW
     *
     * @param playerName name of the eliminated player
     */
    playerElimination(playerName) {
        /* show that a player was eliminated */
        console.log('player ' + playerName + ' eliminated');

        /* TODO: distribute tokens? */
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
        var cSource = getContinentOf(tSource);

        /* continent which contains the destination territory */
        var cDest = getContinentOf(tDest);

        /* move units */
        this.map[cSource][tSource].soldiers -= nbUnits;
        this.map[cDest][tDest].soldiers += nbUnits;
    }


    /** Try to move x units from one territory to another (phase 3)
     *
     * @param tSource: source territory; from where the units will be taken
     * @param tDest: destination territory; where the units will be placed
     * @param nbUnits: The number of units to move
     *
     * @return 0 if no problem, -1 if there is problem
     *
    **/
    tryFortify(tSource, tDest, nbUnits) {
        /* continent which contains the source territory */
        var cSource = getContinentOf(tSource);

        /* continent which contains the destination territory */
        var cDest = getContinentOf(tDest);

        /* check if it's phase 3 */
        if (this.currentPhase != phases['FORTIFICATION']) {
            console.log('Action not permitted: icorrect phase');
            return -1;
        }

        /* check if the player controls those territories */
        if (this.map[cSource][tSource].player != this.map[cDest][tDest].player ||
            this.map[cSource][tSource].player != this.currentPlayer.id) {
                console.log('Action not permitted: you do not control the territories');
                return -1;
        }

        /* check if the number of units is ok */
        if (this.map[cSource][tSource].soldiers <= nbUnits) {
            console.log('Action not permitted: not enough units');
            return -1;
        }

        /* check if the territories are adjacent */
        if (!areAdjacent(tSource, tDest)) {
            console.log('Action not permitted: territories not adjacent');
            return -1;
        }

        /* if all tests pass notify server */
        var data = {
            'source': tSource,
            'destination': tDest,
            'units': nbUnits
        };

        sendToServer(new Packet('MOVE', data));

        return 0;
    }


    handleIncommingMessages(){
        this.$socket.onmessage = function(d){
            console.log('incomming message')
            console.log(d)
            console.log('msg data')
            console.log(d.data)
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
                        attack(msg.data.source,
                            msg.data.destination,
                            msg.data.units);
                        break;

                    case Packet.getTypeOf('ATTACKED'):
                        attacked(msg.data.units);
                        break;

                    case Packet.getTypeOf('COMBAT_RESULTS'):
                        finishedCombat(msg.data.source,
                            msg.data.destination,
                            msg.data.attackerLoss,
                            msg.data.defenderLoss);
                        break;

                    case Packet.getTypeOf('CURRENT_PHASE'):
                        this.nextPhaseBtnState(msg.phase);

                        break;

                    case Packet.getTypeOf('DEFEND'):
                        defend(msg.data.defenderName,
                            msg.data.units);
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
                        /*Sets and update game data*/
                        MainGame.setGameData(msg.data)
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
                        playerElimination(msg.data.player);
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
