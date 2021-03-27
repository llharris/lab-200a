# K3S by Rancher

K3S is a lightweight Kubernetes distribution, good for experimentation, learning and development. It'll run easily on your laptop. The following basic installation is for a non-HA control-plane (single etcd/master node).

## Installation (Basic)

* Have a VM
* Run `curl -sfL https://get.ks3.io | sh -`
* Check service status `systemctl status k3s`

## Post Instllation Check

```
$ sudo k3s kubectl get nodes
NAME    STATUS   ROLES         AGE   VERSION
k3s-1   Ready    etcd,master   13h   v1.19.3+k3s3
```

## Add Workers

* Have another couple of VMs
* Get the `node-token` from the master: `sudo cat /var/lib/rancher/k3s/server/node-token`
* It's not clear from the documentation, but you want the section after `server:`
* Run `curl -sfL https://get.k3s.io | K3S_URL=https://master-node:6443 K3S_TOKEN=node-token sh -`

#### Example

```
sudo -s
# curl -sfL https://get.k3s.io | K3S_URL=https://k3s-1.home.200a.co.uk:6443 K3S_TOKEN=93168df10da92acba8d0603690eb8c4d sh -
```

## Get Nodes

From the master, run `kubectl get nodes`. You should see something like this:

```
# kubectl get nodes
NAME    STATUS   ROLES         AGE   VERSION
k3s-1   Ready    etcd,master   13h   v1.19.3+k3s3
k3s-2   Ready    <none>        6s    v1.19.3+k3s3
```

## Troubleshooting

If anything goes wrong, you can run: `/usr/local/bin/k3s-uninstall.sh` on the node in question to get back to a clean state. Double check your commands. Make sure you haven't specified variable names as `KS3` instead of `K3S` ahem.

## Kubernetes Dashboard

```
GITHUB_URL=https://github.com/kubernetes/dashboard/releases
VERSION_KUBE_DASHBOARD=$(curl -w '%{url_effective}' -I -L -s -S ${GITHUB_URL}/latest -o /dev/null | sed -e 's|.*/||')
k3s kubectl create -f https://raw.githubusercontent.com/kubernetes/dashboard/${VERSION_KUBE_DASHBOARD}/aio/deploy/recommended.yaml
```
## Allowing Remote Access to the Dashboard

```
kubectl -n kubernetes-dashboard edit service kubernetes-dashboard
```
Change `type: ClusterIP` to `type: NodePort`

```
kubectl -n kubernetes-dashboard get svc
NAME                        TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)         AGE
dashboard-metrics-scraper   ClusterIP   10.43.22.180    <none>        8000/TCP        60m
kubernetes-dashboard        NodePort    10.43.107.137   <none>        443:31568/TCP   60m
```

Go to https://<your-master-ip>:31568 (or whatever Port is specified in the output of `kubectl ... get svc`. Use the token retrieved earlier to login.

## Persistent Storage with Longhorn

### Pre-requisites

* iSCSI Tools - Ubuntu `apt-get install open-iscsi -y` / RHEL/CentOS `yum/dnf install icsci-initiator-utils -y`

### Install with Helm

```
snap install helm --classic
helm version



k3s kubectl -n kubernetes-dashboard describe secret admin-user-token | grep ^token


