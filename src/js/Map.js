export var map = {
  'North America': {
    Alaska: {
      player: false,
      soldiers: 0
    },
    'Northwest Territory': {
      player: false,
      soldiers: 0
    },
    Greenland: {
      player: false,
      soldiers: 0
    },
    Alberta: {
      player: false,
      soldiers: 0
    },
    Ontario: {
      player: false,
      soldiers: 0
    },
    Quebec: {
      player: false,
      soldiers: 0
    },
    'Eastern United States': {
      player: false,
      soldiers: 0
    },
    'Western United States': {
      player: false,
      soldiers: 0
    },
    'Central America': {
      player: false,
      soldiers: 0
    }
  },
  'South America': {
    Venezuela: {
      player: false,
      soldiers: 0
    },
    Peru: {
      player: false,
      soldiers: 0
    },
    Brazil: {
      player: false,
      soldiers: 0
    },
    Argentina: {
      player: false,
      soldiers: 0
    }
  },
  Europe: {
    Iceland: {
      player: false,
      soldiers: 0
    },
    Scandinavia: {
      player: false,
      soldiers: 0
    },
    Ukraine: {
      player: false,
      soldiers: 0
    },
    'Great Britain': {
      player: false,
      soldiers: 0
    },
    'Northern Europe': {
      player: false,
      soldiers: 0
    },
    'Southern Europe': {
      player: false,
      soldiers: 0
    },
    'Western Europe': {
      player: false,
      soldiers: 0
    }
  },
  Africa: {
    'North Africa': {
      player: false,
      soldiers: 0
    },
    Egypt: {
      player: false,
      soldiers: 0
    },
    Congo: {
      player: false,
      soldiers: 0
    },
    'East Africa': {
      player: false, // Put the id of the player owning this territory
      soldiers: 0
    },
    'South Africa': {
      player: false,
      soldiers: 0
    },
    Madagascar: {
      player: false,
      soldiers: 0
    }
  },
  Asia: {
    Ural: {
      player: false,
      soldiers: 0
    },
    Siberia: {
      player: false,
      soldiers: 0
    },
    Yakutsk: {
      player: false,
      soldiers: 0
    },
    Kamchatka: {
      player: false,
      soldiers: 0
    },
    Afghanistan: {
      player: false,
      soldiers: 0
    },
    China: {
      player: false,
      soldiers: 0
    },
    Irkutsk: {
      player: false,
      soldiers: 0
    },
    Mongolia: {
      player: false,
      soldiers: 0
    },
    Japan: {
      player: false,
      soldiers: 0
    },
    'Middle East': {
      player: false,
      soldiers: 0
    },
    India: {
      player: false,
      soldiers: 0
    },
    Siam: {
      player: false,
      soldiers: 0
    }
  },
  Australia: {
    Indonesia: {
      player: false,
      soldiers: 0
    },
    'New Guinea': {
      player: false,
      soldiers: 0
    },
    'Eastern Australia': {
      player: false,
      soldiers: 0
    },
    'Western Australia': {
      player: false,
      soldiers: 0
    }
  }
}

/**
 * Returns the continent which contains the territory
 *
 * @param territoryName: name of the territory
 */
export function getContinentOf (territoryName) {
  /* get all of the continents into an array */
  var result = Object.keys(map).map(function (key) {
    return [key, map[key]]
  })

  var found = ''

  /* for each continent ... */
  result.forEach(function (continent) {
    if (found != '') {
      return found
    }

    /* ... get array of territories ... */
    var territories = Object.keys(continent[1]).map(function (key) {
      return [key, continent[1][key]]
    })

    /* ... and for each territory */
    territories.forEach(function (territory) {
      /* ... check if it's the one we're looking for */
      if (territory[0] == territoryName) {
        found = continent[0]
        return found
      }
    })
  })

  return found
}

export function areAdjacent (territory1, territory2) {
  return false
}
