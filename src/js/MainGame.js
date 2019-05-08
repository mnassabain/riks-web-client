import { Packet } from '../Packet'
import { map, getContinentOf } from './Map'
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
    this.activePlayerReinforcement = 0
    this.btnState = false /* for the nextPhase button */
    this.currentUserName = localStorage.name
    this.freeTerritories = 42
    THIS = this
    this.totalPlayers = 0
    this.prephaseLogic = false
    this.gameIsSet = false
    this.prephaseIsDone = false
    this.attackUnits = 0
    this.haveFortified = false

    this.autoInit = true
    this.autoRein = false
    this.cpt = 0
    this.lastFortify = {
      tSource: null,
      tDest: null
    }

    // copy of the object GameWindow
    this.view = v
    this.$socket = v.$socket

    this.handleIncommingMessages()
    // v.$socket.send(new Packet('GAME_STATUS').getJson())

    this.synchronize()
    // this.innerLoop()

    this.timeoutDisplay = undefined
  }

  getCurrentPhase () {
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
    this.view.currentPlayer = data.activePlayer
    // this.firstPlayer = data.activePlayer
    console.log('currentPlayer ' + THIS.view.currentPlayer)
    this.totalPlayers = data.nbPlayers
    console.log('totalPlayers ' + this.totalPlayers)

    /* sets view's players array */
    this.setPlayersData(data)
    console.log('view.players after update')
    console.log(THIS.view.players)

    /* Set the player localstorage */
    this.setPlayerLocalStorage(data)

    /* Sets the map data */
    this.setMapData(data)

    var myColor = SupportedColors[localStorage.getItem('myId')]

    // SupportedColors[]

    GameWindow.displayMyColor(myColor)

    GameWindow.unhighlightTerritory()

    switch (THIS.currentPhase) {
      case phases['PREPHASE']:
        console.log('start game')
        THIS.startGame()
        break

      case phases['REINFORCEMENT']:
        console.log('reinforcement phase')
        THIS.reinforcementLogic()
        break

      case phases['OFFENSE']:
        console.log('offenc phase')
        THIS.beginAttackPhase()
        break

      case phases['FORTIFICATION']:
        console.log('fortification phase')
        THIS.fortificationLogic()
        break

      default:
        break
    }
  }

  clearTimeoutDisplay () {
    try {
      clearTimeout(this.timeoutDisplay)
      console.log('Cleared timeout')
    } catch (error) {
      console.log('cannot clear')
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
    THIS.playerList = []
    for (var i = 0; i < data.players.length; i++) {
      var player = data.players[i]
      var p = new Player(i, player.name, i)
      p.reinforcements = data.players[i].reinforcements
      p.tokens.tok1 = data.players[i].tokens.tok1
      p.tokens.tok2 = data.players[i].tokens.tok2
      p.tokens.tok3 = data.players[i].tokens.tok3
      p.tokens.tok4 = data.players[i].tokens.tok4
      console.log('player is set :')
      console.log(p)
      THIS.playerList.push(p)
      if (localStorage.login === data.players[i].name) {
        THIS.view.localNbTokenTypeJoker = data.players[i].tokens.tok1
        THIS.view.localNbTokenTypeOne = data.players[i].tokens.tok2
        THIS.view.localNbTokenTypeTwo = data.players[i].tokens.tok3
        THIS.view.localNbTokenTypeThree = data.players[i].tokens.tok4
      }
    }
    console.log('this playerlist is set')
    console.log(THIS.playerList)

    // The player list is copyied to the view
    THIS.view.players = THIS.playerList
  }

  getPlayers () {
    console.log('this playerlist')
    return THIS.playerList
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
        localStorage.setItem('token1', data.players[i].tokens.tok2)
        localStorage.setItem('token2', data.players[i].tokens.tok3)
        localStorage.setItem('token3', data.players[i].tokens.tok4)
        localStorage.setItem('tokenJoker', data.players[i].tokens.tok1)
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

    for (var j = 0; j < THIS.totalPlayers; j++) {
      THIS.view.players[j].nbTerritories = 0
      THIS.view.players[j].reinforcements = data.players[j].reinforcements
    }

    /* Looping on local map object */
    Object.keys(THIS.map).forEach(key => {
      var continentName = THIS.map[key]
      for (var countries in continentName) {
        /* copying territories data received from the server */
        continentName[countries].soldiers = data.board[i].nbUnits
        continentName[countries].player = data.board[i].ownerId
        if (data.board[i].ownerId !== -1) {
          GameWindow.setCountryColor(
            SupportedColors[data.board[i].ownerId],
            THIS.getCountryIdByName(countries)
          )

          GameWindow.drawSoldier(
            SupportedColors[data.board[i].ownerId],
            countries
          )

          GameWindow.updateCountrySoldiersNumber(
            THIS.getCountryIdByName(countries)
          )

          /* Updating territories number */
          THIS.view.players[data.board[i].ownerId].nbTerritories++
        }

        i++
      }
    })

    for (var j = 0; j < THIS.totalPlayers; j++) {
      GameWindow.updateRatioBar(j, THIS.view.players[j].nbTerritories)
      if (localStorage.getItem('myId') == j) {
        console.log(
          'nb terr player ' + j + ' : ' + THIS.view.players[j].nbTerritories
        )
        console.log(
          'nb reinf player ' + j + ' : ' + THIS.view.players[j].reinforcements
        )
        THIS.view.localTerritories = THIS.view.players[j].nbTerritories
        THIS.view.localArmies = THIS.view.players[j].reinforcements
      }
    }
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
   * Checks if player cat call server for putting units on given territory
   *
   * @returns true or false
   */
  tryPutUnits (player, territory, units) {
    /* test if enough units left */
    if (MainGame.prototype.getMyReinforcementNum() <= 0) {
      console.log('not enough units')
      GameWindow.clearDisplayMessage()
      GameWindow.displayMessage("You've got no more units left !")
      return
    }

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

  getMyPlayer () {
    return THIS.getPlayerById(localStorage.getItem('myId'))
  }

  /**
   * return the active player name string
   */
  getActivePlayerName () {
    return THIS.view.players[THIS.view.currentPlayer].displayName
  }

  /**
   * return the active player
   */
  getActivePlayer () {
    return THIS.view.currentPlayer
  }

  /**
   * Returns the name matching the given player id
   *
   * @param playerId id to search
   * @return player name string
   */
  getPlayerNameById (playerId) {
    return THIS.view.players[playerId].displayName
  }

  getPlayerById (playerId) {
    return THIS.view.players[playerId]
  }

  /**
   * Returns the id number matching the given player name
   * @param playerName
   * @return id of the corresponding player name
   */
  getPlayerIdByName (playerName) {
    for (var i = 0; i < THIS.view.players.length; i++) {
      if (playerName === THIS.view.players[i].displayName) return i
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
      THIS.view.currentPlayer.name == THIS.currentUserName &&
      THIS.currentPhase != phase
    ) {
      THIS.btnState = true
      THIS.currentPhase = phase
    } else {
      THIS.btnState = false
    }
  }

  useTokensResponse (msg) {
    /* UPDATING for all clients */
    THIS.translateReceivedToken(msg.data.token1, msg.data.player, 'ALL')
    THIS.translateReceivedToken(msg.data.token2, msg.data.player, 'ALL')
    THIS.translateReceivedToken(msg.data.token3, msg.data.player, 'ALL')

    if (msg.data.player == localStorage.getItem('myId')) {
      THIS.translateReceivedToken(msg.data.token1, msg.data.player, 'LOCAL')
      THIS.translateReceivedToken(msg.data.token2, msg.data.player, 'LOCAL')
      THIS.translateReceivedToken(msg.data.token3, msg.data.player, 'LOCAL')
    }
    THIS.tryShowTokenTradeBtn()
  }

  translateReceivedToken (tokenId, playerId, scope) {
    if (scope === 'ALL') {
      switch (tokenId) {
        case 0:
          THIS.view.players[playerId].tokens.tok1--
          break
        case 1:
          THIS.view.players[playerId].tokens.tok2--
          break
        case 2:
          THIS.view.players[playerId].tokens.tok3--
          break
        case 3:
          THIS.view.players[playerId].tokens.tok4--
          break
        default:
          break
      }
    }
    if (scope === 'LOCAL') {
      switch (tokenId) {
        case 0:
          THIS.view.localNbTokenTypeJoker--
          break
        case 1:
          THIS.view.localNbTokenTypeOne--
          break
        case 2:
          THIS.view.localNbTokenTypeTwo--
          break
        case 3:
          THIS.view.localNbTokenTypeThree--
          break
        default:
          break
      }
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
    this.clearTimeoutDisplay()
    THIS.timeoutDisplay = setTimeout(function () {
      GameWindow.clearDisplayMessage()
      console.log(
        'localstorage id = ' +
          localStorage.myId +
          ', activeplayerid = ' +
          THIS.view.currentPlayer
      )

      GameWindow.displayCurrentPlayer()
      if (localStorage.getItem('myId') == THIS.view.currentPlayer) {
        GameWindow.displayMessage('Click on a territory to claim it !')
      } else {
        GameWindow.displayMessage(
          THIS.getActivePlayerName() + ' is choosing a territory !'
        )
      }
      console.log('free territories = ' + THIS.getFreeTerritoriesNumber())
    }, ms)
    /**
     * from now players claim territories turn by turn on map
     * using dbclick on territory, until no more free territories left
     */
  }

  autoInit (id) {
    console.log('cpt = ' + THIS.cpt)
    var cId = THIS.cpt + id
    var tName = THIS.getCountryNameById(cId)
    if (THIS.autoInit === true && THIS.cpt < 42) {
      THIS.tryPutUnits(id, tName, 1)
      THIS.cpt += THIS.getNbPlayers()
    }
  }

  autoReinforce (id) {
    console.log('cpt = ' + THIS.cpt)
    var tName = THIS.getCountryNameById(parseInt(id))
    if (THIS.autoRein === true && THIS.cpt < 38) {
      THIS.tryPutUnits(id, tName, 1)
      THIS.cpt += 1
    }
  }

  getAutoInit () {
    return THIS.autoInit
  }

  getAutoRein () {
    return THIS.autoRein
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

    THIS.cpt = 0
    THIS.autoInit = false
    THIS.autoRein = true

    /* The new event listener for using units left */
    var map = document.getElementById('GameMap')
    map.addEventListener('click', GameWindow._addReinforcement, true)

    var ms = 3000
    this.clearTimeoutDisplay()
    THIS.timeoutDisplay = setTimeout(function () {
      GameWindow.clearDisplayMessage()
      console.log(
        'localstorage id = ' +
          localStorage.getItem('myId') +
          ', view.current = ' +
          THIS.view.currentPlayer
      )
      if (localStorage.getItem('myId') == THIS.view.currentPlayer) {
        GameWindow.displayMessage(
          'Put reinforcement units on your territories !'
        )
      } else {
        GameWindow.displayMessage(
          THIS.getActivePlayerName() + ' is reinforcing his/her territories !'
        )
      }
    }, ms)
  }

  getMyReinforcementNum () {
    console.log(
      'my reinforcements : ' + THIS.view.players[localStorage.getItem('myId')]
    )
    return THIS.view.players[localStorage.getItem('myId')]
  }

  nextPlayerTurn () {
    THIS.view.currentPlayer = (THIS.view.currentPlayer + 1) % THIS.totalPlayers
    // THIS.view.currentPlayer = THIS.currentPlayer
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
      THIS.getPlayerNumberOfTokens(THIS.view.currentPlayer) > 4 &&
      THIS.view.currentPlayer.name == THIS.activePlayer.name
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
      console.log('player' + i + ' : ' + THIS.playerList[i].reinforcements)
    }
  }

  readyToNextPhase () {
    console.log('Ready to phase 1')
    GameWindow.clearDisplayMessage()
  }

  endPhase () {
    THIS.$socket.send(new Packet('END_PHASE').getJson())
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

    /* Highlight the belligerents */
    GameWindow.highlightTerritory(
      THIS.getCountryNameById(tSource),
      THIS.getCountryNameById(tDest)
    )
  }

  /** Called when the player is being attacked
   *
   * PRIVATE METHOD: DO NOT CALL FROM VIEW
   *
   * @param nbUnits number of attacking units
   */
  attacked (nbUnits, targetedTerritory) {
    if (nbUnits !== undefined && targetedTerritory !== undefined) {
      /* display that the player is being attacked, let him defend */
      console.log('You are being attacked with ' + nbUnits)
      GameWindow.clearDisplayMessage()
      GameWindow.displayMessage(
        'You are being attacked on' +
          targetedTerritory +
          ' by ' +
          nbUnits +
          ' unit(s)'
      )
      // TODO: add some timeout here
      GameWindow.clearDisplayMessage()
      GameWindow.defendTerritoryNotification(nbUnits, targetedTerritory)
    } else {
      GameWindow.defendTerritoryNotification()
    }
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

    var tmpSource = tSource
    var tmpDest = tDest

    /* were are getting IDs from server, getting name strings of countries */
    tSource = THIS.getCountryNameById(tSource)
    tDest = THIS.getCountryNameById(tDest)

    var cSource = getContinentOf(tSource)
    var cDest = getContinentOf(tDest)

    /* Unhighlight the belligerents */
    GameWindow.unhighlightTerritory()

    /* apply losses */
    THIS.map[cSource][tSource].soldiers -= attackerLoss
    THIS.map[cDest][tDest].soldiers -= defenderLoss
    /* displaying loss(es) on map (using country IDs) */
    GameWindow.updateCountrySoldiersNumber(tmpSource)
    GameWindow.updateCountrySoldiersNumber(tmpDest)
    // Rest
    console.log('attackUnits = ' + THIS.attackUnits)
    var restAttack = THIS.attackUnits - attackerLoss
    console.log('restattack = ' + restAttack)

    var attackingPlayer = THIS.getPlayerById(THIS.map[cSource][tSource].player)
    var defendingPlayer = THIS.getPlayerById(THIS.map[cDest][tDest].player)

    var myPlayer = THIS.getMyPlayer()

    console.log(attackingPlayer)
    console.log(defendingPlayer)
    console.log(myPlayer)

    GameWindow.addServerMessage(
      'LOSSES',
      attackingPlayer.displayName +
        ' lost ' +
        attackerLoss +
        ' units <br>' +
        defendingPlayer.displayName +
        ' lost ' +
        defenderLoss +
        ' units'
    )

    var dead = false
    /* if there are no more units on the territory */
    if (THIS.map[cDest][tDest].soldiers <= 0) {
      // is dead : replace dest soldiers by attackers soldiers
      dead = true

      if (attackingPlayer.id == myPlayer.id) {
        // We attacked
        GameWindow.addServerMessage('COMBAT', 'You conquered ' + tDest + ' !')
      } else if (defendingPlayer.id == myPlayer.id) {
        GameWindow.addServerMessage('COMBAT', 'You lost ' + tDest + " :'(")
      } else {
        GameWindow.addServerMessage(
          'COMBAT',
          defendingPlayer.displayName + ' lost ' + tDest
        )
      }

      THIS.view.players[THIS.map[cDest][tDest].player].nbTerritories--

      /* updating local player territories number (NW UI) */
      if (localStorage.getItem('myId') == THIS.map[cDest][tDest].player) {
        THIS.view.localTerritories--
      }

      THIS.map[cDest][tDest].player = THIS.map[cSource][tSource].player
      THIS.map[cDest][tDest].soldiers = restAttack
      THIS.map[cSource][tSource].soldiers -= THIS.attackUnits

      console.log('Attacker territory after conquer : ')
      console.log(tSource)
      console.log(THIS.map[cSource][tSource].soldiers)
      console.log('Territory ' + tDest + ' is conquered by the attacker')

      /* change the color of a territory during the pre-phase */
      GameWindow.setCountryColor(
        SupportedColors[THIS.map[cSource][tSource].player],
        tmpDest
      )
      /* puts the soldier icon with the number area */
      GameWindow.updateSoldierColor(
        SupportedColors[THIS.map[cSource][tSource].player],
        tDest
      )
      THIS.view.players[THIS.map[cSource][tSource].player].nbTerritories++

      /* updating local player territories number (NW UI) */
      if (localStorage.getItem('myId') == THIS.map[cSource][tSource].player) {
        THIS.view.localTerritories++
      }

      GameWindow.updateCountrySoldiersNumber(tmpDest)
      GameWindow.updateCountrySoldiersNumber(tmpSource)
    } else {
      GameWindow.updateCountrySoldiersNumber(tmpDest)
    }

    // updating the ratio bar
    for (var i = 0; i < THIS.totalPlayers; i++) {
      GameWindow.updateRatioBar(i, THIS.playerList[i].nbTerritories)
    }

    if (!dead) {
      this.beginAttackPhase()
    } else {
      // Player can move soldiers
      if (attackingPlayer.id == myPlayer.id) {
        THIS.lastFortify.tSource = tSource
        THIS.lastFortify.tDest = tDest
        GameWindow.fortifyAfterConquering(tSource, tDest)
      }
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
    var sourceId = tSource
    var destId = tDest

    tSource = THIS.getCountryNameById(tSource)
    tDest = THIS.getCountryNameById(tDest)

    /* continent which contains the source territory */
    var cSource = getContinentOf(tSource)

    /* continent which contains the destination territory */
    var cDest = getContinentOf(tDest)

    /* move units */
    THIS.map[cSource][tSource].soldiers -= nbUnits
    THIS.map[cDest][tDest].soldiers += nbUnits

    // updating local map data
    GameWindow.updateCountrySoldiersNumber(sourceId)
    GameWindow.updateCountrySoldiersNumber(destId)

    GameWindow.displayUITop()
    GameWindow.enableNextPhaseBtn()
    THIS.haveFortified = true
    THIS.fortificationLogic(
      'You moved ' + nbUnits + ' unit(s) from ' + tSource + ' to ' + tDest
    )
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

    /* check if the player controls those territories */
    if (
      THIS.map[cSource][tSource].player != THIS.map[cDest][tDest].player ||
      THIS.map[cSource][tSource].player != THIS.view.currentPlayer
    ) {
      console.log('Action not permitted: you do not control the territories')

      THIS.fortificationLogic('You do not control all of the two territories.')

      return -1
    }

    /* check if the number of units is ok */
    if (THIS.map[cSource][tSource].soldiers <= nbUnits) {
      console.log('Action not permitted: not enough units')
      THIS.fortificationLogic('Not enough units present on ' + tSource)

      return -1
    }

    /* check if the territories are adjacent */
    // if (!areAdjacent(tSource, tDest)) {
    //   console.log('Action not permitted: territories not adjacent')
    //   return -1
    // }

    tSource = THIS.getCountryIdByName(tSource)
    tDest = THIS.getCountryIdByName(tDest)

    /* if all tests pass notify server */
    var data = {
      source: tSource,
      destination: tDest,
      units: nbUnits
    }

    THIS.sendToServer(new Packet('MOVE', data))

    return 0
  }

  tryUseTokens (token1, token2, token3) {
    var data = {
      token1: token1,
      token2: token2,
      token3: token3
    }
    THIS.sendToServer(new Packet('USE_TOKENS', data))
  }

  reinforcementLogic () {
    THIS.haveFortified = false
    /* checking current user tokens if trade is possible */
    GameWindow.enableNextPhaseBtn()
    THIS.tryShowTokenTradeBtn()
    GameWindow.setNextPhaseBtnImg()
    GameWindow.disableDbClick()
    GameWindow.onDbClickReinUI()
    GameWindow.clearFortifyChooseUnits()
    GameWindow._disableChooseTerritoryToFortify()
    GameWindow._disableFortifyFromTerritory()
    GameWindow.displayCurrentPlayer()
    GameWindow.clearDisplayMessage()
    console.log(
      'localstorage id = ' +
        localStorage.getItem('myId') +
        ', view.current = ' +
        THIS.view.currentPlayer
    )
    if (localStorage.getItem('myId') == THIS.view.currentPlayer) {
      GameWindow.displayMessage('Put reinforcement units on your territories !')
    } else {
      GameWindow.displayMessage(
        THIS.getActivePlayerName() + ' is reinforcing his/her territories !'
      )
    }
  }

  beginAttackPhase (message) {
    var secondStr = ''
    if (message !== undefined) {
      secondStr = message + '<br/>'
    }

    console.log('Server is now on phase offense')
    GameWindow.displayCurrentPlayer()
    if (localStorage.getItem('myId') == THIS.view.currentPlayer) {
      // Display message to select
      GameWindow.displayCurrentPlayer()
      GameWindow.displayMessage(
        secondStr + 'You are attacking, select start territory'
      )
      // Enable click
      GameWindow._enableAttackFromTerritory()
      // 1. Select territory from which to attack

      // 2. Select territory to attack (no restrain)

      // 3. Send info to server
    } else {
      GameWindow.displayMessage(
        THIS.getPlayerNameById(THIS.view.currentPlayer) + ' is attacking'
      )
    }
  }

  fortificationLogic (message) {
    console.log('Server is now on phase fortification')
    var secondStr = ''
    if (message !== undefined) {
      secondStr = message + '<br/>'
      GameWindow.displayUITop()
      GameWindow.displayCurrentPlayer()
    }
    GameWindow.displayCurrentPlayer()
    console.log(
      'CURRENT PHASE: ' + THIS.currentPhase + 'OFFENSE: ' + phases['OFFENSE']
    )
    console.log('HAVE FORTIFIED: ' + THIS.haveFortified)
    if (
      THIS.haveFortified === false &&
      THIS.currentPhase != phases['OFFENSE']
    ) {
      if (localStorage.getItem('myId') == THIS.view.currentPlayer) {
        // disable attack logic
        GameWindow._disableAttackFromTerritory()
        GameWindow._disableChooseTerritoryToAttack()
        GameWindow.displayCurrentPlayer()
        GameWindow.setEndtourBtnImg()
        GameWindow.displayMessage(
          secondStr + 'You can fortify your territories.'
        )
        // Enable fortify logic
        GameWindow._enableFortifyFromTerritory()
      } else {
        GameWindow.displayMessage(
          THIS.getPlayerNameById(THIS.view.currentPlayer) + ' is fortifying.'
        )
      }
    } else {
      GameWindow._disableFortifyFromTerritory()
      GameWindow._disableChooseTerritoryToFortify()
      if (localStorage.getItem('myId') == THIS.view.currentPlayer) {
        GameWindow.displayCurrentPlayer()
        if (THIS.currentPhase == phases['OFFENSE']) {
          GameWindow.displayMessage(secondStr + 'You can continue attacking')
        } else {
          GameWindow.displayMessage(
            secondStr + 'You can now give turn to next player'
          )
        }

        GameWindow.enableNextPhaseBtn()
      } else {
        if (THIS.currentPhase != phases['OFFENSE']) {
          GameWindow.displayMessage(
            THIS.getPlayerNameById(THIS.view.currentPlayer) +
              ' is finishing his/her turn.'
          )
        } else {
          GameWindow.displayMessage(
            THIS.getPlayerNameById(THIS.view.currentPlayer) +
              ' decided not to move soldiers.'
          )
        }
      }
    }

    if (THIS.currentPhase == phases['OFFENSE']) {
      THIS.beginAttackPhase()
    }
  }

  getUnitsOnTerritory (territoryName) {
    var cName = getContinentOf(territoryName)
    var units = THIS.map[cName][territoryName].soldiers
    return units
  }

  getTerritoryOwnerName (territoryName) {
    var cName = getContinentOf(territoryName)
    var owner = THIS.map[cName][territoryName].player
    var ownerName = THIS.getPlayerNameById(owner)
    return ownerName
  }

  sendChatMessage (message) {
    var data = {
      message: message
    }

    THIS.sendToServer(new Packet('CHAT', data))
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
          /* display attack to other players */
          var tSource = THAT_CLASS.getCountryNameById(msg.data.source)
          var tDest = THAT_CLASS.getCountryNameById(msg.data.destination)

          var cSource = getContinentOf(tSource)
          var cDest = getContinentOf(tDest)

          var attackingPlayer = THAT_CLASS.getPlayerNameById(
            THAT_CLASS.map[cSource][tSource].player
          )
          var defendingPlayer = THAT_CLASS.getPlayerNameById(
            THAT_CLASS.map[cDest][tDest].player
          )

          GameWindow.displayMessage(
            attackingPlayer +
              ' launched an attack from ' +
              tSource +
              ' with ' +
              msg.data.units +
              ' units onto ' +
              tDest +
              ' of ' +
              defendingPlayer
          )

          THAT_CLASS.attack(
            msg.data.source,
            msg.data.destination,
            msg.data.units
          )
          console.log('ATTACK response')
          console.log(msg.data)
          THIS.attackUnits = msg.data.units
          console.log('attackUnits = ' + THIS.attackUnits)
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
          console.log(
            'CURRENT_PHASE: ' +
              msg.data.phase +
              ', now ' +
              THIS.playerList[THIS.view.currentPlayer].displayName +
              ' is playing'
          )
          if (THIS.currentPhase != msg.data.phase) {
            THIS.currentPhase = (THIS.currentPhase + 1) % 3
          }

          /* updates the current phase in players controls area */
          GameWindow.displayCurrentPhase(msg.data.phase)
          THAT_CLASS.currentPhase = msg.data.phase

          if (msg.data.phase == phases['REINFORCEMENT']) {
            THIS.reinforcementLogic()
          }

          THIS.autoRein = false
          /* updates the current phase in players controls area */
          GameWindow.displayCurrentPhase(msg.data.phase)

          THAT_CLASS.currentPhase = msg.data.phase

          if (msg.data.phase == phases['OFFENSE']) {
            GameWindow.hideTokenUIBtn()
            GameWindow.clearUseTokensUI()
            THIS.beginAttackPhase()
          }

          if (msg.data.phase == phases['FORTIFICATION']) {
            THIS.haveFortified = false
            THIS.fortificationLogic()
          }
          break

        case Packet.prototype.getTypeOf('DEFEND'):
          console.log('defend response')
          console.log(msg.data)
          THAT_CLASS.defend(msg.data.defenderName, msg.data.units)

          break

        case Packet.prototype.getTypeOf('DIE'):
          var playerDead = msg.data.player
          var me = THIS.getMyPlayer()

          if (playerDead == me.id) {
            GameWindow.showDeadNotification()
          }
          GameWindow.setPlayerDead(playerDead)
          break

        case Packet.prototype.getTypeOf('ERROR'):
          // print the type of the error in the console
          THIS.ErrorHandling(msg.data)
          break

        case Packet.prototype.getTypeOf('GAME_OVER'):
          console.log('GAME_OVER' + msg)
          localStorage.setItem(
            'winner',
            THAT_CLASS.getPlayerNameById(msg.data.winner)
          )
          THAT_CLASS.sendToServer(new Packet('LEAVE_GAME'))
          GameWindow.stopTimer()
          THIS.$socket.onmessage
          THIS.view.goToGameOver()
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
          console.log('GIVE_TOKENS')
          console.log(msg)

          THAT_CLASS.view.players[msg.data.player].tokens.tok1 +=
            msg.data.token1
          THAT_CLASS.view.players[msg.data.player].tokens.tok2 +=
            msg.data.token2
          THAT_CLASS.view.players[msg.data.player].tokens.tok3 +=
            msg.data.token3
          THAT_CLASS.view.players[msg.data.player].tokens.tok4 +=
            msg.data.token4

          console.log('VIEW.CURRENTPLAYER' + THIS.view.currentPlayer)
          console.log('msg data player' + msg.data.player)

          if (msg.data.player == localStorage.getItem('myId')) {
            THAT_CLASS.view.localNbTokenTypeOne += msg.data.token2
            THAT_CLASS.view.localNbTokenTypeTwo += msg.data.token3
            THAT_CLASS.view.localNbTokenTypeThree += msg.data.token4
            THAT_CLASS.view.localNbTokenTypeJoker += msg.data.token1
          }
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
          console.log('MOVE')
          console.log(msg)
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
          /* local player informations */
          if (localStorage.getItem('myId') == msg.data.player) {
            THAT_CLASS.view.localArmies -= msg.data.units
          }

          if (THAT_CLASS.currentPhase == phases['PREPHASE']) {
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
              GameWindow.drawSoldier(
                SupportedColors[msg.data.player],
                THAT_CLASS.getCountryNameById(msg.data.territory)
              )

              THAT_CLASS.view.players[msg.data.player].nbTerritories++
              if (localStorage.getItem('myId') == msg.data.player) {
                THAT_CLASS.view.localTerritories++
              }
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
            } else {
              GameWindow.displayMessage(
                THAT_CLASS.getPlayerNameById(msg.data.player) +
                  ' choosed to put ' +
                  msg.data.units +
                  ' unit(s) on ' +
                  THAT_CLASS.getCountryNameById(msg.data.territory)
              )
            }
          } else if (THAT_CLASS.currentPhase == phases['REINFORCEMENT']) {
            THAT_CLASS.updateMapData(
              THAT_CLASS.getCountryNameById(msg.data.territory),
              msg.data.player,
              msg.data.units
            )

            GameWindow.updateCountrySoldiersNumber(msg.data.territory)
            GameWindow.clearDisplayMessage()

            /* displaying different put message according to current player */
            if (msg.data.player == localStorage.myId) {
              GameWindow.displayMessage(
                'You choosed to put ' +
                  msg.data.units +
                  ' unit(s) on ' +
                  THAT_CLASS.getCountryNameById(msg.data.territory)
              )
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
          // updating the ratio bar
          for (var i = 0; i < THAT_CLASS.totalPlayers; i++) {
            GameWindow.updateRatioBar(i, THAT_CLASS.playerList[i].nbTerritories)
          }
          break

        case Packet.prototype.getTypeOf('REINFORCEMENT'):
          THAT_CLASS.view.currentPlayer = msg.data.player
          console.log('REINFORCEMENT')
          console.log(msg)

          /* checking current user tokens if trade is possible */
          THIS.tryShowTokenTradeBtn()

          THAT_CLASS.view.players[msg.data.player].reinforcements +=
            msg.data.units

          if (msg.data.player == localStorage.getItem('myId')) {
            THIS.view.localArmies += msg.data.units
            GameWindow.displayUnitsTraded(msg.data.units)
          }
          GameWindow.displayCurrentPlayer()
          break

        case Packet.prototype.getTypeOf('START_GAME'):
          console.log('START_GAME' + msg)
          break

        case Packet.prototype.getTypeOf('USE_TOKENS'):
          console.log('USE_TOKENS')
          console.log(msg)
          THIS.useTokensResponse(msg)
          break

        case Packet.prototype.getTypeOf('CHAT'):
          console.log(
            'chat message received from player ' +
              msg.data.name +
              ', with message: "' +
              msg.data.message +
              '"'
          )

          GameWindow.addDistantPlayerMessage(msg.data.name, msg.data.message)

          break

        default:
          break
      }
    }
  }

  ErrorHandling (data) {
    var str = data.message

    GameWindow.clearUseTokensUI()
    GameWindow.displayMessage(str.substr(str.indexOf(':') + 1))
    console.log(str)

    switch (data.errType) {
      case Packet.prototype.getTypeOf('ATTACK'):
        console.log('error attack')
        console.log(data.errType)
        THIS.beginAttackPhase(str.substr(str.indexOf(':') + 1))
        break

      case Packet.prototype.getTypeOf('DEFEND'):
        THIS.attacked()
        break

      case Packet.prototype.getTypeOf('MOVE'):
        console.log('error move')
        console.log(data.errType)
        if (THIS.currentPhase == phases['OFFENSE']) {
          GameWindow.fortifyAfterConquering(
            THIS.lastFortify.tSource,
            THIS.lastFortify.tDest
          )
        } else {
          THIS.fortificationLogic(str.substr(str.indexOf(':') + 1))
        }
        break

      case Packet.prototype.getTypeOf('USE_TOKENS'):
        console.log('error use token')
        console.log(data.errType)
        GameWindow.displayUITop()
        GameWindow.displayCurrentPlayer()

        break

      default:
        break
    }
  }

  innerLoop () {
    THIS.synchronize()

    setInterval(function () {
      THIS.synchronize()
    }, 3000)
  }

  tryShowTokenTradeBtn () {
    if (localStorage.getItem('myId') == THIS.view.currentPlayer) {
      var tokenCounter = 0

      console.log('counter token ' + tokenCounter)

      tokenCounter += THIS.view.players[THIS.view.currentPlayer].tokens.tok1
      tokenCounter += THIS.view.players[THIS.view.currentPlayer].tokens.tok2
      tokenCounter += THIS.view.players[THIS.view.currentPlayer].tokens.tok3
      tokenCounter += THIS.view.players[THIS.view.currentPlayer].tokens.tok4

      console.log('counter token ' + tokenCounter)
      if (tokenCounter >= 3) {
        GameWindow.showTokenUIBtn()
      }
    }
  }
}
