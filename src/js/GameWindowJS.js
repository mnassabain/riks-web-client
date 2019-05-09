import * as d3 from 'd3'
import * as svgPanZoom from 'svg-pan-zoom'

import { map, getContinentOf } from './Map'
import { MainGame, phases } from './MainGame'
import { Player, SupportedColors } from './Player'

/*********************************************************************************************************************/
/* Variables */
var svg
var doc
var highlight
var countries
var seas
var hoveredCountryName
var selectedCountryName
var THIS = this

export var displayTimeout

/*********************************************************************************************************************/
/* Menu handling */

/* When the user clicks on the button, toggle between hiding and showing the dropdown content */
export function dropdownClick () {
  document.getElementById('myDropdown').classList.toggle('show')
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function (event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName('dropdown-content')
    var i
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i]
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show')
      }
    }
  }
}

/*********************************************************************************************************************/
/* Handling the pan and zoom of the map with the svg-pan-zoom library */
export function mapPanZoom () {
  var panZoomMap = svgPanZoom('#GameMap', {
    controlIconsEnabled: false,
    dblClickZoomEnabled: false
  })
}

/* Handling the double click event on map */
export var onDbClick = function () {
  var gmap = document.getElementById('GameMap')
  gmap.addEventListener('click', _placeSoldier, true)
}

export var disableDbClick = function () {
  var gmap = document.getElementById('GameMap')
  gmap.removeEventListener('click', _placeSoldier, true)
}

export var onDbClickReinUI = function () {
  var gmap = document.getElementById('GameMap')
  gmap.addEventListener('click', dblClickTerritory, true)
}

export var disableDbClickReinUi = function () {
  var gmap = document.getElementById('GameMap')
  gmap.removeEventListener('click', dblClickTerritory, true)
}
/*********************************************************************************************************************/
/* Timer handling */
var startingTime
var timer

/* Starting the timer */
export function startTimer () {
  startingTime = Date.now()
  try {
    clearInterval(timer)
    timer = window.setInterval(chronometer, 1000)
  } catch (error) {
    timer = window.setInterval(chronometer, 1000)
  }
}

export function stopTimer () {
  clearInterval(timer)
}

/*********************************************************************************************************************/
/* Starting the mouse over country */
export function startMouseoverCountry () {
  svg = document.getElementById('GameMap')
  doc = svg.ownerDocument
  highlight = doc.getElementById('highlight')
  countries = document.getElementsByClassName('country')

  for (var i = 0; i < countries.length; i++) {
    var country = countries[i]
    country.addEventListener('mouseover', function (evt) {
      mouseoverCountry(evt)
    })
  }

  seas = document.getElementsByClassName('sea')
  for (i = 0; i < seas.length; i++) {
    var sea = seas[i]
    sea.addEventListener('mouseover', function (evt) {
      mouseoverSea(evt)
    })
  }
}

export var _placeSoldier = function (evt) {
  selectedCountryName = hoveredCountryName

  if (
    document.getElementById(selectedCountryName).className.baseVal !== 'sea'
  ) {
    MainGame.prototype.tryPutUnits(
      localStorage.getItem('myId'),
      selectedCountryName,
      1
    )
  }
}

/** Draws a svg soldier icon on the country passed, and add the number
 * area with one soldier
 * @param color color of the calling player
 * @param countryName the country name where the soldier must be put
 */
