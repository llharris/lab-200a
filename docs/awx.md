# ANSIBLE AWX SETUP

Documentation can be found here: https://github.com/ansible/awx/blob/18.0.0/tools/docker-compose/README.md

## STEPS WHAT I GONE AND DID

```
cd ~
git clone -b 18.0.0 https://github.com/ansible/awx.git
cd awx
sed -e 's/tools/ansible/g' -i .env 
make docker-compose-build
```

What makes this hard to do, is that this darn-tootin' repo wants to build all the stuff itself including the compose file using ansible playbooks.

![YO DAWG!](img/ansible.jpg)

The next step is to run `make docker-compose` which brings up the containers among other things using the generated compose file. However, it tries to use port 8080 and that's already in use by Traefik.

The docker-compose.yml generated can be found under `~/awx/tools/docker-compose/_sources/docker-compose.yml`

I copied this to `/srv/lab/docker/awx/awx-compose.yml`. I also copied the contents of the original git repo under `~/awx` into `/srv/lab/docker/awx`

I modified `awx-compose.yml` setting absolute paths for all volumes and commenting out the ports I don't want exposed, specifically 8080, 8888, 8013 and 8043 and added the labels for traefik. Variables were set in `.env`...

```
awx-compose.yml 

services:
  awx_1:
    container_name: ansible_awx_1
      ...
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.awx.rule=Host(`awx.${MY_DOMAIN}`)"
        - "traefik.http.routers.awx.entrypoints=websecure"
        - "traefik.http.routers.awx.tls=true"
        - "traefik.http.routers.awx.service=awx"
        - "traefik.http.services.awx.loadbalancer.server.port=8013"
      ...
      volumes:
        - "${DOCKER_BASEDIR}/awx:/awx_devel"
        - "${DOCKER_BASEDIR}/awx/tools/docker-compose/supervisor.conf:/etc/supervisord.conf"
        - "${DOCKER_BASEDIR}/awx/tools/docker-compose/_sources/database.py:/etc/tower/conf.d/database.py"
        - "${DOCKER_BASEDIR}/awx/tools/docker-compose/_sources/websocket_secret.py:/etc/tower/conf.d/websocket_secret.py"
        - "${DOCKER_BASEDIR}/awx/tools/docker-compose/_sources/local_settings.py:/etc/tower/conf.d/local_settings.py"
        - "${DOCKER_BASEDIR}/awx/tools/docker-compose/_sources/SECRET_KEY:/etc/tower/SECRET_KEY"
        - "${DOCKER_BASEDIR}/awx/tools/docker-compose/receptor.conf:/etc/receptor/receptor.conf"
        - "/sys/fs/cgroup:/sys/fs/cgroup"
        - "~/.kube/config:/var/lib/awx/.kube/config"
        - "redis_socket_1:/var/run/redis/:rw"
        - "receptor_1:/var/run/receptor/"
      privileged: true
      tty: true
      ports:
        - "7899-7999:7899-7999"  # sdb-listen
        - "6899:6899"
        #- "8080:8080"  # unused but mapped for debugging
        #- "8888:8888"  # jupyter notebook
        #- "8013:8013"  # http
        #- "8043:8043"  # https
    redis_1:
      image: redis:latest
      container_name: ansible_redis_1
      volumes:
        - "${DOCKER_BASEDIR}/awx/tools/redis/redis.conf:/usr/local/etc/redis/redis.conf"
        - "redis_socket_1:/var/run/redis/:rw"
      ...
```    
Next run: 

```
docker exec ansible_awx_1 make clean-ui ui-release
docker exec -ti ansible_awx_1 awx-manage createsuperuser
docker exec ansible_awx_1 awx-manage create_preload_data
```

Somehow, this worked.
