

export function dropdownClick(){
  document.getElementById('myDropdown').classList.toggle('show');
}
/*********************************************************************************************************************/
/* Menu button handling */
/* When the user clicks on the button, toggle between hiding and showing the dropdown content */


// Close the dropdown menu if the user clicks outside of it
/*window.onclick = function (event) {
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
}*/

/* SVG map handling */
var svg
var doc
var map
var label
var text
var highlight
var countries
var seas
var viewbox
var centerX
var centerY
var mapTransform
var transformMatrix
var svgNS
var planisphere

var selectedElement, offset, transform
var el

/* Initialize the SVG map on the UI */
export function init (evt) {
  svgNS = 'http://www.w3.org/2000/svg'
  svg = evt.target
  doc = svg.ownerDocument
  map = doc.getElementById('GameMap')
  planisphere = doc.getElementById('matrix-group')
  label = newElement(
    'text',
    'id=label font-size=30 stroke=black fill=white stoke-width=50 text-insert=middle x=20 y=500'
  )
  text = doc.createTextNode('Riks World')
  // label.appendChild( text );
  svg.appendChild(label)
  highlight = doc.getElementById('highlight')

  countries = document.getElementsByClassName('country')

  startChr()

  for (var i = 0; i < countries.length; i++) {
    var country = countries[i]
    country.addEventListener('mouseover', function (evt) {
      mouseoverCountry(evt)
    })
  }

  seas = document.getElementsByClassName('sea')
  for (var i = 0; i < seas.length; i++) {
    var sea = seas[i]
    sea.addEventListener('mouseover', function (evt) {
      mouseoverSea(evt)
    })
  }

  viewbox = svg.getAttributeNS(null, 'viewBox').split(' ')
  centerX = parseFloat(viewbox[2]) / 2
  centerY = parseFloat(viewbox[3]) / 2
  mapTransform = svg.getElementById('matrix-group')
  transformMatrix = [1, 0, 0, 1, 0, 0]

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

  function getMousePosition (evt) {
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

      // console.log("else if");
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
   *  issue : fix double soldier placement, ajust soldier position
   *  on some countries */
  export function placeSoldier (evt) {
    var country = evt.target

    var bbox = country.getBBox()
    var x = Math.floor(bbox.x + bbox.width / 2.0) - 20
    var y = Math.floor(bbox.y + bbox.height / 2.0) - 15

    /* console.log("Center of Path : x = " + x + " y = " + y);

        var parentCountry = document.getElementById('matrix-group');
        var rect = document.createElementNS(svgNS,'rect');
        rect.setAttribute('x',x.toString());
        rect.setAttribute('y',y.toString());
        rect.setAttribute('width',"10");
        rect.setAttribute('height',"10");
        rect.setAttribute('fill','red');
        rect.setAttribute('class', "draggable-group");
        rect.setAttribute('transform', "matrix(1 0 0 1 0 0) translate(10, 0)");
        parentCountry.appendChild(rect);
    */

    var test = d3.select(country.getAttribute('id')).toString()
    console.log('id = ' + test)

    var svg = d3
      .select('#matrix-group g')
      /* var svg = d3.select('#' + (country.getAttribute('id')).toString()) */
      .append('svg:image')
      .attr('xlink:href', 'assets/soldier.svg')
      .attr('width', '40')
      .attr('height', '40')
      .attr('x', x.toString())
      .attr('y', y.toString())
  }
}

// generic function to create an xml element
export function newElement (type, attrs) {
  var result = doc.createElementNS('http://www.w3.org/2000/svg', type)
  if (result) {
    attr = attrs.split(' ')
    for (var i = 0; i < attr.length; i++) {
      value = attr[i].split('=')
      result.setAttribute(value[0], value[1])
    }
  }
  return result
}

export function mouseoverSea (evt) {
  var sea = evt.target
  highlight.setAttribute('d', 'm0 0')
  text.textContent = sea.getAttribute('id')
}

/* Display country name when mouse hovers it  */
export function mouseoverCountry (evt) {
  var country = evt.target
  var outline = country.getAttribute('d')
  highlight.setAttribute('d', outline)
  text.textContent = country.getAttribute('id')
}

/***********************************************************************************************/

/* Mouse wheel event handling */
if (window.addEventListener) {
  // IE9, Chrome, Safari, Opera
  window.addEventListener('mousewheel', wheel, false)
  // Firefox
  window.addEventListener('DOMMouseScroll', wheel, false)
}
// IE 6/7/8
else window.attachEvent('onmousewheel', wheel)

export function wheel (event) {
  var e = window.event || e
  if (event.wheelDelta) {
    /* IE/Opera. */
    delta = event.wheelDelta / 120
  } else if (event.detail) {
    /* Mozilla case. */

    delta = -event.detail / 3
  }
  if (delta) handleWheelEvt(delta)

  if (event.preventDefault) event.preventDefault()
  event.returnValue = false
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

/* Timer handling : issue : the timer stops when the tab is not
 * focused on the browser */
var tenthSec = 0
var seconds = 0
var minutes = 0

var startTimer = 0

export function chronometer () {
  if (startTimer === 1) {
    // set tenth of seconds
    tenthSec += 1

    // set seconds
    if (tenthSec > 9) {
      tenthSec = 0
      seconds += 1
    }

    // set minutes
    if (seconds > 59) {
      seconds = 0
      minutes += 1
    }

    // adds data in #timer
    document.getElementById('timer').innerHTML = minutes + ' : ' + seconds

    setTimeout('chronometer()', 100)
  }
}

/* starts the timer */
export function startChr () {
  startTimer = 1
  chronometer()
}