export function drawSoldier (color, countryName) {
  if (document.getElementById('soldierNumberOn' + countryName) == null) {
    // getting the coordinates of the square center of a country
    var bbox = document.getElementById(countryName).getBBox()
    var posX = Math.floor(bbox.x + bbox.width / 2.0) - 20
    var posY = Math.floor(bbox.y + bbox.height / 2.0) - 15

    // appending icon on map
    var temp = d3
      .select('#GameMap g')
      .append('svg')
      // .html(require('../assets/icons/soldier.svg'))
      .html(
        "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 512.001 512.001' style='enable-background:new 0 0 512.001 512.001;' xml:space='preserve'><g>             <g>               <path d='M287.846,79.777c-5.434,0-10.414-2.903-13.095-7.605c-7.744,3.365-16.438,5.154-25.445,5.154                 c-9.074,0-17.823-1.811-25.604-5.222c-2.606,4.626-7.421,7.517-12.73,7.659c1.703,19.939,18.416,35.593,38.795,35.593                 c20.375,0,37.084-15.647,38.794-35.579H287.846z'/>             </g>           </g>           <g>             <g>               <path d='M300.813,254.966l-36.811,12.978c-1.049,4.357-2.883,8.601-5.555,12.524c-10.116,14.852-29.298,20.7-46.057,13.756                 c-1.505,1.022-12.266,8.336-13.785,9.368c-0.568,3.139-0.389-9.924-0.389,184.53c0,13.188,10.691,23.879,23.879,23.879                 s23.879-10.691,23.879-23.879V307.867h7.083v180.255c0,13.188,10.691,23.879,23.879,23.879s23.879-10.691,23.879-23.879                 C300.813,291.849,300.813,254.966,300.813,254.966z'/>             </g>           </g>           <g>             <g>               <path d='M391.394,223.746l-23.689-9.82l-28.395,9.896c0.629,4.097,0.009,8.285-1.834,12.097c-1.217,2.517-2.895,4.716-4.93,6.513                 l43.605,18.077c10.159,4.21,21.796-0.616,26.003-10.761C406.364,239.597,401.546,227.955,391.394,223.746z'/>             </g>           </g>           <g>             <g>               <path d='M173.063,268.43l-60.176,20.845c-6.011,2.095-9.186,8.666-7.091,14.677l8.647,24.814c2.503,7.18,11.128,9.978,17.363,5.74                 l69.209-47.036L173.063,268.43z'/>             </g>           </g>           <g>             <g>               <path d='M406.362,178.54c-1.583-4.544-6.551-6.943-11.095-5.36l-12.354,4.305l-2.508-7.199c-1.583-4.544-6.55-6.944-11.095-5.36                 c-4.544,1.583-6.944,6.551-5.36,11.095l2.508,7.199L245.35,225.427l3.051,2.078c9.619,6.552,15.285,16.73,16.436,27.461                 l56.873-19.82c4.544-1.583,6.944-6.551,5.36-11.095c-1.235-3.544-4.53-5.773-8.075-5.836l82.006-28.579                 C405.546,188.052,407.946,183.084,406.362,178.54z'/>             </g>           </g>           <g>             <g>               <path d='M345.632,172.013c-0.125-25.006-20.571-45.35-45.578-45.35c-10.93,0-84.186,0-95.151,0                 c-17.026,0-32.828,9.195-41.242,23.996c-17.591,30.956-9.981,17.567-27.532,48.443c-5.121,9.01-2.468,20.444,6.097,26.279                 l73.514,50.074c9.085,6.188,21.463,3.836,27.647-5.244c6.187-9.083,3.839-21.462-5.244-27.648l-58.351-39.746                 c19.952-35.103,18.606-33.024,19.741-34.145v25.546l33.494,22.815l66.048-23.018v-22.806c0-1.891,1.533-3.424,3.424-3.424                 c1.891,0,3.423,1.533,3.423,3.424c0,0.314-0.028,0.648-0.087,1.004l0.097,19.411l39.728-13.846L345.632,172.013z'/>             </g>           </g>           <g>             <g>               <path d='M297.251,64.128c-1.639-8.838-5.667-30.644-5.667-31.455C291.584,14.628,272.656,0,249.307,0                 c-22.281,0-40.522,13.323-42.146,30.223h-0.131l-5.903,33.944c-0.331,1.895,1.132,3.63,3.053,3.63h6.388                 c1.15,0,2.204-0.636,2.741-1.653l5.663-10.725c7.683,6.12,18.432,9.928,30.336,9.928c11.807,0,22.479-3.744,30.149-9.776 l5.659,10.588c0.539,1.009,1.59,1.638,2.734,1.638h6.354C296.138,67.797,297.606,66.039,297.251,64.128z'/></g></g></svg>"
      )
      .attr('width', '40')
      .attr('height', '40')
      .attr('x', posX.toString())
      .attr('y', posY.toString())
      .style('fill', color)
      .style('stroke', '#27282D')
      .style('stroke-width', '15')
      .attr('id', 'soldierOn' + countryName)
    // modify numX and numY to adjust soldier position of soldier icon
    var numX = posX
    var numY = posY + 10

    // Adds a number text area on soldier icon
    var t = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    t.setAttribute('transform', 'translate(' + numX + ' ' + numY + ')')
    t.setAttribute('font-family', 'Copperplate')
    t.setAttribute('font-size', '1.5rem')
    t.setAttribute('fill', '#FDF6EB')
    t.setAttribute('id', 'soldierNumberOn' + countryName)
    t.textContent = '1'

    var p = document.getElementById('soldierOn' + countryName)
    p.parentNode.insertBefore(t, p.nextSibling)
  }
}

export function updateSoldierColor (color, countryName) {
  var soldierIcon = document.getElementById('soldierOn' + countryName)
  soldierIcon.style.fill = color
}

export var _addReinforcement = function (evt) {
  // getting the country id
  selectedCountryName = hoveredCountryName
  /* Timer handling */
  var startingTime = Date.now()
  if (
    document.getElementById(selectedCountryName).className.baseVal !== 'sea'
  ) {
    var nbUnits = 1

    if (MainGame.prototype.getCurrentPhase() == phases['REINFORCEMENT']) {
      // alert('choose units')
      // nbUnits = valeur_saisie
      console.log('PHASE 0 -------------------------- DISPLAYING REIN UI')
      disableDbClick()
      disableDbClickReinUi()
      dblClickTerritory()
      /* allows the current player to use next phase button */
      if (
        localStorage.getItem('myId') == MainGame.prototype.getActivePlayerId()
      ) {
        enableNextPhaseBtn()
      } else {
        disableNextPhaseBtn()
      }
    } else if (MainGame.prototype.getCurrentPhase() == phases['PREPHASE']) {
      MainGame.prototype.tryPutUnits(
        localStorage.getItem('myId'),
        selectedCountryName,
        nbUnits
      )
      console.log('Try to add units on ' + selectedCountryName)
    }
  }
}

// generic function to create an xml element
export function newElement (type, attrs) {
  var result = doc.createElementNS('http://www.w3.org/2000/svg', type)
  if (result) {
    var attr = attrs.split(' ')
    for (var i = 0; i < attr.length; i++) {
      var value = attr[i].split('=')
      result.setAttribute(value[0], value[1])
    }
  }
  return result
}

/* Resets the country name area and deletes the higlight on the last hovered country */
export function mouseoverSea (evt) {
  var sea = evt.target
  highlight.setAttribute('d', 'm0 0')
  hoveredCountryName = sea.getAttribute('id')
  doc.getElementById('hovered-country').innerHTML = 'Hover a Country'
}

/* Display country name when mouse hovers it  */
export function mouseoverCountry (evt) {
  var country = evt.target
  var outline = country.getAttribute('d')
  // for function placeSoldier, to access the country id under the highlight layer
  hoveredCountryName = country.getAttribute('id')
  highlight.setAttribute('d', outline)

  var countryElement =
    map[getContinentOf(country.getAttribute('id'))][country.getAttribute('id')]
  doc.getElementById('hovered-country').innerHTML = country.getAttribute('id')
}

export function updateCountrySoldiersNumber (countryId) {
  var cName = MainGame.prototype.getCountryNameById(countryId)
  var countryElement = map[getContinentOf(cName)][cName]
  doc.getElementById('soldierNumberOn' + cName).innerHTML =
    countryElement.soldiers
}
/*****************************************************************************************************/

export function chronometer () {
  // Find the distance between now and the starting time
  var distance = Date.now() - startingTime

  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  var seconds = Math.floor((distance % (1000 * 60)) / 1000)

  var m = minutes + ''
  var s = seconds + ''

  // adding leading zeros under 10th secs and mins
  while (m.length === 1) {
    m = '0' + m
  }
  while (s.length === 1) {
    s = '0' + s
  }

  // Output the result in the timer
  document.getElementById('timer').innerHTML = m + ':' + s
}

