const chatForm = document.getElementById('chat-form');
const chatMessage = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//Obtener username y room de la URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

//Join Chatroom 
socket.emit('joinRoom', {username, room});

//Get room and users
socket.on('roomUsers', ({ room, users}) =>{
    outputRoomName(room);
    outputUsers(users);
});


//capto aqui el mensaje enviado desde el servidor
socket.on('message', message =>{
    console.log(message);
    outputMessage(message);

    //scroll down
    chatMessage.scrollTop = chatMessage.scrollHeight;
});


//capto el mensaje enviado

chatForm.addEventListener('submit', e =>{
    e.preventDefault();

    //obtener el msj del input
    const msg = e.target.elements.msg.value;
    
    //Emit un mensaje al servidor
    socket.emit('chatMessage', msg);

    //clear input and focus
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

//Output message to DOM

function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} - <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//Add room name to DOM 
function outputRoomName(room){
    roomName.innerText = room;
}

//Add users to DOM
function outputUsers(users){
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
}