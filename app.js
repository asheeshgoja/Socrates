var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var expressWs = require('express-ws')(app);
var request = require('request');

const assert = require('assert');
const fs = require('fs');
const child_process = require('child_process');
const { spawn } = require('child_process');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', express.static(__dirname));

app.get('/', function (req, res) {
    res.sendFile('main.html', { root: __dirname });
});



var main = () => {

    const { spawn } = require('child_process');

    // const child = spawn(__dirname + '\\CLIPSDOS64.exe');
    const child = spawn('clips');

    process.stdin.pipe(child.stdin)
    // child.stdout.pipe(process.stdout);

    child.stdin.setEncoding('utf-8');

    child.stdout.on('data', (data) => {
        // console.log(`child stdout:\n${data}`);
        console.log(`${data}`);
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

    assert.strictEqual(subprocess.stdio[0], null);
    assert.strictEqual(subprocess.stdio[0], subprocess.stdin);

    assert(subprocess.stdout);
    assert.strictEqual(subprocess.stdio[1], subprocess.stdout);

    assert.strictEqual(subprocess.stdio[2], null);
    assert.strictEqual(subprocess.stdio[2], subprocess.stderr);

}

main()
