const express = require('express')
const app = express()
const http = require('http').createServer(app)

const PORT = process.env.PORT || 3500

http.listen(PORT, function(){
    console.log(`Listening on port ${PORT}`)
})

app.use(express.static(__dirname + '/public'))

app.get('/', function(req, res){
    res.sendFile(__dirname + '/user_chatbox.html')
})
app.get('/adminchat', function(req, res){
    res.sendFile(__dirname + '/admin_chat.html')
})
 
const io = require('socket.io')(http)

io.on('connection', function(socket) {
    console.log('Connected...')
    socket.on('message', function(msg){
        socket.broadcast.emit('message', msg)
    })
})
