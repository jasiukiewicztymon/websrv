# Websrv

Websrv is **HTTP & HTTPS files share**, with *only client-side render* and possibility of server-side code with an *API*.

## Configuration overview

The Websrv files are divided into **2 paths**. One of them is a **config folder** with only one config file, and the other one is a **folder with all the files for each sub-server**. You can use for example VueJs which is a client-side JavaScript framework, you have just to precise the build command.

```
/etc/websrv
|-- config
|     `-- websrv.config
|-- files
|     `-- "http/https sub-servers folder"
|             `-- "all sub.server files"
|-- index.js
```

## Configuration file

```yml 
sub-server-name:
```
