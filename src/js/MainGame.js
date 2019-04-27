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
  constructor (v) {
    this.currentPhase = phases['PREPHASE']
    this.map = map
    this.playerList = []
    this.currentPlayer = undefined
    this.activePlayerReinforcement = 0
    this.btnState = false /* for the nextPhase button */
    this.currentUserName = localStorage.name
    this.freeTerritories
    THIS_IS_IT = this
    this.totalUnits = 0
    this.totalPlayers = 0
    this.prephaseLogic = false
    // this.firstPlayer

    // copy of the object GameWindow
    this.view = v
    this.$socket = v.$socket

    this.handleIncommingMessages()
    // v.$socket.send(new Packet('GAME_STATUS').getJson())

    this.synchronize()
    // this.innerLoop();
  }


  getCurrentPhase() {
    return this.currentPhase
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
    console.log(THIS_IS_IT.view.players)

    /* Sets the map data */
    this.setMapData(data)

    /* Set the player localstorage */
    this.setPlayerLocalStorage(data)
    console.log('player localstorage')
    console.log(localStorage)
    console.log('')
    this.startGame()
  }

  /**
   * Returns the local map object
   */
  getLocalMap () {
    return THIS_IS_IT.map
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
      if (this.gameData.players[i].name == localStorage.login) {
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
    console.log(THIS_IS_IT.view.players)
    // console.log(this.playerList)
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
          continentName[countries].soldiers += nbSoldiers
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
  tryPutUnits (player, territory, units) {
    // console.log('try put units')
    // console.log(THIS_IS_IT.currentPlayer)
    // if (localStorage.myId == THIS_IS_IT.currentPlayer) {
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

    // var playerName = THIS_IS_IT.getPlayerNameById(player)

    // test if my territory
    var continent = getContinentOf(territory)
    console.log('player on territory = ' + THIS_IS_IT.map[continent][territory].player)
    console.log('player trying to place unit = '+ player + ', id = ' + THIS_IS_IT.view.players[player].displayName)

    if (THIS_IS_IT.map[continent][territory].player != player && 
      THIS_IS_IT.map[continent][territory].player !== -1) {
      console.log('not your territory')
      GameWindow.clearDisplayMessage()
      GameWindow.displayMessage(territory + ' is not Yours !')
      return
    }

    if (player != THIS_IS_IT.view.currentPlayer) {
      console.log('not your turn, player = ' + player + ', currentPlayer = ' + THIS_IS_IT.view.currentPlayer)
      GameWindow.clearDisplayMessage()
      GameWindow.displayMessage('Not your turn')
      return
    }

    var data = {
      territory: THIS_IS_IT.getCountryIdByName(territory),
      units: units,
    }

    THIS_IS_IT.sendToServer(new Packet('PUT', data))
    
  }

  /**
   * Returns number of free territories left in the game
   */
  getFreeTerritoriesNumber () {
    return THIS_IS_IT.freeTerritories
  }

  /**
   * Returns the game active player id
   */
  getActivePlayerId () {
    return THIS_IS_IT.view.currentPlayer
  }

  /**
   * return the active player name string
   */
  getActivePlayerName () {
    var self = THIS_IS_IT
    return self.playerList[self.getActivePlayerId()].displayName
  }

  /**
   * Returns the name matching the given player id
   *
   * @param playerId id to search
   * @return player name string
   */
  getPlayerNameById (playerId) {
    var self = THIS_IS_IT
    return self.playerList[playerId].displayName
  }

  /**
   * Returns the id number matching the given player name
   * @param playerName
   * @return id of the corresponding player name
   */
  getPlayerIdByName (playerName) {
    var self = THIS_IS_IT
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
    return THIS_IS_IT.nbPlayers
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
      GameWindow.clearDisplayMessage()
      console.log('localstorage id = ' + localStorage.myId + ', activeplayerid = ' + self.getActivePlayerId())
      if (localStorage.myId == self.getActivePlayerId()) {
        GameWindow.displayCurrentPlayer()
        GameWindow.displayMessage('Choose a territory !')
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
    THIS_IS_IT.view.$socket.send(new Packet('PUT', data).getJson())
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
    THIS_IS_IT.view.$socket.send(new Packet('PUT', data).getJson())
  }

  prephaseLogic () {
    console.log('prephaseLogic')

    /* Modificates addeventlistener on dblclick */
    GameWindow.disableDbClick()

    /* The new event listener for using units left */
    var map = document.getElementById('GameMap')
    map.addEventListener('dblclick', GameWindow._addReinforcement, true)

    // var map = document.getElementById('GameMap')
    // map.addEventListener('dblclick', function (evt) {
    //     GameWindow.addReinforcement(evt)
    // })

    var ms = 3000
    var self = THIS_IS_IT
    setTimeout(function () {
      GameWindow.clearDisplayMessage()
      if (localStorage.myId == self.getActivePlayerId()) {
        GameWindow.displayMessage(
          'You are playing, put reinforcement units on your territories !'
        )
      } else {
        GameWindow.displayMessage(
          self.getActivePlayerName() + ' is reinforcing his/her territories !'
        )
      }
    }, ms)
  }

  getMyReinforcementNum () {
    console.log('my reinforcements : ' + THIS_IS_IT.view.players[localStorage.getItem('myId')])
    return THIS_IS_IT.view.players[localStorage.getItem('myId')]
  }

  nextPlayerTurn () {
    THIS_IS_IT.currentPlayer =
      (THIS_IS_IT.currentPlayer + 1) % THIS_IS_IT.totalPlayers
    THIS_IS_IT.view.currentPlayer = THIS_IS_IT.currentPlayer
    console.log('current player = ' + THIS_IS_IT.currentPlayer + ', id =' +
      THIS_IS_IT.playerList[THIS_IS_IT.currentPlayer].displayName)
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
    var checkMap = THIS_IS_IT.getLocalMap()
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
    this.currentPhase = (this.currentPhase + 1) % 3
  }

  sendToServer (packet) {
    this.$socket.send(packet.getJson())
  }

  synchronize () {
    this.sendToServer(new Packet('GAME_STATUS'))
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
  /* this function must be triggered  when the active player clicks on a territory
    to put an unit during the first phase */
  /**
   *
   * @param token1  first token
   * @param token2  second token
   * @param token3  third token
   */

  useSet (token1, token2, token3) {
    if (
      this.getPlayerNumberOfTokens(this.currentPlayer) > 4 &&
      this.currentPlayer.name == this.activePlayer.name
    ) {
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
      this.putUnit(player, territory, unit)
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
    console.log('current phase ' + THIS_IS_IT.currentPhase)
    if (THIS_IS_IT.currentPhase == -1) {
      var continent = getContinentOf(territory)
      var data = {
        territory: THIS_IS_IT.getCountryIdByName(territory),
        units: units
      }
      console.log(THIS_IS_IT.map[continent][territory].player)
      if (THIS_IS_IT.map[continent][territory].player != localStorage.myId) {
        console.log(
          "you are not the owner's territrory. you cannot put units here "
        )
      } else {
        console.log('sending put demand')
        THIS_IS_IT.$socket.send(new Packet('PUT', data).getJson())
      }
    } else {
      console.log('put unit failed')
    }
  }

  checkAllPlayersReinforcements () {
    console.log('players reinforcements :')
    for (var i = 0; i < THIS_IS_IT.playerList.length; i++) {
      console.log(
        'player' + i + ' : ' + THIS_IS_IT.playerList[i].reinforcements
      )
    }
  }

  readyToNextPhase () {
    console.log('Ready to phase 1')
    GameWindow.clearDisplayMessage()
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
    var unitsLeft = localStorage.getItem('reinforcements')

    /*******************************************************************************************/
    console.log('update reinforcement: ' + unitsLeft + ' to ' + (unitsLeft - 1))

    unitsLeft = unitsLeft - 1
    var territoriesNum
    if (this.getFreeTerritoriesNumber() > 0)
    {
      territoriesNum = parseInt(localStorage.getItem('territories')) + 1
    }
    else 
    {
      territoriesNum = parseInt(localStorage.getItem('territories'))
    }
    THIS_IS_IT.view.localArmies = unitsLeft
    THIS_IS_IT.view.localTerritories = territoriesNum

    console.log(territoriesNum)

    localStorage.setItem('reinforcements', unitsLeft)
    localStorage.setItem('territories', territoriesNum)

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
            console.log('CURRENT_PHASE: ' + msg.data.phase)
            /* updates the current phase in players controls area*/
            GameWindow.displayCurrentPhase(msg.data.phase)
            if (msg.phase == phases['PREPHASE']) {
              THAT_CLASS.currentPhase = msg.phase
              // THAT_CLASS.currentPlayer = THAT_CLASS.firstPlayer
            } else if (msg.phase == phases['REINFORCEMENT']) {
              THAT_CLASS.currentPhase = msg.phase
              //THAT_CLASS.currentPlayer = THAT_CLASS.msg.player
            }
            // THAT_CLASS.nextPhaseBtnState(msg.phase)

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
            THAT_CLASS.updateViewPlayers(THAT_CLASS.playerList)
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

            THAT_CLASS.view.players[msg.data.player].tokens.tok1 += msg.data.token1
            THAT_CLASS.view.players[msg.data.player].tokens.tok2 += msg.data.token2
            THAT_CLASS.view.players[msg.data.player].tokens.tok3 += msg.data.token3
            THAT_CLASS.view.players[msg.data.player].tokens.tok4 += msg.data.token4

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
            THAT_CLASS.view.players[msg.data.player].reinforcements -= msg.data.units
            // THAT_CLASS.playerList[msg.data.player].reinforcements -= msg.data.units

            if (THAT_CLASS.currentPhase == phases['PREPHASE']) {
              /* updating current player turn */
              // THAT_CLASS.currentPlayer =
              //    (THAT_CLASS.currentPlayer + 1) % THAT_CLASS.totalPlayers

              /* updating total amount of units left */
              THIS_IS_IT.totalUnits -= 1
              console.log('Total units left ' + THIS_IS_IT.totalUnits)
              /* saving last player who put for display purposes */
              var currentPlayerBefore = THAT_CLASS.currentPlayer
              /* updating current player turn */
              THAT_CLASS.nextPlayerTurn()
              GameWindow.displayCurrentPlayer()

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
                GameWindow.drawSoldier (
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
                // THAT_CLASS.playerList[currentPlayerBefore].reinforcements--
                // THAT_CLASS.view.players[currentPlayerBefore].reinforcements--
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
                var gmap = document.getElementById('GameMap')
                // gmap.removeEventListener('dblclick', GameWindow._addReinforcement, true)
                GameWindow.clearDisplayMessage()
                GameWindow.displayMessage('All units are in place now !')
              }
            }
            /* this.putResponse(msg.player.name,msg.territory,msg.units); */
            break

          case Packet.prototype.getTypeOf('REINFORCEMENT'):
            console.log('REINFORCEMENT' + msg)
            // THAT_CLASS.activePlayerReinforcement += msg.data.units
            // localStorage.setItem(
            //   'reinforcements',
            //   THAT_CLASS.activePlayerReinforcement
            // )

            THAT_CLASS.view.players[msg.data.player].reinforcements += msg.data.units
            break

          case Packet.prototype.getTypeOf('START_GAME'):
            console.log('START_GAME' + msg)
            break

          case Packet.prototype.getTypeOf('USE_TOKENS'):
            console.log('USE_TOKENS' + msg)
            /* this.useTokensResponse(msg.player.name,msg.units); */
            break

          default:
            break
        }
      }
    }
  }

  innerLoop () {
    THIS_IS_IT.synchronize()

    setInterval(function () {
      THIS_IS_IT.synchronize()
    }, 1000)
  }
}
