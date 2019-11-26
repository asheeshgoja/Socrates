var express = require('express');
var bodyParser = require('body-parser');
var app = express();

let server = require('http').createServer(app);
var io = require('socket.io')(server);

var expressWs = require('express-ws')(app);
var request = require('request');

const assert = require('assert');
const fs = require('fs');
const child_process = require('child_process');
const { spawn } = require('child_process');

var socketUUID_to_childprocess = {}
var socketUUID_to_SocketId = {}

 const htmlPath = '/www';
//const htmlPath = 'C:/socrates/Socrates/www';

//app.use(express.static(__dirname + '/images/'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static(htmlPath))

app.get('/*', (req, res) => {
    res.sendFile(htmlPath + '/index.html');
})


// var child;
var stdout_buffer = '';


var processStdout = (data) => {
    // console.log(`child stdout:\n${data}`);

    // let r = data.toString().replace(/[\r\n]+/gm, "");  
    let r = data.toString();
    r = r.replace(/[\r\n]+/gm, "");
    console.log(r);

    let socket_id_regex = /.*#(.*)#/;
    let match = socket_id_regex.exec(r);
    let socketid;
    if (match != null) {
        socketid = match[1];
    }

    stdout_buffer += r;
    if (socketid) {
        // console.log('emit : ' + r);
        // let sock = io.sockets.connected[socketUUID_to_SocketId[socketid]];
        // sock.emit('clips_response', { response: stdout_buffer });
        let id = socketUUID_to_SocketId[socketid];
        io.to(socketid).emit('clips_response', { response: stdout_buffer });
        stdout_buffer = '';
    }
}

io.on('connection', (socket) => {

    socket.on('disconnect', function () {
        io.emit('users-changed', { user: socket.username, event: 'left' });
    });

    socket.on('start_clips', (socketUUID) => {
        console.log('starting clips for user : ' + socketUUID);

        let child = socketUUID_to_childprocess[socketUUID];

        if (child == null) {
            //child.kill('SIGINT');
            // child = spawn(__dirname + '\\CLIPSDOS64.exe');
            child = spawn('clips');
            socketUUID_to_childprocess[socketUUID] = child;
            socket.childprocess = child;
        }

        socket.join(socketUUID);
        socketUUID_to_SocketId[socketUUID] = socket.id;

        //child = spawn('clips');

        let newFileName = __dirname + "/SocratesExpertSystemRules.clp." + socketUUID;
        fs.readFile(__dirname + "/SocratesExpertSystemRules.clp", 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }
            var result = data.replace(/{user_id}/gm, socketUUID);

            fs.writeFile(newFileName, result, 'utf8', function (err) {
                if (err) return console.log(err);

                child.stdin.write(`(load ${newFileName})\n`);

                process.stdin.pipe(child.stdin)
                child.stdin.setEncoding('utf-8');
                child.stdout.on('data', processStdout);


                child.stdin.write('(reset)\n');
                child.stdin.write('(run)\n');
            });
        });
    });

    socket.on('user_response', (response, info) => {
        // socket.username = name;
        // io.emit('users-changed', { user: name, event: 'joined' });
        if (response != null) {
            socket.join(info.userid);
            socketUUID_to_SocketId[info.userid] = info.sock_id;
            let child_proc = socketUUID_to_childprocess[info.userid];
            // child_proc = socket.childprocess;
            if (child_proc != null) {
                var r = response.toString();
                child_proc.stdin.write(r + "\n");
            }
        }
    });

    socket.on('close_session', (response, info) => {
        let newFileName = __dirname + "/SocratesExpertSystemRules.clp." + info.userid;
        fs.unlink(newFileName, (err) => {
            if (err) {
                console.log("failed to delete file" + err);
            } 
        });

        socket.leave(info.sock_id);
    });

});

var port = process.env.PORT || 80;

server.listen(port, "0.0.0.0", function () {
    console.log('listening in http://localhost:' + port);

});