/**********************************************************************************/
//* adds the local player message into the chat
/* waiting for 'sending to server' part */
export function sendLocalMessage () {
  var msgStr = document.getElementById('playerMsgInput').value
  document.getElementById('playerMsgInput').value = ''

  /* to do chat messages sending to server */
  MainGame.prototype.sendChatMessage(msgStr)
}

export function addServerMessage (title, message) {
  var msgParagraph = document.createElement('P')
  msgParagraph.className = 'playerMessage'
  msgParagraph.style.lineHeight = '1em'
  var msgStr = message
  msgParagraph.innerHTML =
    '<span class="messagePlayerName">' +
    title +
    '</span><span class="messageContent"> : ' +
    msgStr +
    '</span>'
  document.getElementById('chatWindow').appendChild(msgParagraph)
  document.getElementById('chatWindow').scrollTop = document.getElementById(
    'chatWindow'
  ).scrollHeight
}

/** add messages from others players into the chat
 * this function generates random values for the moment
 */
export function addDistantPlayerMessage (name, message) {
  var player = MainGame.prototype.getPlayerById(
    MainGame.prototype.getPlayerIdByName(name)
  )
  
  var playerName = name
  var playerColor = ''
  if (name == 'SERVER') {
    playerColor = 'white'
  } else {
    playerColor = player.color 
  }
  
  var msgParagraph = document.createElement('P')
  msgParagraph.className = 'playerMessage'
  msgParagraph.style.lineHeight = '1em'
  var msgStr = message
  msgParagraph.innerHTML =
    '<span class="messagePlayerName" style="color: ' +
    playerColor +
    '">' +
    playerName +
    '</span><span class="messageContent"> : ' +
    msgStr +
    '</span>'
  document.getElementById('chatWindow').appendChild(msgParagraph)
  document.getElementById('chatWindow').scrollTop = document.getElementById(
    'chatWindow'
  ).scrollHeight
}

export function displayMessage (message) {
  clearDisplayMessage()
  MainGame.prototype.clearTimeoutDisplay()
  console.log('displayMessage func')
  console.log(message)
  var msgParagraph = document.createElement('P')
  msgParagraph.className = 'infoMessage'
  msgParagraph.style.lineHeight = '1em'
  msgParagraph.innerHTML = message
  document.getElementById('messageUIBottom').appendChild(msgParagraph)
}

export function clearDisplayMessage () {
  document.getElementById('messageUIBottom').innerHTML = ''
  clearUseTokensUI()
}

export function setMyColor (id, color) {
  document.getElementById(id).style.color = color
}

export function displayMyColor (color) {
  document.getElementById('yourPlayerColor').style.borderLeftColor = color
  document.getElementById('yourPlayerColor').style.borderTopColor = color
}

export function setCountryColor (color, countryId) {
  var cName = MainGame.prototype.getCountryNameById(countryId)
  document.getElementById(cName).style.fill = color
}

/**
 * Displays the current phase name in the player controls area
 *
 * @param phase : current phase number
 */
export function displayCurrentPhase (phase) {
  // console.log('phaseReceived')
  // console.log(phase)
  var phaseName = ''
  var phaseNumber = ''
  switch (phase) {
    case -1:
      phaseName = 'Preparing'
      phaseNumber = 'Prephase'
      break
    case 0:
      phaseName = 'Reinforcements' // REINFORCEMENTS
      phaseNumber = 'Phase 1'
      break
    case 1:
      phaseName = 'Offense' // OFFENSE
      phaseNumber = 'Phase 2'
      break
    case 2:
      phaseName = 'Fortification' // FORTIFICATION
      phaseNumber = 'Phase 3'
      break
    default:
      phaseName = 'N/C'
      phaseNumber = 'N/C'
      break
  }
  var phaseIndicator = document.getElementById('phaseName')
  phaseIndicator.innerHTML = phaseName
  phaseIndicator = document.getElementById('phaseNumber')
  phaseIndicator.innerHTML = phaseNumber
}

export function displayCurrentPlayer () {
  var currentPlayer = MainGame.prototype.getActivePlayerId()
  document.getElementById('messageUITop').innerHTML = ''
  console.log(
    'localstorage id = ' +
      localStorage.getItem('myId') +
      ', view.current = ' +
      currentPlayer
  )
  if (currentPlayer == localStorage.getItem('myId')) {
    document.getElementById('messageUITop').innerHTML = 'Your turn'
  } else {
    document.getElementById('messageUITop').innerHTML =
      MainGame.prototype.getActivePlayerName() + ' is playing.'
  }
  try{
    highlightCurrentPlayer()
  }catch(error){
    console.log("HIGHLIGHT CURRENT PLAYER")
  }
}

export function highlightCurrentPlayer () {
  // console.log("highlight current player")
  var currentPlayer = MainGame.prototype.getActivePlayerId()
  var totalPlayers = MainGame.prototype.getNbPlayers()
  for (var i = 0; i < totalPlayers; i++) {
    if (i === currentPlayer) {
      console.log('')
      document.getElementById('playerSlot' + (currentPlayer + 1)).style.border =
        'outset #9EB9C1'
    } else {
      document.getElementById('playerSlot' + (i + 1)).style.border =
        'solid #f9ce93'
    }
  }
}

export function updateRatioBar (player, nbTerritories) {
  try {
    var str = 'ratioPlayer' + player
    var ratio = document.getElementById(str)
    ratio.style.width = (nbTerritories / 42) * 100 + '%'
  } catch (error) {}

  console.log(
    'ratio player ' + player + ' : ' + (nbTerritories / 42) * 100 + '%'
  )
}

