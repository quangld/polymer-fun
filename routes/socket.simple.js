function SocketServer (server) {
  var chPrivate = 'private'
  var chPublic = 'public'
  var io = require('socket.io')(server)
  io.on('connection', function (socket) {
    socket.emit(chPrivate, { cmd: 'IDENTIFY' })
    socket.on(chPrivate, function (data) {
      console.log(data)
      if (!data) return
      if (data.cmd) {
        switch (data.cmd) {
          case 'IDENTITY':
            socket.emit(chPrivate, { cmd: 'MSG', msg: 'Hi ' + data.name })
            break

          case 'JOIN':
            socket.join(chPublic)
            socket.emit(chPrivate, {cmd: 'INROOM', msg: 'You are in ' + chPublic})
            break

          default:
            socket.emit(chPrivate, { cmd: 'INVALID', msg: 'Invalid CMD: ' + data.cmd })
            break

        }
      } else if (data.msg) {
        socket.emit(chPrivate, { cmd: 'msg', msg: 'You said: ' + data.msg })
      }
    })
    socket.on(chPublic, function (data) {
      io.to(chPublic).emit(chPublic, { msg: socket.id + ' said ' + data.msg})
    })
  })
}

module.exports = SocketServer
