const https = require('https'); 
const http  = require('http');
const url   = require('url');
const fs    = require('fs'); 

const { WebSocketServer, OPEN } = require('ws');

const mime = require('mime');

require('dotenv').config();
 
const PORT      = process.env.PORT || 8080;
const WSPORT    = process.env.WSPORT || 8090;
const PROTOCOL  = process.env.PROTOCOL || 'http';
const LOG       = process.env.LOG == 'true' || false;

var WSSERVER = null;

function serveFile(req, res) {
    const splitUrl = req.url.split('.');
    if (LOG)
        console.log(`Handling request on: ${req.url} (${mime.getType(splitUrl[splitUrl.length - 1])})`)

    const q = url.parse(req.url, true);
    fs.readFile(`${__dirname}/public${q.path || '/'}`, function(err, data) {
        if (err) {
            fs.readFile(`${__dirname}/error/404.html`, function(err, data) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(data);
            });
        } else {
            res.writeHead(200, { 'Content-Type': mime.getType(splitUrl[splitUrl.length - 1]) });
            res.end(data);
        }
    });
}

http.createServer(function (req, res) {
    const q = url.parse(req.url, true);

    if (PROTOCOL == 'https') {
        res.writeHead(302, {'Location': `https://localhost:${PORT + 1}${q.path}`});
        res.end();
    }

    serveFile(req, res);
}).listen(PORT);
console.log(`http listening on: https://localhost:${PORT}/`)

if (PROTOCOL == 'http') {
    WSSERVER = new WebSocketServer({ port: WSPORT });
    console.log(`websocket listening on: ws://localhost:${WSPORT}/`)
}
else {
    https.createServer({
        key: fs.readFileSync(`${__dirname}/cert/localhost.key`),
        cert: fs.readFileSync(`${__dirname}/cert/localhost.crt`)
    }, function (req, res) {
        serveFile(req, res);
    }).listen(PORT + 1);
    console.log(`https listening on: https://localhost:${PORT + 1}/`)

    const server = https.createServer({
        cert: fs.readFileSync(`${__dirname}/cert/localhost.crt`),
        key: fs.readFileSync(`${__dirname}/cert/localhost.key`)
    });
      
    WSSERVER = new WebSocketServer({ server });
      
    server.listen(WSPORT + 1);
    console.log(`websocket (secure) listening on: wss://localhost:${WSPORT + 1}/`)
}

fs.watch(`${__dirname}/public`, {
    persistent: true,
    recursive: true
}, (event, filename) => {
    if (filename) {
        console.log(`Server socket update: ${filename}:${event}`)
        WSSERVER.clients.forEach(client => {
            if (client.readyState === OPEN) {
                client.send(`${filename}:${event}`);
            }
        });
    }
});
