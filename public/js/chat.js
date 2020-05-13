const socket = io()

// Elements
const $form = document.querySelector('.send-form')
const $inputMessage = $form.querySelector('input')
const $buttonMessage = $form.querySelector('button')
const $buttonLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll = () => {
  // Nova mensagem
  const $newMessage = $messages.lastElementChild

  // Altura da última mensagem
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // Altura visível
  const visibleHeight = $messages.offsetHeight

  // Altura do Container de Menssagens
  const containerHeight = $messages.scrollHeight

  // Até onde já visualizei (scroll)
  const scrollOffset = $messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
  }

}

socket.on('printMsg', (message) => {
  console.log(message)
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('kk:mm')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('printLocation', (message) => {
  console.log(message)
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('kk:mm')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML = html
})

$form.addEventListener('submit', (event) => {
  event.preventDefault()

  $buttonMessage.setAttribute('disabled', 'disabled')

  const message = event.target.elements.message.value
  
  socket.emit('sendMessage', message, (error) => {
    $buttonMessage.removeAttribute('disabled')
    $inputMessage.value = ''
    $inputMessage.focus()

    if (error) {
      return console.log(error)
    }

    console.log('Mensagem entregue!')
  })
})

$buttonLocation.addEventListener('click', () => {
  $buttonLocation.setAttribute('disabled', 'disabled')

  if (!navigator.geolocation) {
    return alert('Geolocation não suportado pelo seu Browser!')
  }
  
  navigator.geolocation.getCurrentPosition((position) => {

    const location = {
      latitude: position.coords.latitude, 
      longitude: position.coords.longitude
    }
    socket.emit('sendLocation', location, () => {
      $buttonLocation.removeAttribute('disabled')
      console.log('Geolocalização compartilhada!')
    })
  })
})

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }
})