export var _displayReinforcementUI = function () {
  selectedCountryName = hoveredCountryName

  if (localStorage.getItem('myId') == MainGame.prototype.getActivePlayerId()) {
    //   console.log("selected country name class" + selectedCountryName + ' class :' )
    //   console.log(document.getElementById(selectedCountryName).className)
    if (
      document.getElementById(selectedCountryName).className.baseVal !== 'sea'
    ) {
      document.getElementById('messageDisplay').style.display = 'block'
      document.getElementById('messageDisplay').style.visibility = 'visible'
      document.getElementById('reinforcementUI').style.visibility = 'visible'
      if (
        document.getElementById(selectedCountryName).className.baseVal !== 'sea'
      ) {
        var country = document.getElementById(
          'reinforcementTerritory'
        )
        country.innerHTML = selectedCountryName
        country.style.color = getCountryColor(selectedCountryName)
      }
    }
  }
}

export function getCountryColor (countryName) {
  var territoryOwner = map[getContinentOf(countryName)][countryName].player
  var colorToSet = SupportedColors[territoryOwner]
  return colorToSet
}

export function clearReinUI () {
  console.log('clear reinUI')
  document.getElementById('messageDisplay').style.display = 'none'
  document.getElementById('messageDisplay').style.visibility = 'hidden'
  var reinUI = document.getElementById('reinforcementUI')
  reinUI.style.visibility = 'hidden'
  reinUI.style.height = '0'
  reinUI.style.marginTop = '0'
  displayCurrentPlayer()
}

/**
 * Calls tryPutUnits and clears the reinforcement interface
 *
 * @param value number of units to add on territory
 */
export function addReinUnit (value) {
  clearReinUI()
  if (value < 1) {
    displayMessage('You have to add at least 1 unit')
  } else {
    console.log('added value rein unit = ' + value)
    console.log('on ' + selectedCountryName)
    /* here we handle the put unit during phase 1 (reinforcements) */
    MainGame.prototype.tryPutUnits(
      localStorage.getItem('myId'),
      selectedCountryName,
      value
    )
  }
}

/*********************************************************************/
/**
 * Function called when user double clicks on territory
 * if prephase places 1 soldier
 * if reinforcement select reinforcement ui
 */
export function dblClickTerritory (evt) {
  console.log('current phase = ' + MainGame.prototype.getCurrentPhase())
  if (MainGame.prototype.getCurrentPhase() == phases['PREPHASE']) {
    _placeSoldier(evt)
  } else if (MainGame.prototype.getCurrentPhase() == phases['REINFORCEMENT']) {
    _displayReinforcementUI()
  } else if (MainGame.prototype.getCurrentPhase() == phases['OFFENSE']) {
    _enableChooseTerritoryToAttack()
  }
}

/**
 * Enables the next phase button usage
 */
export function enableNextPhaseBtn () {
  var nextPhaseBtn = document.getElementById('nextPhaseBtn')
  nextPhaseBtn.style.cursor = 'pointer'
  nextPhaseBtn.style.pointerEvents = 'all'
  nextPhaseBtn.style.opacity = '1'
}

/**
 * Disable the next phase button usage
 */
export function disableNextPhaseBtn () {
  var nextPhaseBtn = document.getElementById('nextPhaseBtn')
  nextPhaseBtn.style.cursor = 'not-allowed'
  nextPhaseBtn.style.pointerEvents = 'none'
  nextPhaseBtn.style.opacity = '0.5'
}

/**
 * Calls the nextPhase function in MainGame controller
 */
export function nextPhase () {
  console.log('NEXT PHASE IS CALLED in GAMEWINDOW')
  MainGame.prototype.nextPhase()
}

/** *********************************  ATTACK UI ************************************************ */

export function displayAttackChooseUnits () {
  disableNextPhaseBtn()
  clearMessageUITop()
  var unitsAvailable = MainGame.prototype.getUnitsOnTerritory(attackFrom)
  console.log('units available on ' + attackFrom + ' : ' + unitsAvailable)

  var attackUI = document.getElementById('AttackUI')
  attackUI.style.display = 'block'
  attackUI.style.visibility = 'visible'
  attackUI.style.height = '8rem'
  document.getElementById('attackCombatRed').innerHTML = attackTo
  document.getElementById('attackCombatRed').style.color = getCountryColor(attackTo)

  if (unitsAvailable < 4) {
    document.getElementById('selectArmyThreeAttack').disabled = true
    document.getElementById('attackThreeImg').style.cursor = 'not-allowed'
  } else {
    document.getElementById('selectArmyThreeAttack').disabled = false
    document.getElementById('attackThreeImg').style.cursor = 'pointer'
  }

  if (unitsAvailable < 3) {
    document.getElementById('selectArmyTwoAttack').disabled = true
    document.getElementById('attackTwoImg').style.cursor = 'not-allowed'
  } else {
    document.getElementById('selectArmyTwoAttack').disabled = false
    document.getElementById('attackTwoImg').style.cursor = 'pointer'
  }
}

export function clearAttackChooseUnits () {
  console.log('clear attackUI')
  document.getElementById('AttackUI').style.display = 'none'
  document.getElementById('AttackUI').style.visibility = 'hidden'
  var attackUI = document.getElementById('AttackUI')
  attackUI.style.visibility = 'hidden'
  attackUI.style.height = '0'
  attackUI.style.margin = '0'
}

/** *********************************  DEFEND UI  ************************************************ */

var lastUnits = 0
var lastTerritory = -1
export function displayDefendUIdChooseUnits (nbUnits, targetedTerritoryId) {
  disableNextPhaseBtn()
  if (nbUnits !== undefined && targetedTerritoryId !== undefined) {
    lastUnits = nbUnits
    lastTerritory = targetedTerritoryId
  }
  console.log('units ' + lastUnits + ' T id : ' + lastTerritory)
  var tName = MainGame.prototype.getCountryNameById(lastTerritory)
  var unitsAvailable = MainGame.prototype.getUnitsOnTerritory(tName)
  console.log('units available on ' + tName + ' : ' + unitsAvailable)

  var defendUI = document.getElementById('DefendUI')
  defendUI.style.display = 'block'
  defendUI.style.visibility = 'visible'
  defendUI.style.height = '8rem'
  defendUI.style.marginTop = '0'
  if (tName !== undefined) {
    document.getElementById('defendCombatRed').innerHTML = tName
    document.getElementById('defendCombatRed').style.color = getCountryColor(tName)
    document.getElementById('attackingUnits').innerHTML = lastUnits
  } else {
    document.getElementById('defendCombatRed').innerHTML = 'Territory'
  }
  if (unitsAvailable < 2) {
    document.getElementById('selectArmyTwoDefend').disabled = true
    document.getElementById('defendTwoImg').style.cursor = 'not-allowed'
  } else {
    document.getElementById('selectArmyTwoDefend').disabled = false
    document.getElementById('defendTwoImg').style.cursor = 'pointer'
  }
}

