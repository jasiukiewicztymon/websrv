const yaml  = require('js-yaml');
const fs    = require('fs');
const url   = require('url');
const http  = require('http');
const https = require('https');
const axios = require('axios');

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
    const CREDENTIALS = {
        "certificate": "-----BEGIN CERTIFICATE-----\nMIIFtTCCA52gAwIBAgIRAL6nYMD34UBydTLYLj81+MQwDQYJKoZIhvcNAQELBQAw\neTELMAkGA1UEBhMCREUxDTALBgNVBAcMBFV47e0rsrZuvsNrjWomz8AZ7D\nMv94YSJQwOZCNDzoYiDf76eqy6y7dEGZzg==\n-----END CERTIFICATE-----\n-----BEGIN CERTIFICATE-----\nMIIGYDCCBEigAwIBAgITcAAAAAinzst7Sn3MVgAAAAAACDANBgkqhkiG9w0BAQsF\nADBNMQswCQYDVQQGEwJERTERMA8GA1UEBwwDSBK4w2B+bom+dp\nwiokUHs3zqcnJimjoV5+bYaQuA8KEDpUoSyWbu0CnvqiFn4UUvh5/7RM8xlNYAbf\n/VvkzA==\n-----END CERTIFICATE-----\n-----BEGIN CERTIFICATE-----\nMIIFZjCCA06gAwIBAgIQGHcPvmUGa79M6pM42bGFYjANBgkqhkiG9w0BAQsFADBN\nMQswCQYDVQQGEwJERTERMA8GA1UEBwwIV2FhNDM3rMsLu06agF4JTbO8ANYtWQTx0PVrZKJu+8fcIaUp7MVBIVZ\n-----END CERTIFICATE-----\n",
        "certurl": "https://abcd1234trial.authentication.cert.us10.hana.ondemand.com",
        "clientid": "sb-clicertxsappname!t12345",
        "key": "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEAoG0ENBX+IxI+eFYeg0HeQe+WUUbcj6m5kdu2EQpC76yIYXxf\nBKsdBDZvL2HU/zL0F95n6ePslpmCiRhvC8oYAwXf7CCQJFRczSCRPSMc+HvU7iBmMcSkDfXfX/\n1OAvPsVkkoExhlL9S8hS2ie/Fq07rtfGR6M0ZU2Uahafyz7q/ewu\n-----END RSA PRIVATE KEY-----\n"
    }
    
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

function sslServer() {
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

function init() {
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
                openssl genrsa -out priv.key
                openssl req -new -key priv.key -out csr.pem
                openssl x509 -req -days 9999 -in csr.pem -signkey priv.key -out cert.crt
                rm csr.pem

                => to generate ca_bundle.crt you need external source
                */      

                const ssl = {
                    key: fs.readFileSync('./config/cert/priv.key'),
                    cert: fs.readFileSync('./config/cert/cert.crt'),
                    ca: [
                            fs.readFileSync('./config/cert/ca_bundle.crt')
                    ]
                }
    
                https.createServer(ssl, function (req, res) { serverBuild(req, res) }).listen(subsrv.port)
                http.createServer(function(req, res) {
                    res.writeHead(301, {
                        Location: "https://gitproject.ch"
                    });
                    res.end();
                }).listen(80)
            }
        })
    } catch (err) {
        console.error(err)
        //console.error('Error: Configuration file not found or impossible to open');
    }
} 
