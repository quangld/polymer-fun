const COM_ROOM = 'PRIVATE'
const MSG_IDENTIFY = 'IDENTIFY'
const MSG_ID_ACCEPTED = 'ID_ACCEPTED'
const MSG_ID_INVALID = 'ID_INVALID'
const CMD_JOIN = 'JOIN'
const ROOM_AUTHORIZED = 'ROOM_AUTHORIZED'
const ROOM_NOT_AUTHORIZED = 'ROOM_NOT_AUTHORIZED'
const ROOM_MSG = 'ROOM_MSG'
const INVALID_MSG = 'INVALID_MSG'

function SocketServer (server) {
  this.io = require('socket.io')(server)
  this.sockets = []

  this.io.on('connection', s => {
    this.sockets.push(new Socket(s, this.io))
  })

  this.timeInterval = setInterval(() => {
    this.io.emit('server-time', Date.now())
  }, 500)
}

class Socket {
  constructor (socket, io) {
    this.socket = socket
    this.io = io
    this.sendPrivateMessage(MSG_IDENTIFY)
    socket.on(COM_ROOM, data => {
      this.onNewMessage(data)
    })
  }

  onNewMessage (data) {
    let room
    if (data) {
      console.log(data)
      switch (data.cmd) {
        case MSG_IDENTIFY:
          if ((data.msg) && (data.msg.length > 0)) {
            this.username = data.msg.substr(0, 64) // maxium length for username
            this.sendPrivateMessage(MSG_ID_ACCEPTED)
          } else {
            this.sendPrivateMessage(MSG_ID_INVALID)
          }
          break
        case CMD_JOIN:
          room = data.msg.toUpperCase()
          if (room.length >= 3) {
            // check if user is authorized before create a namespace
            var authorized = true
            if (authorized) {
              this.socket.join(room)
              this.sendPrivateMessage(ROOM_AUTHORIZED, {room: room})
            } else {
              this.sendPrivateMessage(ROOM_NOT_AUTHORIZED)
            }
          } else {

          }
          break

        case ROOM_MSG:
          room = data.room
          console.log(this.socket.rooms)

          if (typeof (this.socket.rooms[room]) === 'string') {
            this.sendRoomMessage(room, data.msg)
          }
          break

        default:
          this.sendPrivateMessage(INVALID_MSG, '')
      }
    }
  }

  sendRoomMessage (room, msg) {
    msg = Object.assign({ room: room, from: this.username }, (typeof msg === 'object') ? msg : { msg: msg })
    console.log('Room', room, msg)

    this.io.to(room).emit(ROOM_MSG, msg)
  }

  sendPrivateMessage (cmd, msg) {
    this.socket.emit(COM_ROOM, Object.assign({ from: 'host', cmd: cmd }, (typeof msg === 'object') ? msg : { msg: msg }))
  }
}

module.exports = SocketServer
