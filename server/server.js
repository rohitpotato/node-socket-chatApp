const path = require('path');
const http = require('http');
const publicPath = path.join(__dirname, '../public');
const express = require('express');
const socketIO = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
const {generateMessage, generateLocationMessage} = require('./utils/message.js');
const {isRealString} = require('./utils/validation.js');
const {Users} = require('./utils/users.js');

var users = new Users();

app.use(express.static(publicPath));

io.on('connection', (socket) => {

	console.log('New user connected');

	socket.on('join', (params, callback) => {

		if (!isRealString(params.name) && !isRealString(params.room)) {

			return callback('Name and Room name are required');
		}


		socket.join(params.room)
		users.removeUser(socket.id);
		users.addUser(socket.id, params.name, params.room);	

		io.to(params.room).emit('updateUserList', users.getUserList(params.room));

		socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat App'));

		socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));

		callback();
	});

	socket.on('createMessage', (message, callback) =>  {

		var user = users.getUser(socket.id);

		if (user && isRealString(message.text)) {

			io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
		}

		console.log('New Message', message);
		callback();
	});

	socket.on('createLocationMessage', (coords) => {
		var user = users.getUser(socket.id);
		console.log(user);
		if (user) {
			io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));	
		}
		
	});

	socket.on('disconnect', () => {

		var user = users.removeUser(socket.id);
		if (user) {

			io.to(user.room).emit('updateUserList', users.getUserList(user.room));
			io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left the chat room.`));
		}
		console.log('User Disconnected');
	});	
});

server.listen(3000, () => {

	console.log('Started on port 3000');
});