export function clearDefendUIChooseUnits () {
  console.log('clear DefendUI')
  var defendUI = document.getElementById('DefendUI')
  defendUI.style.display = 'none'
  defendUI.style.visibility = 'hidden'
  defendUI.style.height = '0'
  defendUI.style.marginTop = '0'
  enableNextPhaseBtn()
}

var attackFrom = ''
export var _enableAttackFromTerritory = function () {
  var gmap = document.getElementById('GameMap')
  gmap.addEventListener('click', attackFromTerritory, true)
  attackFrom = ''
}

export var cancelAttackFromTerritory = function (evt) {
  evt.preventDefault()
  _disableChooseTerritoryToAttack()
  clearDisplayMessage()
  displayMessage('Choose territory to attack from')
  _enableAttackFromTerritory()
}

export var enableCancelAttackFromTerritory = function () {
  var gmap = document.getElementById('GameMap')
  gmap.addEventListener('contextmenu', cancelAttackFromTerritory, false)
}

export var disableCancelAttackFromTerritory = function () {
  var gmap = document.getElementById('GameMap')
  gmap.removeEventListener('contextmenu', cancelAttackFromTerritory, false)
}

export var _disableAttackFromTerritory = function () {
  var gmap = document.getElementById('GameMap')
  gmap.removeEventListener('click', attackFromTerritory, true)
  return false
}

var attackTo = ''
export var _enableChooseTerritoryToAttack = function () {
  var gmap = document.getElementById('GameMap')
  gmap.addEventListener('click', attackTerritory, true)
  attackTo = ''
}

export var _disableChooseTerritoryToAttack = function () {
  var gmap = document.getElementById('GameMap')
  gmap.removeEventListener('click', attackTerritory, true)
}

export function attackFromTerritory () {
  selectedCountryName = hoveredCountryName
  console.log('user clicked to attack from ' + selectedCountryName)
  // document.getElementById('attackFromTerritory').innerHTML = selectedCountryName

  attackFrom = selectedCountryName
  if (document.getElementById(attackFrom).className.baseVal !== 'sea') {
    enableCancelAttackFromTerritory()
    _disableAttackFromTerritory()
    clearDisplayMessage()
    displayMessage('Choose territory to attack')
    _enableChooseTerritoryToAttack()
  }
}

export function attackWith (nb) {
  disableCancelAttackFromTerritory()
  clearAttackChooseUnits()
  displayUITop()
  displayMessage(
    'You launched an attack on ' +
      attackTo +
      ' from ' +
      attackFrom +
      ' with ' +
      nb +
      'unit(s)'
  )
  console.log('func attack with')
  console.log('attack from ' + attackFrom)
  console.log('attack to ' + attackTo)
  console.log('nb ' + nb)
  MainGame.prototype.tryAttack(attackFrom, attackTo, nb)
  // MainGame.prototype.attack(
  //   MainGame.prototype.getCountryIdByName(attackFrom),
  //   MainGame.prototype.getCountryIdByName(attackTo),
  //   nb
  // )
}

export function attackTerritory () {
  selectedCountryName = hoveredCountryName
  console.log('user clicked to attack ' + selectedCountryName)
  // document.getElementById('attackFromTerritory').innerHTML = selectedCountryName

  attackTo = selectedCountryName

  console.log(document.getElementById(attackTo).className)

  if (document.getElementById(attackTo).className.baseVal !== 'sea') {
    disableCancelAttackFromTerritory()
    _disableChooseTerritoryToAttack()
    clearMessageUITop()
    clearDisplayMessage()
    disableNextPhaseBtn()
    displayAttackChooseUnits()
  }
}

export function defendTerritoryNotification (nbUnits, targetedTerritory) {
  clearDisplayMessage()
  clearMessageUITop()
  if (nbUnits !== undefined && targetedTerritory !== undefined) {
    displayDefendUIdChooseUnits(nbUnits, targetedTerritory)
  } else {
    displayDefendUIdChooseUnits()
  }
}

export function defendWith (nbUnits) {
  console.log('func defend with')
  console.log('nbUnits ' + nbUnits)
  displayUITop()

  var targetedTerritory = document.getElementById('defendCombatRed').innerHTML
  displayMessage(
    'You defended attack on ' +
      targetedTerritory +
      ' with ' +
      nbUnits +
      ' unit(s)'
  )
  clearDefendUIChooseUnits()
  // clearDisplayMessage()
  MainGame.prototype.tryDefend(targetedTerritory, nbUnits)
}

// Gray out the map, exept tSource and tDest
export function highlightTerritory (tSource, tDest) {
  var countries = document.getElementsByClassName('country')

  for (var i = 0; i < countries.length; i++) {
    var country = countries[i]
    var countryID = country.getAttribute('id')
    if (countryID !== tSource && countryID !== tDest) {
      document.getElementById(countryID).classList.add('grayedOut')
    }
  }
}

// Undo the highlightTerritory() results
export function unhighlightTerritory () {
  var countries = document.getElementsByClassName('country')

  for (var i = 0; i < countries.length; i++) {
    var country = countries[i]
    var countryID = country.getAttribute('id')
    document.getElementById(countryID).classList.remove('grayedOut')
  }
}

