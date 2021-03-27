# Ubuntu Networking

Ubuntu from version 17 onwards utilises netplan for network configuration. Configuration is stored in .yaml files under /etc/netplan/. Highest numbered yaml file supersedes others. For example a default, fresh install will likely have a `00-installer-config.yaml` file that controls the default network config behaviour.

## Setting a static IP

To set a static IP on Ubuntu 18.04, 20.04 etc, create the file `/etc/netplan/01-netcfg.yaml` with the following contents:

```
network:
  version: 2
  renderer: networkd
  ethernets:
    ens33:
      dhcp4: no
      addresses:
        - 192.168.0.123/24
      gateway4: 192.168.0.254
      nameservers:
        search: [my.domain.com]
        addresses: [8.8.8.8, 1.1.1.1]
```

Obviously, you need to substitute `ens33` for your relevant network device along with the IPs, gateway address, and DNS search and nameserver IPs.

Run: `sudo netplan apply` this will apply the configuration.
