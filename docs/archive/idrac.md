# Dell iDRAC

My R710 is pretty old, but it does have an iDRAC 6 Enteprise which allows out-of-band management, remote console, power control and lots of other neat-o features. The only problem is, because it was released in 1874 it needs Java to make the remote console work and it needs JRE6 at that. 

JRE6 has been dead and buried for years and is very difficult to get hold of and contains many gaping security vulnerabilities.

## Containerised iDRAC Access

Some clever clogs has however created a container image which effectively proxies the Java clad VNC connection which iDRAC uses for remote console.

```
docker run -d -p 5800:5800 -p 5900:5900 -p 443:443 -e IDRAC_HOST=<idrac_fqdn> -e IDRAC_USER=<idrac_username> -e IDRAC_PASSWORD=<idrac_password> -e IDRAC_PORT=443 --name idrac domistyle/idrac6
```
This will launch the container instance and allow you to access the console via HTTP port 5800. It looks a bit like this:

![](img/idrac6_console.png)

You can also use a VNC compatible viewer to connect directly to port 5900 to gain console access. Not sure why you'd want to do this, but you can.

Each idrac6 container instance can only handle a connection to a single iDRAC. For multiple iDRACs you'll need multiple containers instances.

## iDRAC6 Compose File

```
version: '3'

services:
  idracweb:
    container_name: idracweb
    hostname: idracweb.home.200a.co.uk
    restart: unless-stopped
    image: domistyle/idrac6
    ports:
      - 5800:5800
      - 5900:5900
    environment:
      - IDRAC_HOST=idrac.home.200a.co.uk
      - IDRAC_USER=root
      - IDRAC_PASSWORD=calvin
```

Configure the iDRAC6 Web Service so that it gets proxied by traefik. Add the following labels and network configuration to the compose file: (this assumes you've already got traefik up and running)

```
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.idracweb.entryPoints=web"
      - "traefik.http.routers.idracweb.rule=Host(`idracweb.$MY_DOMAIN`)"

networks:
  default:
    external:
      name: traefik_proxy
```

Restart the container: `docker-compose down && docker-compose up -d`

The idrac container web UI is now accessible via http://idracweb.home.200a.co.uk. 

## HTTPS

To enable TLS termination to be handled by traefik using our wildcard default certificate, we just need to modify the labels:

```
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.idracweb.entryPoints=websecure"
      - "traefik.http.routers.idracweb.tls=true"
      - "traefik.http.routers.idracweb.rule=Host(`idracweb.$MY_DOMAIN`)"
```
We change entryPoints to be `websecure` and add the label `"traefik.http.routers.idracweb.tls=true"`. Restart the container. Job done.