export function clearMessageUITop () {
  var messageUITop = document.getElementById('messageUITop')
  messageUITop.innerHTML = ''
  messageUITop.style.display = 'none'
  messageUITop.style.visibility = 'hidden'
  messageUITop.style.height = '0'
  messageUITop.style.margin = '0'
  messageUITop.style.padding = '0'
}

export function displayUITop () {
  var messageUITop = document.getElementById('messageUITop')
  messageUITop.style.display = 'block'
  messageUITop.style.visibility = 'visible'
  messageUITop.style.height = '2rem'
  messageUITop.style.borderBottom = 'solid #f9ce93 1px'
  messageUITop.style.marginBottom = '1rem'
  messageUITop.style.paddingBottom = '0.5rem'
  messageUITop.style.textAlign = 'center'
  messageUITop.style.width = '40vw'
  messageUITop.style.position = 'absolute'
  messageUITop.style.bottom = '70px'
}

export function displayMessageUITop (message) {
  var messageUITop = document.getElementById('messageUITop')
  messageUITop.innerHTML = message
}

/** ***************************** FORTIFY ENABLE DISABLE, & treatements *************************************************** */
var fortifyFrom = ''
export var _enableFortifyFromTerritory = function () {
  var gmap = document.getElementById('GameMap')
  gmap.addEventListener('click', fortifyFromTerritory, true)
  // fortifyFrom = ""
}

export var _disableFortifyFromTerritory = function () {
  var gmap = document.getElementById('GameMap')
  gmap.removeEventListener('click', fortifyFromTerritory, true)
}

var fortifyTo = ''
export var _enableChooseTerritoryToFortify = function () {
  var gmap = document.getElementById('GameMap')
  gmap.addEventListener('click', fortifyTerritory, true)
  fortifyTo = ''
}

export var _disableChooseTerritoryToFortify = function () {
  var gmap = document.getElementById('GameMap')
  gmap.removeEventListener('click', fortifyTerritory, true)
}

export function fortifyFromTerritory () {
  selectedCountryName = hoveredCountryName
  console.log('user clicked to fortify from ' + selectedCountryName)

  fortifyFrom = selectedCountryName
  if (document.getElementById(fortifyFrom).className.baseVal !== 'sea') {
    _disableFortifyFromTerritory()
    clearDisplayMessage()
    displayMessage('Choose territory to fortify')
    _enableChooseTerritoryToFortify()
  }
}

export function fortifyTerritory () {
  selectedCountryName = hoveredCountryName
  console.log('user clicked to fortify ' + selectedCountryName)

  fortifyTo = selectedCountryName

  console.log(document.getElementById(fortifyTo).className)

  if (document.getElementById(fortifyTo).className.baseVal !== 'sea') {
    _disableChooseTerritoryToFortify()
    clearMessageUITop()
    clearDisplayMessage()
    // disableNextPhaseBtn()
    displayFortifyChooseUnits()
  }
}

export function fortifyAfterConquering (startTerritory, endTerritory) {
  fortifyFrom = startTerritory
  fortifyTo = endTerritory
  displayFortifyChooseUnits()
}

export function displayFortifyChooseUnits () {
  var unitsAvailable = MainGame.prototype.getUnitsOnTerritory(fortifyFrom)
  console.log(
    '****************************** units available on ' +
      fortifyFrom +
      ' : ' +
      unitsAvailable
  )
  clearReinUI()
  document.getElementById('messageDisplay').style.display = 'block'
  document.getElementById('messageDisplay').style.visibility = 'visible'
  var fortifyUI = document.getElementById('FortifyUI')
  fortifyUI.style.display = 'block'
  fortifyUI.style.visibility = 'visible'
  fortifyUI.style.height = '8rem'
  document.getElementById('moveFrom').innerHTML = fortifyFrom
  document.getElementById('moveTo').innerHTML = fortifyTo
}

export function clearFortifyChooseUnits () {
  console.log('clear FortifyUI')
  document.getElementById('messageDisplay').style.display = 'none'
  document.getElementById('messageDisplay').style.visibility = 'hidden'
  document.getElementById('FortifyUI').style.display = 'none'
  document.getElementById('FortifyUI').style.visibility = 'hidden'
  var fortifyUI = document.getElementById('FortifyUI')
  fortifyUI.style.visibility = 'hidden'
  fortifyUI.style.height = '0'
  fortifyUI.style.margin = '0'
  enableNextPhaseBtn()
  // MainGame.prototype.fortificationLogic()
}

export function fortifyWith (nb) {
  clearFortifyChooseUnits()
  MainGame.prototype.tryFortify(fortifyFrom, fortifyTo, nb)
}
/** ******************************************************************************** */

export function displayUseTokensUI () {
  clearDisplayMessage()
  clearMessageUITop()

  var tokensUI = document.getElementById('TokenUI')
  tokensUI.style.display = 'block'
  tokensUI.style.visibility = 'visible'
  tokensUI.style.height = '8rem'

  document.getElementById('tokenTradeBtn').disabled = true
  document.getElementById('tradeTokenBtnImg').style.cursor = 'not-allowed'

  console.log(window['players'])

  var tokenOne = document.getElementById('nbTokenTypeOne').innerHTML
  var tokenTwo = document.getElementById('nbTokenTypeTwo').innerHTML
  var tokenThree = document.getElementById('nbTokenTypeThree').innerHTML
  var tokenFour = document.getElementById('nbTokenTypeJoker').innerHTML

  console.log(
    'all tokens : ' +
      tokenOne +
      ' ' +
      tokenTwo +
      ' ' +
      tokenThree +
      ' ' +
      tokenFour
  )

  document.getElementById('nbTokenUITypeOne').innerHTML = tokenOne
  document.getElementById('nbTokenUITypeTwo').innerHTML = tokenTwo
  document.getElementById('nbTokenUITypeThree').innerHTML = tokenThree
  document.getElementById('nbTokenUITypeJoker').innerHTML = tokenFour

  if (tokenOne == 0) {
    document.getElementById('tokenTypeOneBtn').disabled = true
    document.getElementById('tokenTypeOneImg').style.cursor = 'not-allowed'
  } else {
    document.getElementById('tokenTypeOneBtn').disabled = false
    document.getElementById('tokenTypeOneImg').style.cursor = 'pointer'
  }

  if (tokenTwo == 0) {
    document.getElementById('tokenTypeTwoBtn').disabled = true
    document.getElementById('tokenTypeTwoImg').style.cursor = 'not-allowed'
  } else {
    document.getElementById('tokenTypeTwoBtn').disabled = false
    document.getElementById('tokenTypeTwoImg').style.cursor = 'pointer'
  }

  if (tokenThree == 0) {
    document.getElementById('tokenTypeThreeBtn').disabled = true
    document.getElementById('tokenTypeThreeImg').style.cursor = 'not-allowed'
  } else {
    document.getElementById('tokenTypeThreeBtn').disabled = false
    document.getElementById('tokenTypeThreeImg').style.cursor = 'pointer'
  }

  if (tokenFour == 0) {
    document.getElementById('tokenTypeJokerBtn').disabled = true
    document.getElementById('tokenTypeJokerImg').style.cursor = 'not-allowed'
  } else {
    document.getElementById('tokenTypeJokerBtn').disabled = false
    document.getElementById('tokenTypeJokerImg').style.cursor = 'pointer'
  }
}

