# Traefik Demo on Docker

## Set the scene

* On `ubuntu-vm` go to `/home/llharris/docker/demo/services`
* Run: `docker-compose up -d`

Access the following URLs:

http://192.168.200.50:82/

http://192.168.200.50:83/

http://192.168.200.50:84/


## Stand-up the demo

* On `ubuntu-vm` go to /home/llharris/docker/demo.
* `docker network create demo_proxy`
* `mkdir traefik/config`
* `vi traefik/config/traefik.yml`

Add the following:

```
## STATIC CONFIG

log:
  level: DEBUG

api:
  insecure: true
  dashboard: true

entryPoints:
  web:
    address: ":80"

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
```

* Create the compose file for traefik: `vi traefik/docker-compose.yml`

Add the following:

```
version: '3'

services:
  traefik:
    image: "traefik:v2.3"
    container_name: "traefik_demo"
    hostname: "traefik"
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./config/traefik.yml:/traefik.yml:ro"

networks:
  default:
    external:
      name: demo_proxy
```
* Check the compose file: `docker-compose config`
* Run the container: `docker-compose up -d`
* Browse to `https://traefik.home.200a.co.uk:8080`

* Create a compose file for a whoami image: `vi whoami/docker-compose.yml`

```
version: '3'

services:
  whoami:
    image: "containous/whoami"
    container_name: "whoami"
    hostname: "whoami"
    ports:
      - "81:80"

networks:
  default:
    external:
      name: demo_proxy
```
* Browse to http://whoami.home.200a.co.uk:81
* Now modify the docker-compose.yml and add the labels:

```
version: '3'

services:
  whoami:
    image: "containous/whoami"
    container_name: "whoami"
    hostname: "whoami"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.whoami.entryPoints=web"
      - "traefik.http.routers.whoami.rule=Host(`whoami.home.200a.co.uk`)"

networks:
  default:
    external:
      name: demo_proxy
```

## Proxy an external site

Show direct access to plex via http://192.168.200.254:32400

To proxy an external site, we need to modify the traefik.yml. First add the file provider:

```
providers:
  ...
  file:
    filename: "traefik.yml"
    directory: "/"
    watch: true
```

Then add dynamic configuration to traefik.yml:

```
## DYNAMIC CONFIG

http:
  routers:
    route-to-plex-ip:
      rule: "Host(`plex.home.200a.co.uk`)"
      service: route-to-plex-ip-service
      entryPoints: web

  services:
    route-to-plex-ip-service:
      loadBalancer:
        servers:
          - url: "http://192.168.200.254:32400"
```

## TLS Encrypt Traffic

First let's TLS encrypt traffic to our whoami container. 

Add another section to `traefik.yml`

```
tl:
  stores:
    default:
      defaultCertificate:
        certFile: "/cert.crt"
        keyFile: "/cert.key"
```

Still in traefik.yml add a new entryPoint for `websecure`.

```
entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"
```

Add a mapping for port 443 to the traefik docker-compose.yml.

Now modify docker-compose.yml to bind mount the cert and key...

```
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./config/traefik.yml:/traefik.yml:ro"
      - "./config/cert.crt:/cert.crt:ro"
      - "./config/cert.key:/cert.key:ro"
```

Now copy the cert and key to the config directory on the host. Stop / Start traefik.

Next modify the docker-compose.yml for whoami.

```
labels:
      - "traefik.enable=true"
      - "traefik.http.routers.whoami.entryPoints=websecure"
      - "traefik.http.routers.whoami.rule=Host(`whoami.home.200a.co.uk`)"
      - "traefik.http.routers.whoami.tls=true"
      - "traefik.http.routers.whoami.tls.domains[0].main=*.home.200a.co.uk"
```

Enable TLS for our Plex service by adding `tls: {}` to our `http router` section and removing the `entryPoint`.

```
http:
  routers:
    route-to-plex-ip:
      rule: "Host(`plex.home.200a.co.uk`)"
      service: route-to-plex-ip-service
      entryPoints: websecure
      tls: {}
```      

## Demo of iDRAC Container

Spin up the iDRAC helpder container.

`vi idrac/docker-compose.yml`
```
version: '3'

services:
  idracweb:
    container_name: idracweb
    hostname: idracweb
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

Start up the container. Go to http://idracweb.home.200a.co.uk:5800

Oh no. Insecure, no logins!

Add TLS to idracweb: Modify docker-compose.yml...

```
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.idracweb.entryPoints=websecure"
      - "traefik.http.routers.idracweb.rule=Host(`idracweb.home.200a.co.uk`)"
      - "traefik.http.routers.idracweb.tls=true"
      - "traefik.http.routers.idracweb.tls.domains[0].main=*.home.200a.co.uk"

networks:
  default:
    external:
      name: demo_proxy
```

Finally let's add some basic auth...

```
htpasswd -nb user1 password1 >> user_creds
mv user_creds traefik/config/
vi traefik/docker-compose.yml add volume: - "./config/user_creds:/user_creds:ro"
vi idrac/docker-compose.yml add labels: - - "traefik.http.routers.idracweb.middlewares=auth-middlewares"
      - "traefik.http.middlewares.auth-middlewares.basicauth.usersfile=/user_creds"
```

Restart traefik and idrac.

## Tear down, clean-up

* Stop and remove contrainers.
* Move demo dir structure to a backup location
* `docker network rm demo_proxy`

