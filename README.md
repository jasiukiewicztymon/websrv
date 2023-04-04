# Websrv

**Websrv**, is a static website server for localhost testing, that can use *HTTP* and *HTTPS*. Your files have to be put inside the `/public`, and don't forget to fill in the `.env.example`.

## SSL

To generate the localhost SSL certificate, use this command: 

```sh
openssl req -x509 -out localhost.crt -keyout localhost.key   -newkey rsa:2048 -nodes -sha256   -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
```

## To-do

- [ ] Realtime changes reload
