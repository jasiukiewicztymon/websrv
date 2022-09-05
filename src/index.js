const yaml  = require('js-yaml');
const fs    = require('fs');
const url   = require('url');
const http  = require('http')
const https = require('https')

const { exec } = require("child_process");

/*
    The content type can be extended by the config file. You have to use a YAML object with the key as the extension of the file and the content-type as the value.
*/

const contentTypes = {
    "aac": "audio/aac",
    "abw": "application/x-abiword",
    "arc": "application/octet-stream",
    "avi": "video/x-msvideo",
    "azw": "application/vnd.amazon.ebook",
    "bin": "application/octet-stream",
    "bz": "application/x-bzip",
    "bz2": "application/x-bzip2",
    "csh": "application/x-csh",
    "css": "text/css",
    "csv": "text/csv",
    "doc": "application/msword",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "eot": "application/vnd.ms-fontobject",
    "epub": "application/epub+zip",
    "gif": "image/gif",
    "htm": "text/html",
    "html": "text/html",
    "ico": "image/x-icon",
    "ics": "text/calendar",
    "jar": "application/java-archive",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "js": "application/javascript",
    "json": "application/json",
    "mid": "audio/midi",
    "midi": "audio/midi",
    "mpeg": "video/mpeg",
    "mpkg": "application/vnd.apple.installer+xml",
    "odp": "application/vnd.oasis.opendocument.presentation",
    "ods": "application/vnd.oasis.opendocument.spreadsheet",
    "odt": "application/vnd.oasis.opendocument.text",
    "oga": "audio/ogg",
    "ogv": "video/ogg",
    "ogx": "application/ogg",
    "otf": "font/otf",
    "png": "image/png",
    "pdf": "application/pdf",
    "ppt": "application/vnd.ms-powerpoint",
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "rar": "application/x-rar-compressed",
    "rtf": "application/rtf",
    "sh": "application/x-sh",
    "svg": "image/svg+xml",
    "swf": "application/x-shockwave-flash",
    "tar": "application/x-tar",
    "tif": "image/tiff",
    "tiff": "image/tiff",
    "ts": "application/typescript",
    "ttf": "font/ttf",
    "txt": "text/plain",
    "vsd": "application/vnd.visio",
    "wav": "audio/x-wav",
    "weba": "audio/webm",
    "webm": "video/webm",
    "webp": "image/webp",
    "woff": "font/woff",
    "woff2": "font/woff2",
    "xhtml": "application/xhtml+xml",
    "xls": "application/vnd.ms-excel",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "xml": "application/xml",
    "xul": "application/vnd.mozilla.xul+xml",
    "zip": "application/zip",
    "3gp": "video/3gpp",
    "3g2": "video/3gpp2",
    "7z": "application/x-7z-compressed"
}

/*
    ============================================
    testServerBuild()
    ============================================
    
    Use this function in WAN IP test.
*/

function testServerBuild() {
    http.createServer(function(req, res) {
        res.writeHead(200, { "Content-Type": "text/html" })
        res.write('<h1>Hello world</h1>')
        res.end()
    }).listen(80, '0.0.0.0');
}

/*
    ============================================
    serverBuild()
    ============================================
    
    Build the server response part for HTTP and HTTPS
*/

function serverBuild(req, res) {
    var parsedURL = url.parse(req.url, true);
    var resContentType = "text/plain";
    for (ext in contentTypes) {
        if (parsedURL.pathname.endsWith(ext)) 
            resContentType = contentTypes[ext];
    }

    if (parsedURL.hostname == subsrv.domain) {
        if (fs.existsSync(`./files/${subsrv.name}${parsedURL.pathname}`)) {
            res.writeHead(200, { 'Content-Type': resContentType })
            res.write(fs.readFileSync(`./files/${subsrv.name}/${parsedURL.pathname}`))
        }
        else {
            if (subsrv["file-404"] != null) {                       
                res.writeHead(404, { 'Content-Type': resContentType })
                res.write(fs.readFileSync(`./files/${subsrv.name}/${subsrv["file-404"]}`))
            }
        }
        res.end()
    }
}

try {
    const websrvConfig = yaml.load(fs.readFileSync('./config/websrv.config'));
    websrvConfig['sub-servers'].forEach(subsrv => {
        // build commands
        
        subsrv['build-command'].forEach(command => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
            });  
        })
        
        // servers 
        if (subsrv.type == 'http') {
            http.createServer(function (req, res) { serverBuild(req, res) }).listen(subsrv.port)
        } else {
            /* 
            ========================================
            > SSL : generate self-signed certificate
            ========================================

            openssl genrsa -out key.pem
            openssl req -new -key key.pem -out csr.pem
            openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
            rm csr.pem

            */            
            const ssl = {
                key: fs.readFileSync('./config/cert/key.pem'),
                cert: fs.readFileSync('./config/cert/cert.pem')
            };

            https.createServer(ssl, function (req, res) { serverBuild(req, res) }).listen(subsrv.port)
        }
    })
} catch (err) {
    console.error(err)
    //console.error('Error: Configuration file not found or impossible to open');
}
