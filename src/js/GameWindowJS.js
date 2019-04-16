import * as d3 from 'd3'

export function dropdownClick () {
  document.getElementById('myDropdown').classList.toggle('show')
}
/*********************************************************************************************************************/
/* Menu button handling */
/* When the user clicks on the button, toggle between hiding and showing the dropdown content */

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

var svg
var doc
var highlight
var countries
var seas
var viewbox
var centerX
var centerY
var mapTransform
var transformMatrix
var planisphere
var selectedElement, offset, transform
var hoveredCountryId
var getReady

/* Initialize the SVG map on the UI */
export function init () {        
    
    addDistantPlayerMessage()
    setInterval(chronometer, 1000)
    svg = document.getElementById('GameMap')
    doc = svg.ownerDocument
    planisphere = doc.getElementById('matrix-group')
    viewbox = svg.getAttributeNS(null, 'viewBox').split(' ')
    centerX = parseFloat(viewbox[2]) / 2
    centerY = parseFloat(viewbox[3]) / 2
    mapTransform = svg.getElementById('matrix-group')
    transformMatrix = [1, 0, 0, 1, 0, 0]
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
    
    planisphere.addEventListener('mousedown', function (evt) {
      startDrag(evt)
    })
    planisphere.addEventListener('mousemove', function (evt) {
      drag(evt)
    })
    planisphere.addEventListener('mouseup', function (evt) {
      endDrag(evt)
    })
    planisphere.addEventListener('mouseleave', function (evt) {
      endDrag(evt)
    })
    
    planisphere.addEventListener('dblclick', function (evt) {
      placeSoldier(evt)
    })
}

export function getMousePosition (evt) {
  var CTM = svg.getScreenCTM()
  if (evt.touches) {
    evt = evt.touches[0]
  }
  return {
    x: (evt.clientX - CTM.e) / CTM.a,
    y: (evt.clientY - CTM.f) / CTM.d
  }
}

export function initialiseDragging (evt) {
  offset = getMousePosition(evt)

  // Make sure the first transform on the element is a translate transform
  var transforms = selectedElement.transform.baseVal

  if (
    transforms.length === 0 ||
    transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE
  ) {
    // Create an transform that translates by (0, 0)
    var translate = svg.createSVGTransform()
    translate.setTranslate(0, 0)
    selectedElement.transform.baseVal.insertItemBefore(translate, 0)
  }

  // Get initial translation
  transform = transforms.getItem(0)
  offset.x -= transform.matrix.e
  offset.y -= transform.matrix.f
}

export function startDrag (evt) {
  if (evt.target.classList.contains('draggable')) {
    selectedElement = evt.target
    console.log('if')
    initialiseDragging(evt)
  } else if (evt.target.parentNode.classList.contains('draggable-group')) {
    selectedElement = evt.target.parentNode
    initialiseDragging(evt)
  }
}

export function drag (evt) {
  if (selectedElement) {
    evt.preventDefault()
    var coord = getMousePosition(evt)
    transform.setTranslate(coord.x - offset.x, coord.y - offset.y)
  }
}

export function endDrag (evt) {
  selectedElement = false
}

/* Put a soldier svg element on county when double clicked
 *  TODO : ajust soldier position
 *  on some countries */
