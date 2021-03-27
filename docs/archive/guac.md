# Holy Guacamole

Guacamole is made primarily from avacados and provides a client-less remote access solution for SSH, VNC, RDP etc. Here's how to set it up. Normally Guacamole requires a multitude of different components including a database, web server and the guacd component. This means having to configure multiple containers and link them together for a docker deployment; ain't nobody got time for that.

## oznu/guacamole

Luckily for us a lovely community user on the docker hub 'oznu' has combined all of the components into a single container image. This simplifies everything massively, so for now, we'll go with that approach.

Just to try things out initially, we'll run the container manually like so: `docker run -p 9080:8080 -v "${PWD}/config:/config" onzu/guacamole`

Default login is 'guacadmin' : 'guacadmin'.

## Compose File Example

```
version: '3'

services:
  guacamole:
    container_name: guacamole
    hostname: guacamole
    image: oznu/guacamlole
    restart: unless-stopped
    ports:
      - "8081:8080"
    volumes:
      - "./config:/config"
    environment:
      - "EXTENSIONS=auth-ldap"
    labels:
    - "traefik.enable=true"
    - "traefik.http.routers.guacamole.entryPoints=websecure"
    - "traefik.http.routers.guacamole.rule=Host(`guac.home.200a.co.uk`)"
    - "traefik.http.routers.guacamole.tls=true"
    - "traefik.http.routers.guacamole.tls.domains[0].main=*.home.200a.co.uk"

networks:
  default:
    external:
      name: traefik_proxy

```
