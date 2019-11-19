var io = require('socket.io-client');
var socket = io.connect('http://35.231.137.125', { reconnect: true });

// Add a connect listener
socket.on('connect', function(socket) {
    console.log('Connected!');
});

socket.on('clips_response', (response) => {
    // var response = data['response'];
    console.log(response);
});

socket.emit('start_clips', 'me', 'test msg');
