import * as d3 from 'd3'
import * as svgPanZoom from 'svg-pan-zoom'

import { map } from './Map'
import { MainGame } from './MainGame'

/*********************************************************************************************************************/
/* Variables */
var svg
var doc
var highlight
var countries
var seas
var hoveredCountryId

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
export function onDbClick () {
  svg.addEventListener('dblclick', function (evt) {
    placeSoldier(evt)
  })
}
/*********************************************************************************************************************/
/* Starting the timer */
export function startTimer () {
  setInterval(chronometer, 1000)
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

export function placeSoldier (evt) {
  var country = evt.target

  // getting the country id
  var selectedCountryId = hoveredCountryId

  console.log(
    'free territories left : ' + MainGame.prototype.getFreeTerritoriesNumber()
  )
  if (MainGame.prototype.getFreeTerritoriesNumber() > 0) {
    if (MainGame.prototype.tryPutUnits() == true) {
      if (MainGame.prototype.checkTerritoryFreedom(selectedCountryId) == true) {
        // console.log('it s free');
        // getting the coordinates of the square center of a country
        var bbox = country.getBBox()
        var x = Math.floor(bbox.x + bbox.width / 2.0) - 20
        var y = Math.floor(bbox.y + bbox.height / 2.0) - 15

        // looping on the map object to match the dbclicked country
        Object.keys(map).forEach(key => {
          var continentName = map[key]
          for (var countries in continentName) {
            var res =
              countries == selectedCountryId
                ? 0
                : countries > selectedCountryId
                  ? 1
                  : -1
            if (res == 0) {
              // limiting the number of appended icons to 1
              if (continentName[countries].soldiers == 0) {
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
                  .attr('x', x.toString())
                  .attr('y', y.toString())
                  .style('fill', localStorage.myColor)
                  .style('stroke', 'black')
                  .style('stroke-width', '15')
                  .attr('id', 'soldierOn' + selectedCountryId)
                // change the country color to the own player color
                document.getElementById(selectedCountryId).style.fill =
                  localStorage.myColor
              }
            } else {
              // console.log("no match")
            }
          }
        })
        MainGame.prototype.chooseTerritory(
          MainGame.prototype.getCountryIdByName(selectedCountryId)
        )
      } else {
        clearDisplayMessage()
        displayMessage('This territory is occupied !')
      }
    } else {
      clearDisplayMessage()
      displayMessage('Wait for your turn please')
    }
  } else {
    clearDisplayMessage()
    displayMessage('No more free territories left !')
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
  hoveredCountryId = sea.getAttribute('id')
  doc.getElementById('hovered-country').innerHTML = 'Hover a Country'
}

/* Display country name when mouse hovers it  */
export function mouseoverCountry (evt) {
  var country = evt.target
  var outline = country.getAttribute('d')
  // for function placeSoldier, to access the country id under the highlight layer
  hoveredCountryId = country.getAttribute('id')
  highlight.setAttribute('d', outline)
  doc.getElementById('hovered-country').innerHTML = country.getAttribute('id')
}

/*****************************************************************************************************/

/* Timer handling */
var startingTime = Date.now()

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
export function addLocalPlayerMessage () {
  var playerName = localStorage.login
  var playerColor = localStorage.myColor
  var msgParagraph = document.createElement('P')
  msgParagraph.className = 'playerMessage'
  msgParagraph.style.lineHeight = '1em'
  var msgStr = document.getElementById('playerMsgInput').value
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
  document.getElementById('playerMsgInput').value = ''

  /* to do chat messages sending to server */
}

/** add messages from others players into the chat
 * this function generates random values for the moment
 */
export function addDistantPlayerMessage () {
  console.log('add random message')
  var min = 5
  var max = 10
  var rand = Math.floor(Math.random() * (max - min + 1) + min) // Generate Random number between 5 - 10
  setTimeout(addDistantPlayerMessage, rand * 1000)

  /* to do : getting chat messages from server */

  var playerName = 'Player_2'
  var playerColor = '#DF4C4C'
  var msgParagraph = document.createElement('P')
  msgParagraph.className = 'playerMessage'
  msgParagraph.style.lineHeight = '1em'
  var msgStr = 'Lorem ipsum dolor sit amet ...'
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
  console.log('displayMessage func')
  console.log(message)
  var msgParagraph = document.createElement('P')
  msgParagraph.className = 'infoMessage'
  msgParagraph.style.lineHeight = '1em'
  msgParagraph.innerHTML = message
  document.getElementById('combatUIDisplay').appendChild(msgParagraph)
  // updateMsg.innerHTML = message
}

export function clearDisplayMessage () {
  document.getElementById('combatUIDisplay').innerHTML = ''
}

export function setMyColor (id, color) {
  document.getElementById(id).style.color = color
}

export function setCountryColor (color, countryId) {
  var cName = MainGame.prototype.getCountryNameById(countryId)
  document.getElementById(cName).style.fill = color
}
