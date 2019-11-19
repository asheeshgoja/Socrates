var express = require('express');
var bodyParser = require('body-parser');
var app = express();

let server = require('http').createServer(app);
let io = require('socket.io')(server);


var expressWs = require('express-ws')(app);
var request = require('request');

const assert = require('assert');
const fs = require('fs');
const child_process = require('child_process');
const { spawn } = require('child_process');


const htmlPath = '/www';

//app.use(express.static(__dirname + '/images/'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static(htmlPath))

app.get('/*', (req, res) => {
        res.sendFile(htmlPath + '/index.html');
})


var child;
var stdout_buffer = '';


var processStdout = (data) => {
    // console.log(`child stdout:\n${data}`);

    // let r = data.toString().replace(/[\r\n]+/gm, "");  
    let r = data.toString();
    r = r.replace(/[\r\n]+/gm, "");
    console.log(r);

    stdout_buffer += r;
    if (r.includes('~')) {
        // console.log('emit : ' + r);
        io.emit('clips_response', { response: stdout_buffer });
        stdout_buffer = '';
    }
}

io.on('connection', (socket) => {

    socket.on('disconnect', function() {
        io.emit('users-changed', { user: socket.username, event: 'left' });
    });

    socket.on('start_clips', (user_namme) => {
        console.log('starting clips..');

        if (child != null) {
            child.kill('SIGINT');
        }

        // child = spawn(__dirname + '\\CLIPSDOS64.exe');
        child = spawn('clips');
        child.stdin.write('(load SocratesExpertSystemRules.clp)\n');

        process.stdin.pipe(child.stdin)
        child.stdin.setEncoding('utf-8');
        child.stdout.on('data', processStdout);


        child.stdin.write('(reset)\n');
        child.stdin.write('(run)\n');
    });

    socket.on('user_response', (response) => {
        // socket.username = name;
        // io.emit('users-changed', { user: name, event: 'joined' });
        if (response != null) {
            var r = response.toString();
            child.stdin.write(r + "\n");
        }
    });

    // socket.on('send-message', (message) => {
    //     io.emit('message', { msg: message.text, user: socket.username, createdAt: new Date() });
    // });
});

var port = process.env.PORT || 80;

server.listen(port, function() {
    console.log('listening in http://localhost:' + port);



});
