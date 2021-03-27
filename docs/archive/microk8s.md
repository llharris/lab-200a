# MicroK8s HA Set-up Guide

Based on content provided here: https://microk8s.io/docs/high-availability

## Initial Setup

* 5 x Ubuntu 20.04 LTS VMs running on VMware Workstation
* Each has 2 vCPUs, 4GB of RAM and 50GB of hard disk space
* Each is a linked clone of a master VM image

## Basic Network Configuration

Each VM needs a static IP setting. This is done using netplan by creating a .yaml configuratio file like so:

`/etc/netplan/01-netcfg.yaml`
```
network:
  version: 2
  renderer: networkd
  ethernets:
    ens33:
      dhcp4: no
      addresses:
        - 192.168.200.22/24
      gateway4: 192.168.200.1
      nameservers:
        search:    [home.200a.co.uk]
        addresses: [192.168.200.254]
```

IP addresses allocate for the VMs are:

* microk8s-1: 192.168.200.22/24
* microk8s-2: 192.168.200.23/24
* microk8s-3: 192.168.200.24/24
* microk8s-4: 192.168.200.25/24
* microk8s-5: 192.168.200.26/24

Hostnames are set using `hostnamectl` as follows:

```
hostnamectl set-hostname --static microk8s-1 && hostnamectl set-hostname --transient microk8s-1
```

Substitute the relevant hostname on each VM, obvs. 

## Timesync Config

You're building a cluster so making sure they have synchronised time is important. Edit the file `/etc/systemd/timesyncd.conf` to contain the following lines:

```
[Time]
NTP=ntp.home.200a.co.uk
FallbackNTP=ntp.ubuntu.com
```
Then run `systemctl restart systemd-timesyncd` and check the output of `timedatectl` to ensure that the time is correct and that `NTP Service` is `active`.

## Install MicroK8s on First Node

On microk8s-1:
```
$ sudo snap install microk8s --classic --channel=1.19/stable
```
### Configure Permissions

```
sudo usermod -a -G microk8s llharris
sudo chown -f -R llharris ~/.kube
```
Log out and back in again, then run:
```
microk8s add-node
```
In the output of the command you will see something along the lines of:
```
From the node you wish to join to this cluster, run the following:
microk8s join 192.168.200.22:25000/dbca2049764bbd6e0a000299771bcdc8
```

## Install MicroK8s on additional nodes

On microk8s-2, 3, 4 etc.:
```
$ sudo snap install microk8s --classic --channel=1.19/stable
```
## Join Nodes to Cluster

You'll need the output of the `microk8s add-node` command you ran on the first node. Go through each additional node in turn. Re-run the `microk8s add-node` command on the initial node for each additional node you add.

### On each subsequent node...

* Login and run: `sudo usermod -a -G microk8s llharris` then `sudo chown -f -R llharris ~/.kube`
* Logout
* Log back in again.
* Run the command generated on the initial node by running `microk8s add-node` e.g.: `microk8s join 192.168.200.22:25000/dbca2049764bbd6e0a000299771bcdc8` 
* Wait for the operation to complete.
* Go back to the initial node and again run `microk8s add-node`, use the output for the nexe node addition repeating the above steps starting under the heading `On each subsequent node...`

## Checking Cluster Status

Once all nodes have been joined, you should be able to see a list of nodes with a `Ready` status after a few minutes:

```
llharris@microk8s-1:~$ microk8s kubectl get nodes
NAME         STATUS   ROLES    AGE     VERSION
microk8s-4   Ready    <none>   12m     v1.19.2-34+1b3fa60b402c1c
microk8s-1   Ready    <none>   63m     v1.19.2-34+1b3fa60b402c1c
microk8s-2   Ready    <none>   2m34s   v1.19.2-34+1b3fa60b402c1c
microk8s-3   Ready    <none>   16m     v1.19.2-34+1b3fa60b402c1c
microk8s-5   Ready    <none>   11m     v1.19.2-34+1b3fa60b402c1c
```

Running the command `microk8s status` should show:

```
microk8s is running
high-availability: yes
  datastore master nodes: 192.168.200.22:19001 192.168.200.24:19001 192.168.200.25:19001
  datastore standby nodes: 192.168.200.26:19001 192.168.200.23:19001
addons:
  enabled:
    ha-cluster           # Configure high availability on the current node
  disabled:
    ambassador           # Ambassador API Gateway and Ingress
    cilium               # SDN, fast with full network policy
    dashboard            # The Kubernetes dashboard
    dns                  # CoreDNS
    fluentd              # Elasticsearch-Fluentd-Kibana logging and monitoring
    gpu                  # Automatic enablement of Nvidia CUDA
    helm                 # Helm 2 - the package manager for Kubernetes
    helm3                # Helm 3 - Kubernetes package manager
    host-access          # Allow Pods connecting to Host services smoothly
    ingress              # Ingress controller for external access
    istio                # Core Istio service mesh services
    jaeger               # Kubernetes Jaeger operator with its simple config
    knative              # The Knative framework on Kubernetes.
    kubeflow             # Kubeflow for easy ML deployments
    linkerd              # Linkerd is a service mesh for Kubernetes and other frameworks
    metallb              # Loadbalancer for your Kubernetes cluster
    metrics-server       # K8s Metrics Server for API access to service metrics
    multus               # Multus CNI enables attaching multiple network interfaces to pods
    prometheus           # Prometheus operator for monitoring and logging
    rbac                 # Role-Based Access Control for authorisation
    registry             # Private image registry exposed on localhost:32000
    storage              # Storage class; allocates storage from host directory
```

