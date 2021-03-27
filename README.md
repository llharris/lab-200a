# INTRO

This repo and documentation is for my personal lab environment. These are essentially my own notes and exist for my own benefit. If someone else happens to find them useful great, however, don't rely on them being complete, accurate or legible.

## CONTENTS

* [DNS Configuration](docs/dns.md)


## Overview

200a.co.uk is the name of my home lab based on the domain name it uses. I own the 200a.co.uk domain. The lab consists of a small home network that incorporates:

* An ASRock Deskmini A300 as an 'always-on' energy efficient server running CentOS 8.2.
* My main PC with lots of memory and storage for VMs.
* A Dell PowerEdge R710 server for more permanent workloads with local SSD and SAS storage, 12 cores and 192GB of RAM (also has a iDRAC)
* A whitebox Intel Xeon machine with 64GB of RAM and minimal (~256GB local storage), primary use is paperweight and dust magnet.
* Connectivity is through basic, unmanaged gigabit switches (no VLAN support) with DSL Router for Internet
* Linksys Velop Mesh Wifi
* Various other devices which connect to the network (phones, laptops, smart home stuff etc.)

## Subnets, VLANs and DNS Domain

There are no VLANs configured because the switch that does that is far too noisy for my office. The entire local network is contained within a single subnet; 192.168.200.0/24. The DNS domain for the network is `home.200a.co.uk`. 200a.co.uk is my registered domain name. Everything that has a wired connection goes into a pair of connected, un-managed 8-port gigabit switches. 

## Primary Services

It is important to be able to maintain Internet service for other devices on the network. Primarily this depends on the availability of DHCP and DNS to keep Wifi devices, smart TVs, Sonos Speakers and the like up and running so I don't get grief.

* DHCP - Is currently provided by the Fritz Box 3490 DSL Router. Most physical devices of consequence have DHCP reservations.
* DNS - Currently served by the Deskmini (192.168.200.254) via a local dnsmasq service.

## Secondary Services

Not as important, but still ideally kept up and running at all times:

* Network Printing (cups running on deskmini) using Samsung ML1510 via USB
* Avahi to support IPP printer discovery
* NTP Server (running on deskmini via chronyd)

## Tertiary Services

The following services are more for my convenience in managing the environment or for learning, experimentation and evaluating various technologies.

* Windows Server 2016 Std. VM - 192.168.200.250 / windc1.home.200a.co.uk
  * Main purpose is to provide LDAP/LDAPS.
* Ubuntu 20.04 LTS VM running Docker Engine - 192.168,200.50 / ubuntu-vm.home.200a.co.uk
  * Various containerised services

## Contents

* [Useful Notes & Links](docs/notes-and-links.md)
* [Certbot & Let's Encrypt](docs/certbot-le.md)
* [Traefik V2](docs/traefik_v2.md)
* [iDRAC6 via Docker](docs/idrac.md)
* [Certbot](docs/certbot.md)
* [Kubernetes](docs/kubernetes.md)
* [VMware](docs/vmware.md)
* [Ubuntu Network Config](docs/ubuntu-networking.md)

---

## Rough To-Do List

As of 27th Oct 2020

* Configure Guacamole docker containers on Ubuntu-VM
* Install Gitea container on Ubuntu-VM
* Configure Traefik to use Lets Encrypt certs for HTTPS
* Configure Traefik to use OAuth.
* Configure Traefik as reverse proxy for Gitea, Guacamole
* Install and configure Windows VM on deskmini for LDAPS
* Build on premise Kubernetes cluster
  * See these docs: https://github.com/SirSirae/kubernetes-docs, https://wiki.majomi.dev/books/raspberry-pi-4-cluster
* Setup Raspberry Pi (need to figure out what it'll be doing)
* Attach USB storage device to deskmini to take backups. Schedule regular backups.
* Install and investigate LENS
* Deploy Rancher
* Deploy VPN solution and firewall off access to a network on the R710.
* Deploy Autom8y components:
  * Hashicorp Vault Container
  * Hashicorp Terraform Container (look at Sentinel too)
  * Hashicorp Packer
  * Ansible/AWX
  * Jenkins & Spinnaker
  * AWS, GCP and Azure CLIs/SDKs
  * PowerShell Core
  * Configure Cockpit to use SSL certificates
  * Monitoring - Look at Prometheus, ELK Stack and Grafana
  * Look at Caddy 2 (as alternative to Traefik)
* Move the docker hosted container services to run on Kubernetes
* Documentation - Ongoing
