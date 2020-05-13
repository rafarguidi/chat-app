const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
  console.log('Nova conexão WebSocket')

  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, userName: username, room })

    if (error) {
      return callback(error)
    }

    socket.join(user.room)

    socket.emit('printMsg', generateMessage('Admin','Bem vindo!'))
    socket.broadcast.to(user.room).emit('printMsg', generateMessage('Admin', `${user.userName} entrou na sala!`))
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    callback()
  })

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id)
    const filter = new Filter()

    if (filter.isProfane(message)) {
      return callback('Não permitimos palavrões!')
    }

    io.to(user.room).emit('printMsg', generateMessage(user.userName, message))
    callback()
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit('printMsg', generateMessage('Admin', `${user.userName} saiu!`))
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })

  socket.on('sendLocation', (location, callback) => {
    const user = getUser(socket.id)

    if (!location) {
      return callback('Não foi possível enviar a localização.')
    }
    
    io.to(user.room).emit('printLocation', generateLocationMessage(user.userName, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
    callback()
  })
})

server.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}!`)
})