...which is very nice. 

## Shutdown & Snapshot

Before we start fiddling with its guts, it might be a good idea to shutdown the VMs and take some snapshots just so we can quickly and easily get back to this point in time if we break something, which, we probably will.

## Accessing the Dashboard

MicroK8s provides a number of services as add-ons which can be enabled.

### Basic Dashboard Access without RBAC

```
microk8s enable dns
microk8s enable dashboard
token=$(microk8s kubectl -n kube-system get secret | grep default-token | cut -d " " -f1)
microk8s kubectl -n kube-system describe secret $token
```
Copy the token.
```
microk8s kubectl port-forward -n kube-system service/kubernetes-dashboard 10443:443 --address 0.0.0.0
```
Point browser at `https://microk8s-1.home.200a.co.uk:10443`

This will only work while the above `port-forward` command is running. As soon as you CTRL+C the command the port will no longer be forwarded and you won't be able to access the dashboard any longer.

### Permanent Dashboard Access

Expose the service on the same port on each node:

```
microk8s kubectl -n kube-system edit service kubernetes-dashboard
```
Service definition looks like...
```
apiVersion: v1
kind: Service
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"v1","kind":"Service","metadata":{"annotations":{},"labels":{"k8s-app":"kubernetes-dashboard"},"name":"kubernetes-dashboard","namespace":"kube-system"},"spec":{"ports":[{"port":443,"targetPort":8443}],"selector":{"k8s-app":"kubernetes-dashboard"}}}
  creationTimestamp: "2020-11-04T15:41:07Z"
  labels:
    k8s-app: kubernetes-dashboard
  name: kubernetes-dashboard
  namespace: kube-system
  resourceVersion: "16794"
  selfLink: /api/v1/namespaces/kube-system/services/kubernetes-dashboard
  uid: d1025313-1ae0-473b-8cce-4272b4b778d1
spec:
  clusterIP: 10.152.183.21
  ports:
  - port: 443
    protocol: TCP
    targetPort: 8443
  selector:
    k8s-app: kubernetes-dashboard
  sessionAffinity: None
  type: ClusterIP
status:
  loadBalancer: {}
```
Change it like so:

```
apiVersion: v1
kind: Service
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"v1","kind":"Service","metadata":{"annotations":{},"labels":{"k8s-app":"kubernetes-dashboard"},"name":"kubernetes-dashboard","namespace":"kube-system"},"spec":{"ports":[{"port":443,"targetPort":8443}],"selector":{"k8s-app":"kubernetes-dashboard"}}}
  creationTimestamp: "2020-11-04T15:41:07Z"
  labels:
    k8s-app: kubernetes-dashboard
  name: kubernetes-dashboard
  namespace: kube-system
  resourceVersion: "23827"
  selfLink: /api/v1/namespaces/kube-system/services/kubernetes-dashboard
  uid: d1025313-1ae0-473b-8cce-4272b4b778d1
spec:
  clusterIP: 10.152.183.21
  externalTrafficPolicy: Cluster
  ports:
  - nodePort: 32414
    port: 443
    protocol: TCP
    targetPort: 8443
  selector:
    k8s-app: kubernetes-dashboard
  sessionAffinity: None
  type: NodePort
status:
  loadBalancer: {}
```
The dashboard will now be available at any node IP on port 32414 via HTTPS. You will be prompted to authenticate, and for now we will need to use a token...
![K8S Dashboard Login](img/k8s-dashboard-login.png)

To obtain the token to use for authentication, we need to run the following on one of the nodes:

```
microk8s kubectl -n kube-system describe $(microk8s kubectl -n kube-system get secret -n kube-system -o name | grep namespace) | grep token:
token:      eyJhbGciOiJSUzI1NiIsImtpZCI6InlMeUpNYTdUUUEwclFhdXkwM0NtZzd5Mm9TMlEzb1RyXzI1bFZkZVRyRDQifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJuYW1lc3BhY2UtY29udHJvbGxlci10b2tlbi1nOTQ3MiIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50Lm5hbWUiOiJuYW1lc3BhY2UtY29udHJvbGxlciIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6IjFmYTYxMWZlLTBjYzItNGVhYS05ZDA2LTE5NGEzYjA4NmQ3YyIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDprdWJlLXN5c3RlbTpuYW1lc3BhY2UtY29udHJvbGxlciJ9.kn_VpK9SMuN6Xp7ZZpoNcz3ASXdono17p-XDhbFbEaV2DLjC3FypE2ZaLTi0wsT-mfppTYrKdQ9j2XR3wIiNhXGU0MMXs883xN4k8EiUQfcbO9CxeC8iFoEc8_QKuUzMW7RJwWbIDvpflqFL0MQS2sNl44oCf765GAzSdYlX-yrfvde0qiT3Ghdme0CB78nV0bV_ATbSSVGkTGgwtwF0FuW14l0v9qzmzjWU7bJIcCqBH9I6wBMi1-nLjFDmlGiNNMvz5QhWEECBNQVXhJApcU4txHIp3IOD3oSbhSFVNaJ-hgdNl2loEbO9-54A6bDE8h2qbypy4YNOjAZwXdCVcg
``` 
Copy and paste the token string into the field on the dashboard login page and click Sign-In.

