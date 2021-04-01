# WORKFLOW

I want to be able to quickly and easily spin up environments for checking out products. To accomplish this, the deployments need to be automated. The issue is that I don't know what product(s) will be being deployed, so we don't know the requirements or the process to deploy them As such, what I'd like to get to is a point where I can at least automate all the common pre-requisite tasks. 

## BUILDING BLOCKS

The easiest approach will be to automate a series of building blocks which we can combine together in a pipeline as required to meet our needs.

- [ ] Isolated Network with router, firewall and DNS.
- [ ] Remote access, possibly routed through the firewall, maybe bastion.
- [ ] Directory service for authentication, LDAP/S
- [ ] Internet access for the devices inside the environment.
- 
.....

WORK IN PROGRESS>>>

### TEST ENVIRONMENT BUILDING BLOCKS

* RACADMIN power on Dell Server ESXi host.
  

