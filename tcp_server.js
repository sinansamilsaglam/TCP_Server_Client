const net = require('net');

//for input
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    

});

try {

    readConfigFile();

    const { port, host } = readConfigFile();

    server = net.createServer();
    server.listen(port, host, () => {
        console.log('Server Started. TCP Server is running on \r\n' + 'Host: ' + host + ' Port: ' + port);
    });

    let sockets = [];

    server.on('connection', function (sock) {

        sockConnection(sockets, sock);

        sock.on('data', function (data) {
            let index = findSockIndex(sockets, sock);
            console.log('CLIENT ' + (index + 1) + ' ' + sock.remoteAddress + ':' + sock.remotePort + ': ' + data.toString('utf-8'));
        });


        readline.on('line', (input) => {
            sendMessage(sockets, input);
        });

        sendHeartbeat(sockets);

        sock.on('close', function (data) {
            sockClose(sockets, sock);
        });

    });

    readline.on('SIGINT', () => {
        closeServer(sockets);
    });

}
catch (err) {
    console.log(`Error: ${err.message}`)
}


// -----------FUNCTIONS------------------

//read port and host from config.txt file
//fs file system module, for reading files
//path module, for joining paths
function readConfigFile() {
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(__dirname, 'config.txt');
    const config = fs.readFileSync(configPath, 'utf8');
    const configArray = config.split('\n');
    const port = configArray[0].split('=')[1];
    const host = configArray[1].split('=')[1];
    return { port, host };
}

//sock connection and add to sockets array
function sockConnection(sockets, sock) {
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
    sockets.push(sock);

    console.log('Enter 0 to send message to all clients.');
    for (let i = 0; i < sockets.length; i++) {
        console.log('Enter ' + (i + 1) + ' to send message to client ' + (i + 1) + '.');
    }
}


//sock close and remove from sockets array
function sockClose(sockets, sock) {
    let index = findSockIndex(sockets, sock);
    if (index !== -1)
        sockets.splice(index, 1);
    console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
}

function findSockIndex(sockets, sock) {
    let index = sockets.findIndex(function (o) {
        return o.remoteAddress === sock.remoteAddress && o.remotePort === sock.remotePort;
    })
    return index;
}


//send heartbeat to clients
function sendHeartbeat(sockets) {
    setInterval(() => {
        if (sockets.length > 0) {
            for (let i = 0; i < sockets.length; i++) {
                //send server address and port to clients
                sockets[i].write(server.address().address + ':' + server.address().port);
            }
        }
    }, 5000);
}


function sendMessage(sockets, input) {
    const firstChar = input.charAt(0);
    input = input.substring(1).toString('utf-8');
    //check sockets array empty or not
    if (sockets.length == 0) {
        console.log('No Client Connected.');
    }
    else {
        if (firstChar == 0) {
            for (let i = 0; i < sockets.length; i++) {
                sockets[i].write(input);
            }
        }
        else {
            if (firstChar > 0 && firstChar <= sockets.length) {
                sockets[firstChar - 1].write(input);
            }
            else {
                console.log('Invalid Client Number. You Need To Starts Your Message With Client Number.');
                for (let i = 0; i < sockets.length; i++) {
                    console.log('Client ' + (i + 1) + ' : ' + sockets[i].remoteAddress + ':' + sockets[i].remotePort);
                }
            }
        }

    }
}

//are you sure to close server
function closeServer(sockets) {
    readline.question(`Are you sure you want to close the server? Type Y or N \r\n`, answer => {
        if (answer == 'Y') {
            server.close();
            readline.close();

            closeAllClients(sockets);
        }
    });
}

//if server is closed close all clients function
function closeAllClients(sockets) {
    console.log('Server is closed. All clients are destroyed.');
    for (let i = 0; i < sockets.length; i++) {
        sockets[i].destroy();
    }
}
