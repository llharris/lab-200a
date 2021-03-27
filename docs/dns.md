# DNS CONFIGURATION

deskmini (192.168.200.254) runs dnsmasq. Local domain is `200a.co.uk`, this is a legit domain managed by cloudflare.

dnsmasq uses an additional hosts file `/etc/dnsmasq-hosts` which containers ip/name mappings.

Because of how traefik proxies connections to most of the containerised services, the deskmini primary IP has an alias for each service.