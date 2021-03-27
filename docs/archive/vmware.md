# VMware

For deploying more permanent workloads, I plan to use my Dell R710 server which is running ESXi 6.7. This document runs through the basic setup process following the ESXi installation.

## Configure DNS

Before we install the vCenter Server Appliance, we need to ensure that we have DNS records setup for the ESXi host and the VCSA and that forward and reverse name resolution is working.

Modify /etc/dnsmasq.conf on deskmini to make it look like this...

```
domain-needed
no-resolv
no-poll
server=1.1.1.1
server=1.0.0.1
no-hosts
local=/home.200a.co.uk/
addn-hosts=/etc/dnsmasq-hosts
expand-hosts
```

Next create /etc/dnsmasq-hosts and add entries for all the hosts we need to be able to resolve:

```
192.168.200.1   router.home.200a.co.uk
192.168.200.10  desktop.home.200a.co.uk
192.168.200.11  cclaptop.home.200a.co.uk
192.168.200.12  garage-laptop.home.200a.co.uk
192.168.200.13  lh-iphone-se.home.200a.co.uk
192.168.200.14  suresignal.home.200a.co.uk
192.168.200.15  tp-powerline.home.200a.co.uk
192.168.200.16  hue.home.200a.co.uk
192.168.200.17  bethans-iphone.home.200a.co.uk
192.168.200.18  dell-xps.home.200a.co.uk
192.168.200.19  bigesx.home.200a.co.uk r710.home.200a.co.uk
192.168.200.20  idrac.home.200a.co.uk
192.168.200.21  vcsa.home.200a.co.uk
192.168.200.50  ubuntu-vm.home.200a.co.uk whoami.home.200a.co.uk cups.home.200a.co.uk
192.168.200.254 deskmini.home.200a.co.uk
```

Restart dnsmasq: `systemctl restart dnsmasq`. Check that hosts can be resolved both forward and reverse.

## Configure NTP

We need a reliable network time source. deskmini is running a chronyd server. Check that it is reachable from another machine using `ntpdate`.

```
# ntpdate 192.168.200.254
28 Oct 12:02:06 ntpdate[33444]: adjust time server 192.168.200.254 offset 0.000161 sec
```

## Deploy VCSA

Nothing special going on here. VCSA with embedded PSC, Tiny with Thin Disk mode enabled and placed on the SSD disk datastore. Everything else is self-explanitory.
