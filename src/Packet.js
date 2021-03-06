const types = {
  /* general */
  ERROR: 0,
  UNHANDLED: 1,

  /* connection */
  SIGN_UP: 2,
  CONNECT: 3,
  DISCONNECT: 4,

  /* lobby & matchmaking */
  LOBBY_LIST: 5,
  CREATE_LOBBY: 6,
  JOIN_LOBBY: 7,
  EDIT_LOBBY: 8,
  LOBBY_STATE: 9,
  KICK_FROM_LOBBY: 10,
  KICKED: 11,
  CLOSE_LOBBY: 12,
  LEAVE_GAME: 13,
  START_GAME: 14,

  /* misc */
  GAME_RESULTS: 15,
  PLAYER_PROFILE: 16,
  MATCHMAKING: 17,

  /* gameplay */
  END_PHASE: 18,
  PUT: 19,
  USE_TOKENS: 20,
  ATTACK: 21,
  DEFEND: 22,
  MOVE: 23,
  REINFORCEMENT: 24,

  ATTACKED: 25,
  COMBAT_RESULTS: 26,
  PLAYER_ELIMINATION: 27,
  GIVE_TOKENS: 28,
  CURRENT_PHASE: 29,
  GAME_OVER: 30,
  CHAT: 31,

  SYNC_DEMAND: 32,
  GAME_STATUS: 33,

  POKE: 34,
  HOVER: 35,
  SELECT_TOKEN: 36,
  DIE: 37
}

export class Packet {
  constructor (type, data) {
    this.type = types[type]
    this.data = data
  }

  getJson () {
    return JSON.stringify(this)
  }

  getTypeOf (type) {
    return types[type]
  }
}
