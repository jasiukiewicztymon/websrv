# Websrv

Websrv is **HTTP & HTTPS files share**, with *only client-side render* and possibility of server-side code with an *API*.

## Configuration overview

Here are explained all the sub-directories and files, their utility and dependences.

```
/etc/websrv
|-- config
|     `-- websrv.config
|     `-- cert
|             `-- cert.crt
|             `-- ca_bundle.crt
|             `-- priv.key
|-- files
|     `-- subserver
|             `-- *.html
|             `-- public
|                       `-- *
|-- index.js
```

## Configuration file

Example of the configuration file is based on a object for each sub-server. We can find all the proprieties needed to respond to a request.

```yml 
sub-servers: [{
    name: "sub-server-name",
    type: "http",
    build-command: ["build command", "build command"],
    domain: "src.gitproject.ch",
    map: [{
        path: "/",
        file: "index.html",
        slash-id: null,
        content-type: null,
        token: null
    }, {
        path: "/faq",
        file: "faq.html",
        slash-id: true,
        content-type: null,
        token: null
    }],
    port: 8080
}],
content-types: {
    "ext": "content-type",
    "ext": "content-type"
}
```

## HTTPS & SSL

Personnaly with [my domain name](https://gitproject.ch), I have created my certificate for 90 days with [ZeroSSL](https://zerossl.com/). The main reason is that it can give you a zip file with all the needed files which you have to rename.