export function placeSoldier (evt) {
   var country = evt.target

   //getting the coordinates of the square center of a country
   var bbox = country.getBBox()
   var x = Math.floor(bbox.x + bbox.width / 2.0) - 20
   var y = Math.floor(bbox.y + bbox.height / 2.0) - 15

   //getting the country id
   var selectedCountryId = hoveredCountryId
   //console.log(selectedCountryId)
   //console.log(map)
    
  //looping on the map object to match the dbclicked country
  Object.keys(map).forEach(key => {
    var continentName = map[key]
    for(var countries in continentName){
      //console.log(countries)
      //var res = countries.localeCompare(hoveredCountryId)
      var res =  ( countries == selectedCountryId ) ? 0 : ( ( countries > selectedCountryId ) ? 1 : -1 )
      if(res == 0){
        //console.log("match")
        //limiting the number of appended icons to 1
        if(continentName[countries].soldiers == 0){
          //appending icon on map
          var svg = d3
            .select('#matrix-group g')
            .append('svg:image')
            .attr('xlink:href', require('../assets/icons/soldier.svg'))
            .attr('width', '40')
            .attr('height', '40')
            .attr('x', x.toString())
            .attr('y', y.toString())
        }
        //Updating the selected country data :
        // TODO : checking if the clicking player is the same as in the recorded data (allow or deny modification)
        if(continentName[countries].soldiers < 3){// && continentName[countries].player == ){
          continentName[countries].soldiers += 1;
          // TODO getting the current user id and updating map data
          continentName[countries].player = true;
        }
        console.log(continentName[countries] + " soldiers " + continentName[countries].soldiers)
        console.log(continentName[countries] + " player   " + continentName[countries].player)
      }else{
        //console.log("no match")
      }
    }
  })  
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

/* Resets the country name area and deletes the higlight on the last hovered country*/
export function mouseoverSea (evt) {
  var sea = evt.target
  highlight.setAttribute('d', 'm0 0')
  hoveredCountryId = sea.getAttribute('id')
  doc.getElementById('hovered-country').innerHTML =  "Hover a Country";
}

/* Display country name when mouse hovers it  */
export function mouseoverCountry (evt) {
  var country = evt.target
  var outline = country.getAttribute('d')
  // for function placeSoldier, to access the country id under the highlight layer
  hoveredCountryId = country.getAttribute('id')
  highlight.setAttribute('d', outline)
  doc.getElementById('hovered-country').innerHTML = country.getAttribute('id');
}

/***********************************************************************************************/

/* Mouse wheel event handling */
if (window.addEventListener) {
  // IE9, Chrome, Safari, Opera
  window.addEventListener('mousewheel', wheel, false)
  // Firefox
  window.addEventListener('DOMMouseScroll', wheel, false)
} else { // IE 6/7/8
  window.attachEvent('onmousewheel', wheel)
}

export function wheel (event) {
  var delta
  if (event.wheelDelta) {
    /* IE/Opera. */
    delta = event.wheelDelta / 120
  } else if (event.detail) {
    /* Mozilla case. */

    delta = -event.detail / 3
  }
  if (delta) handleWheelEvt(delta)
}

export function handleWheelEvt (delta) {
  if (delta < 0) {
    zoom(0.95)
  } else {
    zoom(1.05)
  }
}

/******************************************************************************************************/
/* Map position handling by incrementation of coordinates */
export function pan (dx, dy) {
  transformMatrix[4] += dx
  transformMatrix[5] += dy

  var translateNames = function (x, y) {
    return [x + dx, y + dy]
  }

  setMatrix(translateNames)
}

/* Map zoom handling */
export function zoom (scale) {
  for (var i = 0; i < 6; i++) {
    transformMatrix[i] *= scale
  }

  transformMatrix[4] += (1 - scale) * centerX
  transformMatrix[5] += (1 - scale) * centerY

  var scaleNames = function (x, y) {
    return [centerX - (centerX - x) * scale, centerY - (centerY - y) * scale]
  }

  setMatrix(scaleNames)
}

export function setMatrix (transformNames) {
  var newTransform = 'matrix(' + transformMatrix.join(' ') + ')'
  mapTransform.setAttributeNS(null, 'transform', newTransform)
}

/*****************************************************************************************************/

/* Timer handling */
var startingTime = Date.now()

export function chronometer () {
  // Find the distance between now and the starting time
  var distance = Date.now() - startingTime

  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  var seconds = Math.floor((distance % (1000 * 60)) / 1000)

  var m = minutes + "";
  var s = seconds + "";

  //adding leading zeros under 10th secs and mins
  while (m.length == 1) {m = "0" + m;}
  while (s.length == 1) {s = "0" + s;}

  // Output the result in the timer
  document.getElementById('timer').innerHTML = m + ':' + s
  
}

/**********************************************************************************/
/* adds the local player message into the chat
* waiting for sending to server part */
export function addLocalPlayerMessage () {
  var playerName = 'Player_1'
  var playerColor = '#3D76E2'
  var msgParagraph = document.createElement('P')
  msgParagraph.className = 'playerMessage'
  msgParagraph.style.lineHeight = '1em'
  var msgStr = document.getElementById('playerMsgInput').value
  msgParagraph.innerHTML = '<span class="messagePlayerName" style="color: ' + playerColor + '">' + playerName + '</span><span class="messageContent"> : ' + msgStr + '</span>'
  document.getElementById('chatWindow').appendChild(msgParagraph)
  document.getElementById('chatWindow').scrollTop = document.getElementById('chatWindow').scrollHeight
  document.getElementById('playerMsgInput').value = ''

  /* to do chat messages sending to server */
}

/* add messages from others players into the chat
* this function generates random values for the moment */
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
  msgParagraph.innerHTML = '<span class="messagePlayerName" style="color: ' + playerColor + '">' + playerName + '</span><span class="messageContent"> : ' + msgStr + '</span>'
  document.getElementById('chatWindow').appendChild(msgParagraph)
  document.getElementById('chatWindow').scrollTop = document.getElementById('chatWindow').scrollHeight
}
