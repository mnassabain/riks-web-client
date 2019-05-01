import { Packet } from '../Packet'
import { map, getContinentOf, areAdjacent } from './Map'
import { Player, SupportedColors } from './Player'
import * as GameWindow from './GameWindowJS'

export const phases = {
  PREPHASE: -1,
  REINFORCEMENT: 0,
  OFFENSE: 1,
  FORTIFICATION: 2
}

/* To store this class global object */
var THIS
// This function works as a controller

/*
 Start game

 Create players

 Get events from server

 Send info to server

 Make the "view" display things
*/
export class MainGame {
  constructor (v) {
    this.currentPhase = phases['PREPHASE']
    this.map = map
    this.playerList = []
    this.currentPlayer = undefined
    this.activePlayerReinforcement = 0
    this.btnState = false /* for the nextPhase button */
    this.currentUserName = localStorage.name
    this.freeTerritories = 42
    THIS = this
    this.totalUnits = 0
    this.totalPlayers = 0
    this.prephaseLogic = false
    // this.firstPlayer
    this.gameIsSet = false
    this.prephaseIsDone = false

    // copy of the object GameWindow
    this.view = v
    this.$socket = v.$socket

    this.handleIncommingMessages()
    // v.$socket.send(new Packet('GAME_STATUS').getJson())

    this.synchronize()
    // this.innerLoop();
  }


  getCurrentPhase() {
    return THIS.currentPhase
  }

  /**
   * Sets game data with informations sent by server via GAME_STATUS message
   *
   * @param data : data sent by server
   */
  setGameData (data) {
    this.gameData = data
    console.log('******************')
    console.log('SETTING GAME DATA')
    this.freeTerritories = data.freeTerritories
    console.log('this.freeTerritories ' + this.freeTerritories)
    this.currentPhase = data.phase
    GameWindow.displayCurrentPhase(this.currentPhase)
    console.log('currentPhase ' + this.currentPhase)
    this.currentPlayer = data.activePlayer
    this.view.currentPlayer = data.activePlayer
    // this.firstPlayer = data.activePlayer
    console.log('currentPlayer ' + this.currentPlayer)
    this.totalPlayers = data.nbPlayers
    console.log('totalPlayers ' + this.totalPlayers)

    this.totalUnits = 0
    for (var i = 0; i < data.players.length; i++) {
      this.totalUnits += data.players[i].reinforcements
    }
    console.log('totalReinforcements ' + this.totalUnits)

    /* sets view's players array */
    this.setPlayersData(data)
    console.log('view.players after update')
    console.log(THIS.view.players)

    /* Sets the map data */
    this.setMapData(data)

    /* Set the player localstorage */
    this.setPlayerLocalStorage(data)
    console.log('player localstorage')
    console.log(localStorage)
    console.log('')
    if (this.gameIsSet === false) {
      this.gameIsSet = true
      this.startGame()
    }
  }

  /**
   * Returns the local map object
   */
  getLocalMap () {
    return THIS.map
  }

  /**
   * Initializes the local players with data received from
   * the game server. (data.players)
   *
   * @param data
   */
  setPlayersData (data) {
    console.log('SETTING PLAYER DATA')
    console.log('')
    var i = 0
    var self = this
    self.playerList = []
    Object.keys(data.players).forEach(key => {
      var player = data.players[key]
      console.log(' i = ' + i)
      var p = new Player(parseInt(i), player.name, i)
      p.id = i
      p.reinforcements = data.players[i].reinforcements
      p.tokens.tok1 = data.players[i].tokens.tok1
      p.tokens.tok2 = data.players[i].tokens.tok2
      p.tokens.tok3 = data.players[i].tokens.tok3
      p.tokens.tok4 = data.players[i].tokens.tok4
      console.log('player is set :')
      console.log(p)
      self.playerList.push(p)
      i++
    })
    console.log('this playerlist is set')
    console.log(self.playerList)

    // The player list is copyied to the view
    self.view.players = self.playerList
  }

