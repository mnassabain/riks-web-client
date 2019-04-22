import { Packet } from '../Packet'
import { map, getContinentOf, areAdjacent } from './Map'
import { Player, SupportedColors } from './Player'
import * as GameWindow from './GameWindowJS'

const phases = {
  PREPHASE: -1,
  REINFORCEMENT: 0,
  OFFENSE: 1,
  FORTIFICATION: 2
}

/* To store this class global object */
var THIS_IS_IT
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
        this.currentUserName = localStorage.name ;

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
        //console.log('players')

        /* Set the player localstorage */
        MainGame.setPlayerLocalStorage(data)

        /* Update the view's players array */
        MainGame.updateViewPlayers(data)
    }


  /**
   * Update the players list of the GameWindow view
   *
   * @param data : data sent by the server
   */
  updateViewPlayers(data) {
    // view.players = data.players
    console.log('view.players')
    console.log(THIS_IS_IT.view.players)
    // console.log(this.playerList)
  }

  /**
   * Sets the local map with data received from the server
   *
   * @param data map data sent by the game server
   */
  setMapData (data) {
    var i = 0
    /* Looping on local map object */
    Object.keys(THIS_IS_IT.map).forEach(key => {
      var continentName = THIS_IS_IT.map[key]
      for (var countries in continentName) {
        /* copying territories data received from the server */
        continentName[countries].soldiers = data.board[i].nbUnits
        continentName[countries].player = data.board[i].ownerId
        i++
      }
    })
    // console.log('map is set:')
    // console.log(THIS_IS_IT.map)
  }

  /**
   * Updates local map data
   *
   * @param terName territory name of country to update
   * @param playerId id of the territory owner
   * @param nbSoldiers number of units to put on this territory
   */
  updateMapData (terName, playerId, nbSoldiers) {
    var i = 0
    /* Looping on local map object */
    Object.keys(THIS_IS_IT.map).forEach(key => {
      var continentName = THIS_IS_IT.map[key]
      for (var countries in continentName) {
        if (countries === terName) {
          /* Updating territory data */
          continentName[countries].soldiers = nbSoldiers
          continentName[countries].player = playerId
        }
        i++
      }
    })
    // console.log('map data has been updated:')
    // console.log(this.map)
  }

  /**
   * Checks if a territory is free
   *
   * @param terName name of the territory to check
   * @return res true if territory is free, false if not
   */
  checkTerritoryFreedom (terName) {
    var i = 0
    var res = false
    /* getting local map */
    var checkMap = THIS_IS_IT.getLocalMap()
    /* looping on local map  */
    Object.keys(checkMap).forEach(key => {
      var continentName = checkMap[key]
      for (var countries in continentName) {
        if (countries === terName) {
          if (continentName[countries].player == -1) {
            // console.log('free')
            res = true
          } else {
            GameWindow.displayMessage('This territory is occupied !')
            res = false
          }
        }
        i++
      }
    })
    return res
  }

  /**
   * Checks if local player is the game active player
   *
   * @returns true or false
   */
  tryPutUnits () {
    console.log('try put units')
    console.log(THIS_IS_IT.currentPlayer)
    if (localStorage.myId == THIS_IS_IT.currentPlayer) {
      return true
    } else {
      return false
    }
  }

  /**
   * Returns number of free territories left in the game
   */
  getFreeTerritoriesNumber () {
    return THIS_IS_IT.gameData.freeTerritories
  }

  /**
   * Returns the game active player id
   */
  getActivePlayerId () {
    return this.gameData.activePlayer
  }

  /**
   * return the active player name string
   */
  getActivePlayerName () {
    var self = THIS_IS_IT
    return this.gameData.players[self.getActivePlayerId()].name
  }

  /**
   * Returns the name matching the given player id
   *
   * @param playerId id to search
   * @return player name string
   */
  getPlayerNameById (playerId) {
    var self = THIS_IS_IT
    return self.gameData.players[playerId].name
  }

  /**
   * Returns the id number matching the given player name
   * @param playerName
   * @return id of the corresponding player name
   */
  getPlayerIdByName (playerName) {
    var self = THIS_IS_IT
    for (var i = 0; i < self.gameData.players.length; i++) {
      if (playerName === self.gameData.players[i].name) return i
    }
  }

  /**
   * Returns the id matching the given country name
   *
   * @param countryName name to search
   * @return country id number
   */
  getCountryIdByName (countryName) {
    var i = 0
    var res = -1
    Object.keys(map).forEach(key => {
      var continentName = map[key]
      for (var countries in continentName) {
        if (countries === countryName) {
          res = i
        }
        i++
      }
    })
    // console.log('returned value = ' + res)
    return res
  }

  /**
   * Returns the name matching the given country id
   *
   * @param countryId id to search
   * @return country name string
   */
  getCountryNameById (countryId) {
    var i = 0
    var res = ''
    Object.keys(map).forEach(key => {
      var continentName = map[key]
      for (var countries in continentName) {
        if (i == countryId) {
          res = countries
        }
        i++
      }
    })
    // console.log('returned value = ' + res)
    return res
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
  nextPhaseBtnState (phase) {
    if (
      this.currentPlayer.name == this.currentUserName &&
      this.currentPhase != phase
    ) {
      this.btnState = true
      this.currentPhase = phase
    } else {
      this.btnState = false
    }
  }

  /* Response to PUT event*
   *
   * @param name  the name of the active player
   * @param units the quantity of units placed on the map
   */
  useTokensResponse (name, units) {
    /* only the active player does not see this notifcation */
    if (name != this.currentUserName) {
      /* return name + "has received " + units + "unit(s)" ; */
      console.log(name + 'has received ' + units + ' unit(s)')
    } else {
      /* only the active player sees this notification */
      console.log('you have has received ' + units + ' unit(s)')
    }
  }

  putResponse (name, territory, units) {
    if (name != this.currentUserName) {
      /* return name + "has putted " + units + "unit(s) on" + territory ; */
      console.log(name + 'has putted ' + units + ' unit(s) on ' + territory)
    } else {
      /* return name + "has putted " + units + "unit(s) on" + territory ; */
      console.log('you have putted ' + units + ' unit(s) on' + territory)
    }
  }

  /**
   * Initiates the game's PREPHASE
   *
   * @param data received from the game server
   */
  startGame (data) {
    GameWindow.displayMessage('Welcome to RiKS World!')
    var ms = 2000
    var self = THIS_IS_IT
    setTimeout(function () {
      console.log('free territories = ' + self.getFreeTerritoriesNumber())
      GameWindow.clearDisplayMessage()
      if (localStorage.myId == self.getActivePlayerId()) {
        GameWindow.displayMessage('You are playing, choose a territory !')
      } else {
        GameWindow.displayMessage(
          self.getActivePlayerName() + ' is choosing a territory !'
        )
      }
      console.log('free territories = ' + self.getFreeTerritoriesNumber())
    }, ms)
    self.prephaseLogic(data)
  }

  /**
   * Sends a PUT message to game server to allow a
   * player to occupy a territory
   *
   * @param territoryId country the calling player tries to occupy
   */
  chooseTerritory (territoryId) {
    var data = {
      territory: territoryId,
      units: 1
    }
    THIS_IS_IT.view.$socket.send(new Packet('PUT', data).getJson())
  }

  prephaseLogic (data) {
    console.log('prephaseLogic')
  }

  nextPhase () {
    this.currentPhase = (this.currentPhase + 1) % 3
  }

  sendToServer (packet) {
    this.$socket.send(packet.getJson())
  }

  synchronize () {
    this.sendToServer(new Packet('GAME_STATUS'))
  }

  /* this function must be triggered  when the active player clicks on a territory
    to put an unit during the first phase */
  /**
   *
   * @param token1  first token
   * @param token2  second token
   * @param token3  third token
   */
  useSet (token1, token2, token3) {
    if (0 /* check if number of tokens is greater than 4 */) {
      var params = {
        token1: token1,
        token2: token2,
        token3: token3
      }
      this.$socket.send(new Packet('USE_TOKENS', params).getJson())
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
  useReinforcement (player, territory, unit) {
    if (this.activePlayerReinforcement > 0) {
      putUnit(player, territory, unit)
    }
  }

  /**
   *
   * @param territory  the targeted territory
   * @param units  the number of units
   */
  putUnit (territory, units) {
    /* PUT message can only be emitted during phases -1 , 0 */
    if (this.currentPhase == 0) {
      var continent = getContinentOf(territory)
      var data = { territory: territory, units: units }

      if (this.map[continent][territory].player != this.currentPlayer.id) {
        console.log(
          "you are not the owner's territrory . you cannot put units here "
        )
      } else {
        this.$socket.send(new Packet('PUT', data).getJson())
      }
    }
  }

  endPhase () {
    this.$socket.send(new Packet('END_PHASE').getJson())
  }

  /**
   * Updates the units quantity of the local player
   *
   * @param player  the active player
   */
  updateReinforcement (player) {
    var unitsLeft = localStorage.reinforcements
    unitsLeft = unitsLeft - 1
    THIS_IS_IT.view.localArmies = unitsLeft
    localStorage.setItem('reinforcements', unitsLeft)

    // if(this.currentPhase == 0)
    // {
    //     this.activePlayerReinforcement -- ;
    // }

    // /* if the player has used his reinforcement and he has less than 4 tokens
    // send the END_PHASE message to the server */
    // if(this.activePlayerReinforcement == 0)
    // {
    //     this.endPhase();
    // }
  }

  /** Try to launch an attack
   *
   * @param tSource the attacking territory
   * @param tDest the defending territory
   * @param nbUnits the number of attacking units
   *
   * @return 0 if no problem, -1 if there is problem
   */
  tryAttack (tSource, tDest, nbUnits) {
    var cSource = getContinentOf(tSource)
    var cDest = getContinentOf(tDest)

    /* check phase */
    if (this.currentPhase != phases['OFFENSE']) {
      console.log('Action not permitted: incorrect phase')
      return -1
    }

    /* check if the player controls the attacking territory territories */
    if (this.map[cSource][tSource].player != this.currentPlayer.id) {
      console.log('Action not permitted: you do not control the territory')
      return -1
    }

    /* check if the attacked territory doesn't belong to the attacking player */
    if (this.map[cDest][tDest].player == this.map[cSource][tSource]) {
      console.log('Action not permitted: cannot attack own territory')
      return -1
    }

    /* check if the number of units is ok */
    if (this.map[cSource][tSource].soldiers <= nbUnits) {
      console.log('Action not permitted: not enough units')
      return -1
    }

    /* check if the territories are adjacent */
    if (!areAdjacent(tSource, tDest)) {
      console.log('Action not permitted: territories not adjacent')
      return -1
    }

    /* if all tests pass notify server */
    var data = {
      source: tSource,
      destination: tDest,
      units: nbUnits
    }

    sendToServer(new Packet('ATTACK', data))

    return 0
  }

  /** Called when an attack is happening
   *
   * PRIVATE METHOD: DO NOT CALL FROM VIEW
   *
   * @param tSource attacking territory
   * @param tDest attacked territory
   * @param nbUnits number of attacking units
   */
  attack (tSource, tDest, nbUnits) {
    /* display that an attack is happening */
    console.log(
      'Attack started from ' +
        tSource +
        ' onto ' +
        tDest +
        ' with ' +
        nbUnits +
        ' units'
    )
  }

  /** Called when the player is being attacked
   *
   * PRIVATE METHOD: DO NOT CALL FROM VIEW
   *
   * @param nbUnits number of attacking units
   */
  attacked (nbUnits) {
    /* display that the player is being attacked, let him defend */
    console.log('You are being attacked with ' + nbUnits)
  }

  /** Try to defend territory
   *
   * @param tDest defending territory (maybe not necessary?)
   * @param nbUnits number of units chosen to defend
   *
   * @return 0 if no problem, -1 if there is problem
   */
  tryDefend (tDest, nbUnits) {
    var cDest = getContinentOf(tDest)

    /* check if the territory has the number of units */
    if (this.map[cDest][tDest].soldiers < nbUnits) {
      console.log('Action not permitted: not enough units')
      return -1
    }

    /* check if the player owns the territory ? */

    /* notify server */
    var data = {
      units: nbUnits
    }

    this.sendToServer(new Packet('DEFEND', data))

    return 0
  }

  /** Called when a player is defending
   *
   * PRIVATE METHOD: DO NOT CALL FROM VIEW
   *
   * @param defender defending player
   * @param nbUnits number of defending units
   */
  defend (defender, nbUnits) {
    /* show that the player is defending */
    console.log(
      'Player ' + defender + ' is defending with ' + nbUnits + ' units'
    )
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
  finishedCombat (tSource, tDest, attackerLoss, defenderLoss) {
    /* show combat results ? */
    console.log(
      'Combat results: attacking territory ' +
        tSource +
        'lost ' +
        attackerLoss +
        ' units, defending territory ' +
        tDest +
        'lost ' +
        defenderLoss +
        ' units.'
    )

    var cSource = getContinentOf(tSource)
    var cDest = getContinentOf(tDest)

    /* apply losses */
    this.map[cSource][tSource].soldiers -= attackerLoss
    this.map[cDest][tDest].soldiers -= defenderLoss

    /* if there are no more units on the territory */
    if (this.map[cDest][tDest].soldiers <= 0) {
      this.map[cDest][tDest].player = this.map[cSource][tSource].player
      /* TODO: determine the number of soldiers to place */
      this.map[cDest][tDest].soldiers = 1

      console.log('Territory ' + tDest + ' is conquered by the attacker')

      /* TODO: check if defending player is dead, or in playerElimination? */
    }
  }

  /** Called when a player gets eliminated
   *
   * PRIVATE METHOD: DO NOT CALL FROM VIEW
   *
   * @param playerName name of the eliminated player
   */
  playerElimination (playerName) {
    /* show that a player was eliminated */
    console.log('player ' + playerName + ' eliminated')

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
  fortify (tSource, tDest, nbUnits) {
    /* continent which contains the source territory */
    var cSource = getContinentOf(tSource)

    /* continent which contains the destination territory */
    var cDest = getContinentOf(tDest)

    /* move units */
    this.map[cSource][tSource].soldiers -= nbUnits
    this.map[cDest][tDest].soldiers += nbUnits
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
  tryFortify (tSource, tDest, nbUnits) {
    /* continent which contains the source territory */
    var cSource = getContinentOf(tSource)

    /* continent which contains the destination territory */
    var cDest = getContinentOf(tDest)

    /* check if it's phase 3 */
    if (this.currentPhase != phases['FORTIFICATION']) {
      console.log('Action not permitted: icorrect phase')
      return -1
    }

    /* check if the player controls those territories */
    if (
      this.map[cSource][tSource].player != this.map[cDest][tDest].player ||
      this.map[cSource][tSource].player != this.currentPlayer.id
    ) {
      console.log('Action not permitted: you do not control the territories')
      return -1
    }

    /* check if the number of units is ok */
    if (this.map[cSource][tSource].soldiers <= nbUnits) {
      console.log('Action not permitted: not enough units')
      return -1
    }

    /* check if the territories are adjacent */
    if (!areAdjacent(tSource, tDest)) {
      console.log('Action not permitted: territories not adjacent')
      return -1
    }

    /* if all tests pass notify server */
    var data = {
      source: tSource,
      destination: tDest,
      units: nbUnits
    }

    sendToServer(new Packet('MOVE', data))

    return 0
  }

  handleIncommingMessages () {
    var THAT_CLASS = this
    this.$socket.onmessage = function (d) {
      console.log('incomming message')
      console.log(d)
      console.log('msg data')
      console.log(d.data)
      var msg = JSON.parse(d.data)
      if (/* msg.data.error */ false) {
        // print different responses of the standar server when there is an error
        switch (msg.type) {
          case Packet.getTypeOf('ATTACK'):
            console.log(msg.type + ':' + msg.data.response)
            break

          case Packet.getTypeOf('CONNECT'):
            console.log(msg.type + ':' + msg.data.response)
            break

          case Packet.getTypeOf('CREATE_LOBBY'):
            console.log(msg.type + ':' + msg.data.response)
            break

          case Packet.getTypeOf('DEFEND'):
            console.log(msg.type + ':' + msg.data.response)
            break

          case Packet.getTypeOf('DISCONNECT'):
            console.log(msg.type + ':' + msg.data.response)
            break

          case Packet.getTypeOf('EDIT_LOBBY'):
            console.log(msg.type + ':' + msg.data.response)
            break

          case Packet.getTypeOf('END_PHASE'):
            console.log(msg.type + ':' + msg.data.response)
            break

          case Packet.getTypeOf('GAME_STATUS'):
            console.log(msg.type + ':' + msg.data.response)
            break

          case Packet.getTypeOf('JOIN_LOBBY'):
            console.log(msg.type + ':' + msg.data.response)
            break

          case Packet.getTypeOf('KICK_FROM_LOBBY'):
            console.log(msg.type + ':' + msg.data.response)
            break

          case Packet.getTypeOf('LEAVE_GAME'):
            console.log(msg.type + ':' + msg.data.response)
            break

          case Packet.getTypeOf('LOBBY_LIST'):
            console.log(msg.type + ':' + msg.data.response)
            break

          case Packet.getTypeOf('MOVE'):
            console.log(msg.type + ':' + msg.data.response)
            break

          case Packet.getTypeOf('PLAYER_PROFILE'):
            console.log(msg.type + ':' + msg.data.response)
            break

          case Packet.getTypeOf('PUT'):
            console.log(msg.type + ':' + msg.data.response)
            break

          case Packet.getTypeOf('SIGN_UP'):
            console.log(msg.type + ':' + msg.data.response)
            break

          case Packet.getTypeOf('START_GAME'):
            console.log(msg.type + ':' + msg.data.response)
            break

          case Packet.getTypeOf('USE_TOKENS'):
            console.log(msg.type + ':' + msg.data.response)
            break
          default:
            break
        }
      } else {
        switch (msg.type) {
          case Packet.prototype.getTypeOf('ATTACK'):
            THAT_CLASS.attack(
              msg.data.source,
              msg.data.destination,
              msg.data.units
            )
            break

          case Packet.prototype.getTypeOf('ATTACKED'):
            THAT_CLASS.attacked(msg.data.units)
            break

          case Packet.prototype.getTypeOf('COMBAT_RESULTS'):
            THAT_CLASS.finishedCombat(
              msg.data.source,
              msg.data.destination,
              msg.data.attackerLoss,
              msg.data.defenderLoss
            )
            break

          case Packet.prototype.getTypeOf('CURRENT_PHASE'):
            THAT_CLASS.nextPhaseBtnState(msg.phase)

            break

          case Packet.prototype.getTypeOf('DEFEND'):
            THAT_CLASS.defend(msg.data.defenderName, msg.data.units)
            break

          case Packet.prototype.getTypeOf('ERROR'):
            // print the type of the error in the console
            // THAT_CLASS.ErrorHandling();
            GameWindow.clearDisplayMessage()
            var str = msg.data.message
            GameWindow.displayMessage(str.substr(str.indexOf(':') + 1))
            THAT_CLASS.updateViewPlayers(THAT_CLASS.gameData)
            break

          case Packet.prototype.getTypeOf('GAME_OVER'):
            break

          case Packet.prototype.getTypeOf('GAME_RESULTS'):
            break

          case Packet.prototype.getTypeOf('GAME_STATUS'):
            /* Sets and updates game data */
            THAT_CLASS.setGameData(msg.data)

            break

          case Packet.prototype.getTypeOf('GIVE_TOKENS'):
            break

          case Packet.prototype.getTypeOf('KICKED'):
            break

          case Packet.prototype.getTypeOf('LEAVE_GAME'):
            break

          case Packet.prototype.getTypeOf('LOBBY_STATE'):
            break

          case Packet.prototype.getTypeOf('MOVE'):
            THAT_CLASS.fortify(
              msg.data.source,
              msg.data.destination,
              msg.data.units
            )

            break

          case Packet.prototype.getTypeOf('PLAYER_ELIMINATION'):
            THAT_CLASS.playerElimination(msg.data.player)
            break

          case Packet.prototype.getTypeOf('PLAYER_PROFILE'):
            break

          /* a PUT message implies a PUT message from the  client */
          case Packet.prototype.getTypeOf('PUT'):
            var currentPlayerBefore = THAT_CLASS.currentPlayer
            /* updating current player turn */
            THAT_CLASS.currentPlayer =
              (THAT_CLASS.currentPlayer + 1) % THAT_CLASS.gameData.nbPlayers

            /* updating the local map data */
            THAT_CLASS.updateMapData(
              THAT_CLASS.getCountryNameById(msg.data.territory),
              msg.data.player,
              msg.data.units
            )

            /* updating the number of free territories */
            THAT_CLASS.gameData.freeTerritories--

            /* change the color of a territory during the pre-phase */
            GameWindow.setCountryColor(
              SupportedColors[msg.data.player],
              msg.data.territory
            )
            GameWindow.clearDisplayMessage()

            /* displaying different message according to current player */
            if (msg.data.player == localStorage.myId) {
              GameWindow.displayMessage(
                'You choosed to put ' +
                  msg.data.units +
                  ' unit(s) on ' +
                  THAT_CLASS.getCountryNameById(msg.data.territory)
              )
              THAT_CLASS.updateReinforcement(currentPlayerBefore)
            } else {
              GameWindow.displayMessage(
                THAT_CLASS.getPlayerNameById(msg.data.player) +
                  ' choosed to put ' +
                  msg.data.units +
                  ' unit(s) on ' +
                  THAT_CLASS.getCountryNameById(msg.data.territory)
              )
            }
            /* this.putResponse(msg.player.name,msg.territory,msg.units); */
            break

          case Packet.prototype.getTypeOf('REINFORCEMENT'):
            THAT_CLASS.activePlayerReinforcement = msg.units
            break

          case Packet.prototype.getTypeOf('START_GAME'):
            break

          case Packet.prototype.getTypeOf('USE_TOKENS'):
            /* this.useTokensResponse(msg.player.name,msg.units); */
            break

          default:
            break
        }
      }
    }
  }

  innerLoop () {
    this.synchronize()

    setInterval(function () {
      this.synchronize()
    }, 1000)
  }
}


