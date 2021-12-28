const express = require('express');
const app=express();
const server=require('http').Server(app);
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug : true
});

// set the view engine to ejs
app.set('view engine', 'ejs');
// use res.render to load up an ejs view file
app.use("/static", express.static('./static/'));
// index page
app.get('/', function(req, res) {
  res.sendFile(__dirname+"/views/index.html")
});

app.use('/peerjs', peerServer);
app.get('/about/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
  })

  app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
  })
  
  io.on('connection', socket => {
    socket.on('join-room' , (roomId, userId) => {
      socket.join(roomId); 
      socket.broadcast.to(roomId).emit('user-connected', userId);
      socket.on('message', message => {
        io.to(roomId).emit('createMessage', message)
      })
    })
  })
  

server.listen(process.env.PORT || 8080);
console.log('Server is listening on port 8080');