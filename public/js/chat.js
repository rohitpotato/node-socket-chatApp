var socket = io();

function scrollToBottom() {

	var messages = jQuery('#messages');
	var newMessage = messages.children('li:last-child')
	var clientHeight = messages.prop('clientHeight');
	var scrollTop = messages.prop('scrollTop')
	var scrollHeight = messages.prop('scrollHeight');

	var newMessageHeight = newMessage.innerHeight();
	var lastMessageHeight = newMessage.prev().innerHeight();
	if (clientHeight + scrollTop + lastMessageHeight + newMessageHeight >= scrollHeight) {
		messages.scrollTop(scrollHeight);
	}
}

socket.on('connect', function ()  {

	var params = jQuery.deparam(window.location.search);

	socket.emit('join', params, function (err) {

		if (err) {
			alert(err);
			window.location.href = '/';
		} else {
			console.log('No errors');
		}
	});

	console.log('Connected to Server');

	socket.on('newMessage', function (message) {
		var formattedTime = moment(message.createdAt).format('h:mm:a');
		var template = jQuery('#message-template').html();
		var html = Mustache.render(template, {

			text: message.text,
			from: message.from,
			createdAt: formattedTime
		});

		jQuery('#messages').append(html);

		scrollToBottom();
	})
});

socket.on('updateUserList', function (users) {
	var ol = jQuery('<ol></ol>');
	users.forEach(function (user) {

		ol.append(jQuery('<li></li>').text(user));
	});

	jQuery('#users').html(ol);
});	

socket.on('newLocationMessage', function (message) {

	var formattedTime = moment(message.createdAt).format('h:mm:a');
	var template = jQuery('#location-message-template').html();
	var html = Mustache.render(template, {

		text: message.url,
		from: message.from,
		createdAt: formattedTime
	});

	jQuery('#messages').append(html);

	scrollToBottom();

	/*var li = jQuery('<li></li>');
	var a = jQuery('<a target="_blank">My current Location</a>');

	var formattedTime = moment(message.createdAt).format('h:mm:a');
	li.text(`${message.from} ${formattedTime}:`);
	a.attr('href', message.url);
	li.append(a);
	jQuery('#messages').append(li);*/
});

socket.on('disconnect', function () {

	console.log('Disconnected from Server');
});

jQuery('#message-form').on('submit', function (e) {
	e.preventDefault();

	var messageTextbox = jQuery('[name=message]')

	socket.emit('createMessage', {
		text: jQuery('[name=message]').val()
	}, function () {
		jQuery('[name=message]').val('')
	});
});

var locationButton = jQuery('#send-location');
locationButton.on('click', function () {

	if (!navigator.geolocation) {

		return alert('Geolocation not supported by your browser');
	} 

	locationButton.attr('disabled', 'disabled').text('Sending location...');

	navigator.geolocation.getCurrentPosition(function (position) {
		locationButton.removeAttr('disabled').text('Send Location');
		socket.emit('createLocationMessage', {

			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		});

	}, function () {

		locationButton.attr('disabled', 'disabled').text('Second Location');
		alert('Unable to fetch location');
	});
}); 