export function clearUseTokensUI () {
  var tokensUI = document.getElementById('TokenUI')
  tokensUI.style.display = 'none'
  tokensUI.style.visibility = 'hidden'
  chosenTokenType = ''
  document.getElementById('tokenSlotOneImg').src = ''
  document.getElementById('tokenSlotTwoImg').src = ''
  document.getElementById('tokenSlotThreeImg').src = ''

  tokenSlotOneIsSet = false
  tokenSlotTwoIsSet = false
  tokenSlotThreeIsSet = false
  tokenSlotOneIsSetWith = ''
  tokenSlotTwoIsSetWith = ''
  tokenSlotThreeIsSetWith = ''
  clearUnitsTraded()
}

var chosenTokenType = ''

export function setTokenType (tokenNb) {
  chosenTokenType = tokenNb
}

var tokenSlotOneIsSet = false
var tokenSlotTwoIsSet = false
var tokenSlotThreeIsSet = false
var tokenSlotOneIsSetWith = ''
var tokenSlotTwoIsSetWith = ''
var tokenSlotThreeIsSetWith = ''
export function getTokenToSet (selectedSlot) {
  switch (selectedSlot) {
    case 1:
      if (tokenSlotOneIsSet === false && chosenTokenType !== '') {
        /* setting the source token type present in the slot */
        tokenSlotOneIsSetWith = chosenTokenType
        tokenSlotOneIsSet = true

        /* set recorded icon into slot */
        document.getElementById(
          'tokenSlotOneImg'
        ).src = require('../assets/icons/tokenType' + chosenTokenType + '.svg')

        /* getting the number of tokens of the recorded token */
        var nbMinus = 0
        nbMinus = parseInt(
          document.getElementById('nbTokenUIType' + chosenTokenType).innerHTML
        )

        /* decrementing number of token of source */
        nbMinus--

        /* setting this number in the view */
        document.getElementById(
          'nbTokenUIType' + chosenTokenType
        ).innerHTML = nbMinus

        if (nbMinus == 0) {
          document.getElementById(
            'tokenType' + tokenSlotOneIsSetWith + 'Btn'
          ).disabled = true
          document.getElementById(
            'tokenType' + tokenSlotOneIsSetWith + 'Img'
          ).style.cursor = 'not-allowed'
        }

        chosenTokenType = ''
      } else {
        if (tokenSlotOneIsSetWith !== '') {
          tokenSlotOneIsSet = false

          /* getting the number of tokens of the recorded token */
          var nbPlus = 0
          nbPlus = parseInt(
            document.getElementById('nbTokenUIType' + tokenSlotOneIsSetWith)
              .innerHTML
          )

          /* decrementing number of token of source */
          nbPlus++

          /* setting this number in the view */
          document.getElementById(
            'nbTokenUIType' + tokenSlotOneIsSetWith
          ).innerHTML = nbPlus

          if (nbPlus > 0) {
            document.getElementById(
              'tokenType' + tokenSlotOneIsSetWith + 'Btn'
            ).disabled = false
            document.getElementById(
              'tokenType' + tokenSlotOneIsSetWith + 'Img'
            ).style.cursor = 'pointer'
          }

          /* clear icon in slot */
          document.getElementById('tokenSlotOneImg').src = ''

          tokenSlotOneIsSetWith = ''
        }
      }
      break

    case 2:
      if (tokenSlotTwoIsSet === false && chosenTokenType !== '') {
        /* setting the source token type present in the slot */
        tokenSlotTwoIsSetWith = chosenTokenType
        tokenSlotTwoIsSet = true

        /* set recorded icon into slot */
        document.getElementById(
          'tokenSlotTwoImg'
        ).src = require('../assets/icons/tokenType' + chosenTokenType + '.svg')

        /* getting the number of tokens of the recorded token */
        var nbMinus = 0
        nbMinus = parseInt(
          document.getElementById('nbTokenUIType' + chosenTokenType).innerHTML
        )

        /* decrementing number of token of source */
        nbMinus--

        /* setting this number in the view */
        document.getElementById(
          'nbTokenUIType' + chosenTokenType
        ).innerHTML = nbMinus

        if (nbMinus == 0) {
          document.getElementById(
            'tokenType' + tokenSlotTwoIsSetWith + 'Btn'
          ).disabled = true
          document.getElementById(
            'tokenType' + tokenSlotTwoIsSetWith + 'Img'
          ).style.cursor = 'not-allowed'
        }

        chosenTokenType = ''
      } else {
        if (tokenSlotTwoIsSetWith !== '') {
          tokenSlotTwoIsSet = false

          /* getting the number of tokens of the recorded token */
          var nbPlus = 0
          nbPlus = parseInt(
            document.getElementById('nbTokenUIType' + tokenSlotTwoIsSetWith)
              .innerHTML
          )

          /* decrementing number of token of source */
          nbPlus++

          /* setting this number in the view */
          document.getElementById(
            'nbTokenUIType' + tokenSlotTwoIsSetWith
          ).innerHTML = nbPlus

          if (nbPlus > 0) {
            document.getElementById(
              'tokenType' + tokenSlotTwoIsSetWith + 'Btn'
            ).disabled = false
            document.getElementById(
              'tokenType' + tokenSlotTwoIsSetWith + 'Img'
            ).style.cursor = 'pointer'
          }

          /* clear icon in slot */
          document.getElementById('tokenSlotTwoImg').src = ''

          tokenSlotTwoIsSetWith = ''
        }
      }
      break

    case 3:
      if (tokenSlotThreeIsSet === false && chosenTokenType !== '') {
        /* setting the source token type present in the slot */
        tokenSlotThreeIsSetWith = chosenTokenType
        tokenSlotThreeIsSet = true

        /* set recorded icon into slot */
        document.getElementById(
          'tokenSlotThreeImg'
        ).src = require('../assets/icons/tokenType' + chosenTokenType + '.svg')

        /* getting the number of tokens of the recorded token */
        var nbMinus = 0
        nbMinus = parseInt(
          document.getElementById('nbTokenUIType' + chosenTokenType).innerHTML
        )

        /* decrementing number of token of source */
        nbMinus--

        /* setting this number in the view */
        document.getElementById(
          'nbTokenUIType' + chosenTokenType
        ).innerHTML = nbMinus

        if (nbMinus == 0) {
          document.getElementById(
            'tokenType' + tokenSlotThreeIsSetWith + 'Btn'
          ).disabled = true
          document.getElementById(
            'tokenType' + tokenSlotThreeIsSetWith + 'Img'
          ).style.cursor = 'not-allowed'
        }

        chosenTokenType = ''
      } else {
        if (tokenSlotThreeIsSetWith !== '') {
          tokenSlotThreeIsSet = false

          /* getting the number of tokens of the recorded token */
          var nbPlus = 0
          nbPlus = parseInt(
            document.getElementById('nbTokenUIType' + tokenSlotThreeIsSetWith)
              .innerHTML
          )

          /* decrementing number of token of source */
          nbPlus++

          /* setting this number in the view */
          document.getElementById(
            'nbTokenUIType' + tokenSlotThreeIsSetWith
          ).innerHTML = nbPlus

          if (nbPlus > 0) {
            document.getElementById(
              'tokenType' + tokenSlotThreeIsSetWith + 'Btn'
            ).disabled = false
            document.getElementById(
              'tokenType' + tokenSlotThreeIsSetWith + 'Img'
            ).style.cursor = 'pointer'
          }

          /* clear icon in slot */
          document.getElementById('tokenSlotThreeImg').src = ''

          tokenSlotThreeIsSetWith = ''
        }
      }
      break
  }

  if (
    tokenSlotOneIsSetWith === '' ||
    tokenSlotTwoIsSetWith === '' ||
    tokenSlotThreeIsSetWith === ''
  ) {
    document.getElementById('tokenTradeBtn').disabled = true
    document.getElementById('tradeTokenBtnImg').style.cursor = 'not-allowed'
  } else {
    document.getElementById('tokenTradeBtn').disabled = false
    document.getElementById('tradeTokenBtnImg').style.cursor = 'pointer'
  }
}

