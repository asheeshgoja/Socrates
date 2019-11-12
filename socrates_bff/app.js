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


// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use('/', express.static(__dirname));

// app.get('/', function (req, res) {
//     res.sendFile('main.html', { root: __dirname });
// });

var child ;

var main = () => {

    // if(child != null) return;
    
    const { spawn } = require('child_process');

    child = spawn(__dirname + '\\CLIPSDOS64.exe');
    //const child = spawn('clips');

    process.stdin.pipe(child.stdin)
    // child.stdout.pipe(process.stdout);

    child.stdin.setEncoding('utf-8');

    child.stdout.on('data', (data) => {
        // console.log(`child stdout:\n${data}`);
        console.log(`${data}`);
        io.emit('clips_response', { response: data.toString() });
    });

    // child.on('exit', function () {
    //     process.exit()
    // })
    //setTimeout(() => {
    child.stdin.write('(load SocratesExpertSystemRules.clp)\n');
    child.stdin.write('(reset)\n');
    child.stdin.write('(run)\n');
    //}, 3000);
}

var main1 = () => {
    const subprocess = child_process.spawn('ls', {
        stdio: [
            0, // Use parent's stdin for child.
            'pipe', // Pipe child's stdout to parent.
            fs.openSync(__dirname + '/Socrates.exe', 'w') // Direct child's stderr to a file.
        ]
    });

    // assert.strictEqual(subprocess.stdio[0], null);
    // assert.strictEqual(subprocess.stdio[0], subprocess.stdin);

    // assert(subprocess.stdout);
    // assert.strictEqual(subprocess.stdio[1], subprocess.stdout);

    // assert.strictEqual(subprocess.stdio[2], null);
    // assert.strictEqual(subprocess.stdio[2], subprocess.stderr);

}

//main()



io.on('connection', (socket) => {

    socket.on('disconnect', function () {
        io.emit('users-changed', { user: socket.username, event: 'left' });
    });

    socket.on('start_clips', (user_namme) => {
        console.log('starting clips..');
        // socket.username = name;
        // io.emit('users-changed', { user: name, event: 'joined' });
        // child.stdin.write(`$response\n`);
        main();
    });

    socket.on('user_response', (response) => {
        // socket.username = name;
        // io.emit('users-changed', { user: name, event: 'joined' });
        var r = response.toString();
        child.stdin.write(r + "\n");
    });

    // socket.on('send-message', (message) => {
    //     io.emit('message', { msg: message.text, user: socket.username, createdAt: new Date() });
    // });
});

var port = process.env.PORT || 3001;

server.listen(port, function () {
    console.log('listening in http://localhost:' + port);
    // main();
});
