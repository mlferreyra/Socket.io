const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./util/messages')
const {userJoin, getCurrentUser, userLeave , getRoomUsers } = require('./util/user');
const user = require('./util/user');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Set stattic folders

app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Chat Bot';

//Correr cuando el cliente esta conectado
io.on('connection', socket =>{
    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        //Welcome current user
        //this is for the single client
        socket.emit('message', formatMessage(botName,'Welcome to Chat'));

        //Broadcast when a user connects
        //this is for all of the client except the client who is contected
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));
    
        //Send users and rooms info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    //Listen por ChatMessage on the server
    socket.on('chatMessage', msg =>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username,msg));
    });

    //Corre cuando el cliente se desconectó
    socket.on('disconnect', ()=>{
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit(
            'message', 
            formatMessage(botName, `${user.username} has left the chat.`));
        };

        //Send users and rooms info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
});



const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server Running on port ${PORT}`));