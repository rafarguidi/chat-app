const users = []

const addUser = ({ id, userName, room }) => {
  // Limpar dados
  userName = userName.trim().toLowerCase()
  room = room.trim().toLowerCase()

  // Validar dados
  if (!userName || !room) {
    return {
      error: 'Usuário e sala obrigatórios!'
    }
  }

  // Verificando se usuário existe
  const existingUser = users.find((user) => {
    return user.room === room && user.userName === userName
  })

  // Validando usuário
  if (existingUser) {
    return {
      error: 'Este usuário já está em uso!'
    }
  }

  // Armazena usuário

  const user = { id, userName, room }
  users.push(user)
  return { user }
}

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id)

  if (index !== -1) {
    return users.splice(index, 1)[0]
  }
}

const getUser = (id) => {
  return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase()
  return users.filter((user) => user.room === room)
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}