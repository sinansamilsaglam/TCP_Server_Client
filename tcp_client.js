const net = require('net');
const { removeAllListeners } = require('process');

//input user to port and host on command line
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});


try {
    //read port and host from config.txt file
    readConfigFile();
    const { port, host } = readConfigFile();

    const client = new net.Socket();

    clientConnection(client, port, host);

    checkConnection(client, port, host);

    readline.on('close', () => {
        clientClose(client);
        clientConnection(client, port, host);
    });


    client.on('end', () => {
        console.log('Client disconnected');
        client.end();
        client.removeAllListeners();
    });


}
catch (err) {
    console.log(`Error in catch: ${err.message}`);
}



//-----------------FUNCTIONS------------------

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

//create a client connection function
function clientConnection(client, port, host) {

    let options = {
        port: port,
        host: host
    };
    client.setKeepAlive(true, 1000);

    client.connect(options, () => {
        console.log('Connected to: ' + host + ':' + port);
        client.write(client.address().address + ':' + client.address().port);
    });

    clientReceiveData(client);

    clientError(client);

    clientSendData(client);
}

//create client receive data function
function clientReceiveData(client) {
    client.on('data', (data) => {
        console.log('Server Says: ' + data.toString('utf-8'));
    });
}

//create client send data function
function clientSendData(client) {
    if (readline.listenerCount('line') === 0) {
        readline.on('line', (input) => {
            if (input === 'exit' || input === 'close') {
                clientClose(client);
            }
            else {
                client.write(input);
            }
        });
    }
}

//client close function
function clientClose(client) {
    console.log('Connection closed');
    client.removeAllListeners();
    client.destroy();
}

//client error function
function clientError(client) {
    client.on("error", (err) => {
        console.log(`Error: ${err.message}`);
        client.destroy();
    });
}


//send heartbeat function
function sendHeartbeat(client) {
    client.write(client.address().address + ':' + client.address().port);
}

function checkConnection(client, port, host) {
    let counter = 0;
    setInterval(() => {
        if (client.destroyed) {
            console.log('Trying to connect to server...' + (counter + 1) + '. time');
            client.removeAllListeners();
            clientConnection(client, port, host);
            counter++;
        }
        else {
            sendHeartbeat(client);
        }
    }, 5000);
}
