# INTRO

This repo and documentation is for my personal lab environment. These are essentially my own notes and exist for my own benefit. If someone else happens to find them useful great, however, don't rely on them being complete, accurate or legible.

## CONTENTS

* [DNS Configuration](docs/dns.md)
* [Git Mirror Config](docs/git-mirror.md)
* [Firewall Config](docs/ufw.md)
* [Observability](docs/obs.md)
* [IAM](docs/iam.md)
* [Todo List](docs/todo.md)

## OVERVIEW

The lab consists of an ASRock Deskmini A300 which running Ubuntu Server 20.04 LTS. This machine is always on and provides the core services for the local network and the lab environment. Deskmini runs dnsmasq which provides name resolution for clients on the network. Internet connection is via a DSL Router which has DHCP enabled. DHCP configuration points to deskmini for DNS.

The intention is that deskmini runs all the things that are fairly static and stable. These are all of the services required to automate the rest of the lab. The idea is that the tools provided by deskmini are able to be used to spin up new environments on demand which will run either on a Dell R710 running ESXi, or on my PC running VMware Workstation or any other nested hypervisor running either on top of ESXi or VMware Workstation. They could also be run in a public cloud if I'm feeling particularly flush. Sounds good right...

### SERVICES UP AND RUNNING

Where possible, all services running on deskmini are run as containers under docker. The main exception to that rule is DNSmasq and MariaDB which run directly on the host. In addition, deskmini also runs libvirt for VMs.

* [Heimdall](https://heimdall.200a.co.uk) - A pretty dashboard for organising links. 
* [Traefik](https://traefik.200a.co.uk) - Proxies connections and handles TLS termination for most other services.
* [Portainer](https://portainer.200a.co.uk) - Web based container management.
* [iDRAC6](https://idracweb.200a.co.uk) - Client for old iDRAC 6 so I don't have to try to install JRE 1.6 on my computer.
* [Sonatype Nexus3 OSS](https://nexus.200a.co.uk) - Artifact repository.
* [Hashicorp Vault](https://vault.200a.co.uk) - Secrets management.
* [LibreSpeed](https://speed.200a.co.uk) - Internet speed test.
* [Jenkins](https://jenkins.200a.co.uk) - CI/CD stuff.
* [GitLab EE](https://gitlab.200a.co.uk) - Git SCM. A bit bloaty. Also runs a container registry.
* [Mattermost](https://mattermost.200a.co.uk) - Comes as part of Git. Collaboration tool.
* [Guacamole](https://guac.200a.co.uk) - Clientless remote desktop gateway. Access VNC, RDP, SSH via HTML5.

### SERVICES PLANNED OR WORK IN PROGRESS

* [AWX](https://awx.200a.co.uk) - Free Red Hat Tower.
* Sonarqube - Code scanning.
* Minio - S3 Compatible Object Storage.
* RocketChat - OpenSource Slack-a-like.
* Rancher - Container platform management.
* LDAP - Not sure whether to go through the pain of deploying Active Directory or something else...