export function getTokenId (tokenStringId) {
  var res = -1
  switch (tokenStringId) {
    case 'One':
      res = 1
      break
    case 'Two':
      res = 2
      break
    case 'Three':
      res = 3
      break
    case 'Joker':
      res = 0
      break
    default:
  }
  return res
}

export function useTokens (token1, token2, token3) {
  // clearUseTokenUI()
  var tokArray = []

  if (tokenSlotOneIsSet) {
    tokArray.push(getTokenId(tokenSlotOneIsSetWith))
  }
  if (tokenSlotTwoIsSet) {
    tokArray.push(getTokenId(tokenSlotTwoIsSetWith))
  }
  if (tokenSlotThreeIsSet) {
    tokArray.push(getTokenId(tokenSlotThreeIsSetWith))
  }

  console.log('token parameters to send : ')
  console.log(tokArray)

  // MainGame.prototype.tryUseTokens(token1, token2, token3)
  MainGame.prototype.tryUseTokens(tokArray[0], tokArray[1], tokArray[2])
}

export function showTokenUIBtn () {
  document.getElementById('TokenSpread').style.display = 'flex'
  document.getElementById('TokenSpread').style.visibility = 'visible'
}

export function hideTokenUIBtn () {
  document.getElementById('TokenSpread').style.display = 'none'
  document.getElementById('TokenSpread').style.visibility = 'hidden'
}

export function displayUnitsTraded (nbUnits) {
  document.getElementById('TokenUIRight').style.display = 'block'
  document.getElementById('TokenUIRight').style.visibility = 'visible'
  document.getElementById('unitsTraded').innerHTML = nbUnits
}

export function clearUnitsTraded () {
  document.getElementById('TokenUIRight').style.display = 'none'
  document.getElementById('TokenUIRight').style.visibility = 'hidden'
}

export function setNextPhaseBtnImg () {
  document.getElementById(
    'nextPhaseBtnImg'
  ).src = require('../assets/icons/nextPhase.svg')
}

export function setEndtourBtnImg () {
  document.getElementById(
    'nextPhaseBtnImg'
  ).src = require('../assets/icons/endTour.svg')
}

export function hide () {
  this.TTXHiden = !this.TTXHiden
}
export function show () {
  this.TTXHiden = !this.TTXHiden
}
/** ******************************************************************************** */

export function showDeadNotification () {
  document.getElementById('dead-notification').style.display = 'block'
}
export function hideDeadNotification () {
  document.getElementById('dead-notification').style.display = 'none'
}

export function setPlayerDead (playerID) {
  document.getElementById(
    'playerSlot' + (playerID + 1) + 'Dead'
  ).style.display = 'inline-block'
}
