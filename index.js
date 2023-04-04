const https = require('https'); 
const http  = require('http');
const url   = require('url');
const fs    = require('fs');

const mime = require('mime');

require('dotenv').config();

const PORT      = process.env.PORT || 8080;
const PROTOCOL  = process.env.PROTOCOL || 'http';
const LOG       = process.env.LOG == 'true' || false;

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

https.createServer({
    key: fs.readFileSync(`${__dirname}/cert/localhost.key`),
    cert: fs.readFileSync(`${__dirname}/cert/localhost.crt`)
}, function (req, res) {
    serveFile(req, res);
}).listen(PORT + 1);