  /**
   * Sets the player's localStorage with data matching his name in the array
   *
   * @param data : data sent by the server
   */
  setPlayerLocalStorage (data) {
    for (var i = 0; i < data.players.length; i++) {
      if (THIS.gameData.players[i].name == localStorage.login) {
        localStorage.setItem('myId', i)
        localStorage.setItem('myColor', SupportedColors[i])
        localStorage.setItem('reinforcements', data.players[i].reinforcements)
        var n = 0
        localStorage.setItem('territories', n)
        localStorage.setItem('token1', data.players[i].tokens.tok1)
        localStorage.setItem('token2', data.players[i].tokens.tok2)
        localStorage.setItem('token3', data.players[i].tokens.tok3)
        localStorage.setItem('tokenJoker', data.players[i].tokens.tok4)
        console.log('localstorage')
        console.log(localStorage)
      } else {
        // console.log('no match found')
      }
    }
  }

  /**
   * Update the players list of the GameWindow view
   *
   * @param data : data sent by the server
   */
  updateViewPlayers (data) {
    // view.players = data.players
    console.log('view.players')
    console.log(THIS.view.players)
    // console.log(THIS.playerList)
  }

  /**
   * Sets the local map with data received from the server
   *
   * @param data map data sent by the game server
   */
  setMapData (data) {
    console.log('board')
    console.log(data.board)
    var i = 0
    /* Looping on local map object */
    Object.keys(THIS.map).forEach(key => {
      var continentName = THIS.map[key]
      for (var countries in continentName) {
        /* copying territories data received from the server */
        continentName[countries].soldiers = data.board[i].nbUnits
        continentName[countries].player = data.board[i].ownerId
        i++
      }
    })
    // console.log('map is set:')
    // console.log(THIS.map)
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
    Object.keys(THIS.map).forEach(key => {
      var continentName = THIS.map[key]
      for (var countries in continentName) {
        if (countries === terName) {
          /* Updating territory data */
          continentName[countries].soldiers += nbSoldiers
          continentName[countries].player = playerId
        }
        i++
      }
    })
    // console.log('map data has been updated:')
    // console.log(THIS.map)
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
    var checkMap = THIS.getLocalMap()
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
  tryPutUnits (player, territory, units) {
    // console.log('try put units')
    // console.log(THIS.currentPlayer)
    // if (localStorage.myId == THIS.currentPlayer) {
    //   return true
    // } else {
    //   return false
    // }

    /* tester nombre d'unités */
    if (MainGame.prototype.getMyReinforcementNum() <= 0) {
      console.log('not enough units')
      GameWindow.clearDisplayMessage()
      GameWindow.displayMessage("You've got no more units left !")
      return
    }

    // if (MainGame.prototype.getMyReinforcementNum() == 1 && THAT_CLASS.currentPhase == phases['PREPHASE']) {
    //   THIS.prephaseIsDone = true
    // }

    // var playerName = THIS.getPlayerNameById(player)

    // test if my territory
    var continent = getContinentOf(territory)
    console.log(
      'player on territory = ' + THIS.map[continent][territory].player
    )
    console.log(
      'player trying to place unit = ' +
        player +
        ', id = ' +
        THIS.view.players[player].displayName
    )

    if (
      THIS.map[continent][territory].player != player &&
      THIS.map[continent][territory].player !== -1
    ) {
      console.log('not your territory')
      GameWindow.clearDisplayMessage()
      GameWindow.displayMessage(territory + ' is not Yours !')
      return
    }

    if (player != THIS.view.currentPlayer) {
      console.log(
        'not your turn, player = ' +
          player +
          ', currentPlayer = ' +
          THIS.view.currentPlayer
      )
      GameWindow.clearDisplayMessage()
      GameWindow.displayMessage('Not your turn')
      return
    }

    var data = {
      territory: THIS.getCountryIdByName(territory),
      units: units
    }

    THIS.sendToServer(new Packet('PUT', data))
  }

  /**
   * Returns number of free territories left in the game
   */
  getFreeTerritoriesNumber () {
    return THIS.freeTerritories
  }

  /**
   * Returns the game active player id
   */
  getActivePlayerId () {
    return THIS.view.currentPlayer
  }

  /**
   * return the active player name string
   */
  getActivePlayerName () {
    var self = THIS
    return self.playerList[self.getActivePlayerId()].displayName
  }

   /**
   * return the active player
   */
  getActivePlayer(){
    var self = THIS
    console.log(self.playerList[self.getActivePlayerId()])
    return self.playerList[self.getActivePlayerId()]
  }

  /**
   * Returns the name matching the given player id
   *
   * @param playerId id to search
   * @return player name string
   */
  getPlayerNameById (playerId) {
    var self = THIS
    return self.playerList[playerId].displayName
  }

  /**
   * Returns the id number matching the given player name
   * @param playerName
   * @return id of the corresponding player name
   */
  getPlayerIdByName (playerName) {
    var self = THIS
    for (var i = 0; i < self.playerList.length; i++) {
      if (playerName === self.playerList[i].name) return i
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

  getNbPlayers () {
    return THIS.totalPlayers
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
      THIS.currentPlayer.name == THIS.currentUserName &&
      THIS.currentPhase != phase
    ) {
      THIS.btnState = true
      THIS.currentPhase = phase
    } else {
      THIS.btnState = false
    }
  }

  /* Response to PUT event*
   *
   * @param name  the name of the active player
   * @param units the quantity of units placed on the map
   */
  useTokensResponse (name, units) {
    /* only the active player does not see this notifcation */
    if (name != THIS.currentUserName) {
      /* return name + "has received " + units + "unit(s)" ; */
      console.log(name + 'has received ' + units + ' unit(s)')
    } else {
      /* only the active player sees this notification */
      console.log('you have has received ' + units + ' unit(s)')
    }
  }

  putResponse (name, territory, units) {
    if (name != THIS.currentUserName) {
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
    var self = THIS
    setTimeout(function () {
      GameWindow.clearDisplayMessage()
      console.log(
        'localstorage id = ' +
          localStorage.myId +
          ', activeplayerid = ' +
          self.getActivePlayerId()
      )
      if (localStorage.myId == self.getActivePlayerId()) {
        GameWindow.displayCurrentPlayer()
        GameWindow.displayMessage('Double click on a territory to claim it !')
      } else {
        GameWindow.displayCurrentPlayer()
        GameWindow.displayMessage(
          self.getActivePlayerName() + ' is choosing a territory !'
        )
      }
      console.log('free territories = ' + self.getFreeTerritoriesNumber())
    }, ms)
    /**
     * from now players claim territories turn by turn on map
     * using dbclick on territory, until no more free territories left
     */
  }

  /**
   * Sends a PUT message to game server to allow a
   * player to occupy a territory
   *
   * @param territoryId country the calling player tries to occupy
   */
  claimTerritory (territoryId) {
    var data = {
      territory: territoryId,
      units: 1
    }
    THIS.view.$socket.send(new Packet('PUT', data).getJson())
  }

  /**
   * Sends a PUT message to game server to ask if the
   * player can add one unit on this territory
   *
   * @param territoryId country the calling player tries to
   */
  addUnits (territoryId) {
    var data = {
      territory: territoryId,
      units: 1
    }
    THIS.view.$socket.send(new Packet('PUT', data).getJson())
  }

  prephaseLogic () {
    console.log('prephaseLogic')

    /* Modificates addeventlistener on dblclick */
    GameWindow.disableDbClick()
    GameWindow.disableDbClickReinUi()

    /* The new event listener for using units left */
    var map = document.getElementById('GameMap')
    map.addEventListener('click', GameWindow._addReinforcement, true)

    var ms = 3000
    var self = THIS
    setTimeout(function () {
      GameWindow.clearDisplayMessage()
      console.log('******************  MAINGAME  **********************')
      console.log('localstorage id = ' + localStorage.getItem('myId') + ', view.current = ' + self.getActivePlayerId())
      if (localStorage.getItem('myId') == self.getActivePlayerId()) {
        GameWindow.displayMessage(
          'Put reinforcement units on your territories !'
        )
      } else {
        GameWindow.displayMessage(
          self.getActivePlayerName() + ' is reinforcing his/her territories !'
        )
      }
    }, ms)
  }

  getMyReinforcementNum () {
    console.log(
      'my reinforcements : ' +
        THIS.view.players[localStorage.getItem('myId')]
    )
    return THIS.view.players[localStorage.getItem('myId')]
  }

  nextPlayerTurn () {
    THIS.currentPlayer =
      (THIS.currentPlayer + 1) % THIS.totalPlayers
    THIS.view.currentPlayer = THIS.currentPlayer
    // console.log(
    //   'current player = ' +
    //     THIS.currentPlayer +
    //     ', id =' +
    //     THIS.playerList[THIS.currentPlayer].displayName
    // )
  }

  /**
   * Checks if a territory is player territory
   *
   * @param terName name of the territory to check
   * @return res true if territory is free, false if not
   */
  checkTerritoryIsMine (terName) {
    var i = 0
    var res = false
    /* getting local map */
    var checkMap = THIS.getLocalMap()
    /* looping on local map  */
    Object.keys(checkMap).forEach(key => {
      var continentName = checkMap[key]
      for (var countries in continentName) {
        if (countries === terName) {
          if (continentName[countries].player == localStorage.myId) {
            // console.log('free')
            res = true
          } else {
            GameWindow.displayMessage('This territory is not yours !!')
            res = false
          }
        }
        i++
      }
    })
    return res
  }

  nextPhase () {
    console.log('Next phase is called in MAINGAME')
    THIS.currentPhase = (THIS.currentPhase + 1) % 3
    THIS.sendToServer(new Packet('END_PHASE'))
  }

  sendToServer (packet) {
    THIS.$socket.send(packet.getJson())
  }

  synchronize () {
    THIS.sendToServer(new Packet('GAME_STATUS'))
  }

  /**
   *
   * @param player player
   */
  getPlayerNumberOfTokens (player) {
    return (
      player.tokens[0] + player.tokens[1] + player.tokens[2] + player.tokens[3]
    )
  }
  /* THIS function must be triggered  when the active player clicks on a territory
    to put an unit during the first phase */
  /**
   *
   * @param token1  first token
   * @param token2  second token
   * @param token3  third token
   */

  useSet (token1, token2, token3) {
    if (
      THIS.getPlayerNumberOfTokens(THIS.currentPlayer) > 4 &&
      THIS.currentPlayer.name == THIS.activePlayer.name
    ) {
      var params = {
        token1: token1,
        token2: token2,
        token3: token3
      }
      THIS.$socket.send(new Packet('USE_TOKENS', params).getJson())
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
    if (THIS.activePlayerReinforcement > 0) {
      THIS.putUnit(player, territory, unit)
    }
  }

  /**
   *
   * @param territory  the targeted territory
   * @param units  the number of units
   */
  putUnit (territory, units) {
    /* PUT message can only be emitted during phases -1 , 0 */
    console.log('in put units func')
    console.log('current phase ' + THIS.currentPhase)
    if (THIS.currentPhase == -1) {
      var continent = getContinentOf(territory)
      var data = {
        territory: THIS.getCountryIdByName(territory),
        units: units
      }
      console.log(THIS.map[continent][territory].player)
      if (THIS.map[continent][territory].player != localStorage.myId) {
        console.log(
          "you are not the owner's territrory. you cannot put units here "
        )
      } else {
        console.log('sending put demand')
        THIS.$socket.send(new Packet('PUT', data).getJson())
      }
    } else {
      console.log('put unit failed')
    }
  }

  checkAllPlayersReinforcements () {
    console.log('players reinforcements :')
    for (var i = 0; i < THIS.playerList.length; i++) {
      console.log(
        'player' + i + ' : ' + THIS.playerList[i].reinforcements
      )
    }
  }

  readyToNextPhase () {
    console.log('Ready to phase 1')
    GameWindow.clearDisplayMessage()
  }

  endPhase () {
    THIS.$socket.send(new Packet('END_PHASE').getJson())
  }

  /**
   * Updates the units quantity of the local player
   *
   * @param player  the active player
   */
  updateReinforcement (player) {
    var unitsLeft = localStorage.getItem('reinforcements')

    /*******************************************************************************************/
    console.log('update reinforcement: ' + unitsLeft + ' to ' + (unitsLeft - 1))

    unitsLeft = unitsLeft - 1
    var territoriesNum
    if (THIS.getFreeTerritoriesNumber() > 0) {
      territoriesNum = parseInt(localStorage.getItem('territories')) + 1
    } else {
      territoriesNum = parseInt(localStorage.getItem('territories'))
    }
    THIS.view.localArmies = THIS.getActivePlayer().reinforcements
    THIS.view.localTerritories = territoriesNum

    console.log(territoriesNum)

    localStorage.setItem('reinforcements', unitsLeft)
    localStorage.setItem('territories', territoriesNum)

    // if(THIS.currentPhase == 0)
    // {
    //     THIS.activePlayerReinforcement -- ;
    // }

    // /* if the player has used his reinforcement and he has less than 4 tokens
    // send the END_PHASE message to the server */
    // if(THIS.activePlayerReinforcement == 0)
    // {
    //     THIS.endPhase();
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
    if (THIS.currentPhase != phases['OFFENSE']) {
      console.log('Action not permitted: incorrect phase')
      return -1
    }

    /* check if the player controls the attacking territory territories */
    if (THIS.map[cSource][tSource].player != THIS.currentPlayer) {
      console.log('Action not permitted: you do not control the territory')
      return -1
    }

    /* check if the attacked territory doesn't belong to the attacking player */
    if (THIS.map[cDest][tDest].player == THIS.map[cSource][tSource]) {
      console.log('Action not permitted: cannot attack own territory')
      return -1
    }

    /* check if the number of units is ok */
    if (THIS.map[cSource][tSource].soldiers <= nbUnits) {
      console.log('Action not permitted: not enough units')
      return -1
    }

    /* check if the territories are adjacent */
    // if (!areAdjacent(tSource, tDest)) {
    //   console.log('Action not permitted: territories not adjacent')
    //   return -1
    // }

    /* if all tests pass notify server */
    var data = {
      source: THIS.getCountryIdByName(tSource),
      destination: THIS.getCountryIdByName(tDest),
      units: nbUnits
    }

    THIS.sendToServer(new Packet('ATTACK', data))

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

    var data = {
      source: tSource,
      destination: tDest,
      units: nbUnits
    }
    
    //THIS.sendToServer(new Packet('ATTACK', data))
  }

  /** Called when the player is being attacked
   *
   * PRIVATE METHOD: DO NOT CALL FROM VIEW
   *
   * @param nbUnits number of attacking units
   */
  attacked (nbUnits, targetedTerritory) {
    /* display that the player is being attacked, let him defend */
    console.log('You are being attacked with ' + nbUnits)
    GameWindow.clearDisplayMessage()
    GameWindow.displayMessage('You are being attacked on' + targetedTerritory + ' by ' + nbUnits + ' unit(s)')
    // TODO add some timeout here
    GameWindow.clearDisplayMessage()
    GameWindow.defendTerritoryNotification(nbUnits, targetedTerritory)
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
    console.log('tDest' + tDest)
    console.log('tDest soldiers :')
    console.log(THIS.map[cDest][tDest].soldiers)
    console.log('nb units = ' + nbUnits)

    /* check if the territory has the number of units */
    if (THIS.map[cDest][tDest].soldiers < nbUnits) {      
      console.log('Action not permitted: not enough units')
      return -1
    }

    /* check if the player owns the territory ? */

    /* notify server */
    var data = {
      units: nbUnits
    }

    THIS.sendToServer(new Packet('DEFEND', data))

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

    /* were are getting IDs from server, getting name strings of countries */
    tSource = THIS.getCountryNameById(tSource)
    tDest = THIS.getCountryNameById(tDest)

    var cSource = getContinentOf(tSource)
    var cDest = getContinentOf(tDest)

    /* apply losses */
    THIS.map[cSource][tSource].soldiers -= attackerLoss
    THIS.map[cDest][tDest].soldiers -= defenderLoss

    /* if there are no more units on the territory */
    if (THIS.map[cDest][tDest].soldiers <= 0) {
      THIS.map[cDest][tDest].player = THIS.map[cSource][tSource].player
      /* TODO: determine the number of soldiers to place */
      THIS.map[cDest][tDest].soldiers = 1

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
    THIS.map[cSource][tSource].soldiers -= nbUnits
    THIS.map[cDest][tDest].soldiers += nbUnits
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
    if (THIS.currentPhase != phases['FORTIFICATION']) {
      console.log('Action not permitted: icorrect phase')
      return -1
    }

    /* check if the player controls those territories */
    if (
      THIS.map[cSource][tSource].player != THIS.map[cDest][tDest].player ||
      THIS.map[cSource][tSource].player != THIS.currentPlayer.id
    ) {
      console.log('Action not permitted: you do not control the territories')
      return -1
    }

    /* check if the number of units is ok */
    if (THIS.map[cSource][tSource].soldiers <= nbUnits) {
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

  beginAttackPhase(){
    console.log('Server is now on phase offense')
    if(localStorage.getItem('myId') == THIS.currentPlayer){
      // Display message to select 
      GameWindow.displayMessage("You are attacking, select start territory")
        // Enable click
      GameWindow._enableAttackFromTerritory()
      // 1. Select territory from which to attack

      // 2. Select territory to attack (no restrain)

      // 3. Send info to server
    } else {
      GameWindow.clearDisplayMessage()
      GameWindow.displayMessage(THIS.getPlayerNameById(THIS.currentPlayer) + ' is attacking')
    }
  }

  handleIncommingMessages () {
    var THAT_CLASS = this
    THIS.$socket.onmessage = function (d) {
      console.log('incomming message')
      console.log(d)
      console.log('msg data')
      console.log(d.data)
      var msg = JSON.parse(d.data) 
      switch (msg.type) {
        case Packet.prototype.getTypeOf('ATTACK'):
          THAT_CLASS.attack(
            msg.data.source,
            msg.data.destination,
            msg.data.units
          )
          console.log("ATTACK response")
          console.log(msg.data)
          break

        case Packet.prototype.getTypeOf('ATTACKED'):
          console.log('A player is attacked : ')
          THAT_CLASS.attacked(msg.data.units, msg.data.targetedTerritory)
          console.log(msg.data)
          break

        case Packet.prototype.getTypeOf('COMBAT_RESULTS'):
          console.log('combat results')
          console.log(msg.data)
          THAT_CLASS.finishedCombat(
            msg.data.source,
            msg.data.destination,
            msg.data.attackerLoss,
            msg.data.defenderLoss
          )
          break

        case Packet.prototype.getTypeOf('CURRENT_PHASE'):
          console.log('CURRENT_PHASE: ' + msg.data.phase + ', now ' + THIS.playerList[THIS.currentPlayer].displayName + ' is playing')
          /* updates the current phase in players controls area */
          GameWindow.displayCurrentPhase(msg.data.phase)

          THAT_CLASS.currentPhase = msg.data.phase
          
          if (msg.data.phase == phases['OFFENSE']) {
            THIS.beginAttackPhase()
          }

          if (msg.data.phase == phases['FORTIFICATION']) {
            console.log('Server is now on phase fortification')
          }
          break

        case Packet.prototype.getTypeOf('DEFEND'):
          console.log('defend response')
          console.log(msg.data)
          THAT_CLASS.defend(msg.data.defenderName, msg.data.units)
          break

        case Packet.prototype.getTypeOf('ERROR'):
          // print the type of the error in the console
          THIS.ErrorHandling(msg.data);
          break

        case Packet.prototype.getTypeOf('GAME_OVER'):
          console.log('GAME_OVER' + msg)
          break

        case Packet.prototype.getTypeOf('GAME_RESULTS'):
          console.log('GAME_RESULTS' + msg)
          break

        case Packet.prototype.getTypeOf('GAME_STATUS'):
          console.log('GAME_STATUS' + msg)
          /* Sets and updates game data */
          THAT_CLASS.setGameData(msg.data)

          break

        case Packet.prototype.getTypeOf('GIVE_TOKENS'):
          console.log('GIVE_TOKENS' + msg)

          THAT_CLASS.view.players[msg.data.player].tokens.tok1 +=
            msg.data.token1
          THAT_CLASS.view.players[msg.data.player].tokens.tok2 +=
            msg.data.token2
          THAT_CLASS.view.players[msg.data.player].tokens.tok3 +=
            msg.data.token3
          THAT_CLASS.view.players[msg.data.player].tokens.tok4 +=
            msg.data.token4

          THAT_CLASS.view.localNbTokenTypeOne += msg.data.token1
          THAT_CLASS.view.localNbTokenTypeTwo += msg.data.token2
          THAT_CLASS.view.localNbTokenTypeThree += msg.data.token3
          THAT_CLASS.view.localNbTokenTypeJoker += msg.data.token4

          break

        case Packet.prototype.getTypeOf('KICKED'):
          console.log('KICKED' + msg)
          break

        case Packet.prototype.getTypeOf('LEAVE_GAME'):
          console.log('LEAVE_GAME' + msg)
          break

        case Packet.prototype.getTypeOf('LOBBY_STATE'):
          console.log('LOBBY_STATE' + msg)
          break

        case Packet.prototype.getTypeOf('MOVE'):
          console.log('MOVE' + msg)
          THAT_CLASS.fortify(
            msg.data.source,
            msg.data.destination,
            msg.data.units
          )

          break

        case Packet.prototype.getTypeOf('PLAYER_ELIMINATION'):
          console.log('PLAYER_ELIMINATION' + msg)
          THAT_CLASS.playerElimination(msg.data.player)
          break

        case Packet.prototype.getTypeOf('PLAYER_PROFILE'):
          console.log('PLAYER_PROFILE' + msg)
          break

        /* a PUT message implies a PUT message from the  client */
        case Packet.prototype.getTypeOf('PUT'):
          console.log('PUT' + msg)

          /* remove reinforcements from player */
          THAT_CLASS.view.players[msg.data.player].reinforcements -=
            msg.data.units
          // THAT_CLASS.playerList[msg.data.player].reinforcements -= msg.data.units

          if (THAT_CLASS.currentPhase == phases['PREPHASE']) {
            
            /* updating total amount of units left */
            THIS.totalUnits -= 1
            console.log('Total units left ' + THIS.totalUnits)
            /* saving last player who put for display purposes */
            var currentPlayerBefore = THAT_CLASS.currentPlayer
            /* updating current player turn */
            THAT_CLASS.nextPlayerTurn()
            GameWindow.displayCurrentPlayer()

            // updating the ratio bar
            for (var i = 0; i < THAT_CLASS.totalPlayers; i++) {
              GameWindow.updateRatioBar(i, THAT_CLASS.playerList[i].nbTerritories)
            }

            /* updating the local map data */
            THAT_CLASS.updateMapData(
              THAT_CLASS.getCountryNameById(msg.data.territory),
              msg.data.player,
              msg.data.units
            )

            /* updating the number of free territories */
            if (THAT_CLASS.prephaseLogic === false) {
              THAT_CLASS.freeTerritories--
              /* change the color of a territory during the pre-phase */
              GameWindow.setCountryColor(
                SupportedColors[msg.data.player],
                msg.data.territory
              )
              /* puts the soldier icon with the number area */
              GameWindow.drawSoldier(
                SupportedColors[msg.data.player],
                THAT_CLASS.getCountryNameById(msg.data.territory)
              )

              THAT_CLASS.view.players[msg.data.player].nbTerritories++
            }
            GameWindow.updateCountrySoldiersNumber(msg.data.territory)

            /* if no more territories we go to the second part of prephase */
            if (
              THAT_CLASS.freeTerritories > 0 &&
              THAT_CLASS.prephaseLogic === false
            ) {
              console.log(
                'Total free territories left ' + THAT_CLASS.freeTerritories
              )
            } else {
              THAT_CLASS.prephaseLogic = true
              MainGame.prototype.prephaseLogic()
            }

            GameWindow.clearDisplayMessage()

            /* displaying different put message according to current player */
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

              // THAT_CLASS.playerList[msg.data.player].reinforcements--
            }
            /* if all players have spent their units */
            if (THAT_CLASS.totalUnits == 0) {
              /* removing double click listener on addreinforcement */
              GameWindow.clearDisplayMessage()
              GameWindow.displayMessage('All units are in place now !')
            }
          }
          else if (THAT_CLASS.currentPhase == phases['REINFORCEMENT']){
            /* updating total amount of units left */
            THIS.totalUnits -= 1
            console.log('Total units left ' + THIS.totalUnits)
            /* saving last player who put for display purposes */
            var currentPlayerBefore = THAT_CLASS.currentPlayer

            GameWindow.displayCurrentPlayer()

            // updating the ratio bar
            for (var i = 0; i < THAT_CLASS.totalPlayers; i++) {
              GameWindow.updateRatioBar(i, THAT_CLASS.playerList[i].nbTerritories)
            }

            THAT_CLASS.updateMapData(
              THAT_CLASS.getCountryNameById(msg.data.territory),
              msg.data.player,
              msg.data.units
            )

            /* updating the number of free territories */
            if (THAT_CLASS.prephaseLogic === false) {
              THAT_CLASS.freeTerritories--
              /* change the color of a territory during the pre-phase */
              GameWindow.setCountryColor(
                SupportedColors[msg.data.player],
                msg.data.territory
              )
              /* puts the soldier icon with the number area */
              GameWindow.drawSoldier(
                SupportedColors[msg.data.player],
                THAT_CLASS.getCountryNameById(msg.data.territory)
              )

              THAT_CLASS.view.players[msg.data.player].nbTerritories++
            }
            GameWindow.updateCountrySoldiersNumber(msg.data.territory)

            /* if no more territories we go to the second part of prephase */
            if (
              THAT_CLASS.freeTerritories > 0 &&
              THAT_CLASS.prephaseLogic === false
            ) {
              console.log(
                'Total free territories left ' + THAT_CLASS.freeTerritories
              )
            } else {
              THAT_CLASS.prephaseLogic = true
              MainGame.prototype.prephaseLogic()
            }

            GameWindow.clearDisplayMessage()

            /* displaying different put message according to current player */
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
          }
          /* THIS.putResponse(msg.player.name,msg.territory,msg.units); */
          break

        case Packet.prototype.getTypeOf('REINFORCEMENT'):
          console.log('REINFORCEMENT' + msg)
          // THAT_CLASS.activePlayerReinforcement += msg.data.units
          // localStorage.setItem(
          //   'reinforcements',
          //   THAT_CLASS.activePlayerReinforcement
          // )

          THAT_CLASS.view.players[msg.data.player].reinforcements +=
            msg.data.units
          THAT_CLASS.currentPlayer = msg.data.player
          THAT_CLASS.view.currentPlayer = msg.data.player

          if (msg.data.player == localStorage.getItem('myId'))
            THIS.view.localArmies += msg.data.units
          break

        case Packet.prototype.getTypeOf('START_GAME'):
          console.log('START_GAME' + msg)
          break

        case Packet.prototype.getTypeOf('USE_TOKENS'):
          console.log('USE_TOKENS' + msg)
          /* THIS.useTokensResponse(msg.player.name,msg.units); */
          break

        default:
          break
      }
    }
  }

  ErrorHandling(data){
    var str = data.message
    GameWindow.displayMessage(str.substr(str.indexOf(':') + 1))
    THAT_CLASS.updateViewPlayers(THAT_CLASS.playerList)
    
    switch(data.type){
      case Packet.prototype.getTypeOf('ATTACK'):
        this.beginAttackPhase()
        break
      
      case Packet.prototype.getTypeOf('DEFEND'):
        this.attacked(msg.data.units, msg.data.targetedTerritory)
        break
      
      default:
        break
    }
  }


  innerLoop () {
    THIS.synchronize()

    setInterval(function () {
      THIS.synchronize()
    }, 1000)
  }
}
