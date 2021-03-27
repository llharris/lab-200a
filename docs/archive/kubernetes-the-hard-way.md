# Kubernetes the Hard Way

## Prerequisites

* A linux VM to install client tools and SDKs. I'm using Ubuntu 20.04.
* A windows machine because reasons.

### (Optional) Install LENS
* Go to https://k8slens.dev and download the LENS IDE. Or click this link to go direct to the download on github: https://github.com/lensapp/lens/releases/download/v3.6.7/Lens-Setup-3.6.7.exe

### Install Google Cloud SDK

* `sudo snap install google-cloud-sdk --classic`
* Check that the versio is above 301.0.0: `gcloud version`
* Run: `gcloud init`
```
Welcome! This command will take you through the configuration of gcloud.

Your current configuration has been set to: [default]

You can skip diagnostics next time by using the following flag:
  gcloud init --skip-diagnostics

Network diagnostic detects and fixes local network connection issues.
Checking network connection...done.
Reachability Check passed.
Network diagnostic passed (1/1 checks passed).

You must log in to continue. Would you like to log in (Y/n)?  y

Go to the following link in your browser:

    https://accounts.google.com/o/oauth2/auth?redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob&access_type=offline&prompt=select_account&code_challenge=cEat6bHTnCJkGkx2RGKIKZ9-e7Q35s00bHqvDDClK1Y&response_type=code&client_id=32555940559.apps.googleusercontent.com&code_challenge_method=S256&scope=openid+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcloud-platform+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fappengine.admin+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcompute+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Faccounts.reauth


Enter verification code: 4/5wHBMJirbM0zQ0RJA4VVM2t1cZu-U8KNvI5cNiRIqnHPmfP5KyFPPsQ
```
Answer the rest of the questions; pick a default project or create one and set the default region and zone as us-west1-c (12).

### (Optional) Enable Command Completion for gcloud

I recommend doing this so you don't want to shoot yourself after the first ten minutes. If you installed the google-cloud-sdk on Ubuntu via snap it should already have the `beta` component enabled. Run: `gcloud components list` to check. If it is enabled, you can instead of running individual `gcloud` commands instead run them from within an interactive shell by typing: `gcloud beta interactive`. This will put you into a gcloud shell from where you can run the rest of the gcloud command.

## Installing client tools

* On the Linux VM do the following:
```
wget -q --show-progress --https-only --timestamping \
  https://storage.googleapis.com/kubernetes-the-hard-way/cfssl/1.4.1/linux/cfssl \
  https://storage.googleapis.com/kubernetes-the-hard-way/cfssl/1.4.1/linux/cfssljson
chmod +x cfssl*
sudo mv cfssl* /usr/local/bin/
```
* Check versions: `cfssl version` and `cfssljson --version`
* Install kubectl: `wget https://storage.googleapis.com/kubernetes-release/release/v1.18.6/bin/linux/amd64/kubectl`
* `chmod +x kubectl && sudo mv kubectl /usr/local/bin`
* Check kubectl version: `kubectl version --client`

## Provision Compute Resources

### Create Virtual Private Cloud Network

```
gcloud compute networks create kubernetes-the-hard-way --subnet-mode custom
gcloud compute networks subnets create kubernetes --network kubernetes-the-hard-way --range 10.240.0.0/24
```
### Configure Firewall Rules
```
gcloud compute firewall-rules create kubernetes-the-hard-way-allow-internal --allow tcp,udp,icmp --network kubernetes-the-hard-way --source-ranges 10.240.0.0/24,10.200.0.0/16
```
Allow external access from just my Internet IP:
```
gcloud compute firewall-rules create kubernetes-the-hard-way-allow-external --allow tcp:22,tcp:6443,icmp --network kubernetes-the-hard-way --source-ranges 82.71.20.111/32
```
You can make life easier by specifying `--source-ranges 0.0.0.0/0`

Check out the firewall rules you've created by running:
```
gcloud compute firewall-rules list --filter="network:kubernetes-the-hard-way"
```
### Allocate a Public IP Address
```
gcloud compute addresses create kubernetes-the-hard-way --region $(gcloud config get-value compute/region)
gcloud compute addresses list --filter="name('kubernetes-the-hard-way')"
```
Output:
```
NAME                     ADDRESS/RANGE  TYPE      PURPOSE  NETWORK  REGION    SUBNET  STATUS
kubernetes-the-hard-way  34.82.32.125   EXTERNAL                    us-west1          RESERVED
```
### Compute Instances

#### Kubernetes Controllers

Don't try to run the following command from an interactive gcloud shell.

```
$ for i in 0 1 2
> do
> gcloud compute instances create controller-${i} \
> --async \
> --boot-disk-size 200GB \
> --can-ip-forward \
> --image-family ubuntu-2004-lts \
> --image-project ubuntu-os-cloud \
> --machine-type e2-standard-2 \
> --private-network-ip 10.240.0.1${i} \
> --scopes compute-rw,storage-ro,service-management,service-control,logging-write,monitoring \
> --subnet kubernetes \
> --tags kubernetes-the-hard-way,controller
> done
```

#### Kubernetes Workers

```
$ for i in 0 1 2
> do
> gcloud compute instances create worker-${i} \
> --async \
> --boot-disk-size 200GB \
> --can-ip-forward \
> --image-family ubuntu-2004-lts \
> --image-project ubuntu-os-cloud \
> --machine-type e2-standard-2 \
> --metadata pod-cidr=10.200.${i}.0/24 \
> --private-network-ip 10.240.0.2${i} \
> --scopes compute-rw,storage-ro,service-management,service-control,logging-write,monitoring \
> --subnet kubernetes \
> --tags kubernetes-the-hard-way,worker
> done
```

#### Verify Compute Instances

```
gcloud compute instances list --filter="tags.items=kubernetes-the-hard-way"

NAME          ZONE        MACHINE_TYPE   PREEMPTIBLE  INTERNAL_IP  EXTERNAL_IP     STATUS
controller-0  us-west1-c  e2-standard-2               10.240.0.10  35.197.64.188   RUNNING
controller-1  us-west1-c  e2-standard-2               10.240.0.11  34.105.84.47    RUNNING
controller-2  us-west1-c  e2-standard-2               10.240.0.12  35.233.165.26   RUNNING
worker-0      us-west1-c  e2-standard-2               10.240.0.20  34.82.154.97    RUNNING
worker-1      us-west1-c  e2-standard-2               10.240.0.21  35.230.64.22    RUNNING
worker-2      us-west1-c  e2-standard-2               10.240.0.22  35.227.138.192  RUNNING
```

Woo and indeed, yay!

Finally, check access via SSH:

```
gcloud compute ssh controller-0
```

## Provisioning CA and Generating TLS Certs

Everyone's favourite topic :|

### Certificate Authority

On your Linux VM where you install cfssl and cfssljson run:

```
{

cat > ca-config.json <<EOF
{
  "signing": {
    "default": {
      "expiry": "8760h"
    },
    "profiles": {
      "kubernetes": {
        "usages": ["signing", "key encipherment", "server auth", "client auth"],
        "expiry": "8760h"
      }
    }
  }
}
EOF

cat > ca-csr.json <<EOF
{
  "CN": "Kubernetes",
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "US",
      "L": "Portland",
      "O": "Kubernetes",
      "OU": "CA",
      "ST": "Oregon"
    }
  ]
}
EOF

cfssl gencert -initca ca-csr.json | cfssljson -bare ca

}
```

You will find you now have the ca-config.json, ca-csr.json along with the generated ca-key.pem and ca.pem.

### Admin Client Certificate

```
{

cat > admin-csr.json <<EOF
{
  "CN": "admin",
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "US",
      "L": "Portland",
      "O": "system:masters",
      "OU": "Kubernetes The Hard Way",
      "ST": "Oregon"
    }
  ]
}
EOF

cfssl gencert \
  -ca=ca.pem \
  -ca-key=ca-key.pem \
  -config=ca-config.json \
  -profile=kubernetes \
  admin-csr.json | cfssljson -bare admin

}
```

### Kubele Client Certs

```
for instance in worker-0 worker-1 worker-2; do
cat > ${instance}-csr.json <<EOF
{
  "CN": "system:node:${instance}",
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "US",
      "L": "Portland",
      "O": "system:nodes",
      "OU": "Kubernetes The Hard Way",
      "ST": "Oregon"
    }
  ]
}
EOF

EXTERNAL_IP=$(gcloud compute instances describe ${instance} \
  --format 'value(networkInterfaces[0].accessConfigs[0].natIP)')

INTERNAL_IP=$(gcloud compute instances describe ${instance} \
  --format 'value(networkInterfaces[0].networkIP)')

cfssl gencert \
  -ca=ca.pem \
  -ca-key=ca-key.pem \
  -config=ca-config.json \
  -hostname=${instance},${EXTERNAL_IP},${INTERNAL_IP} \
  -profile=kubernetes \
  ${instance}-csr.json | cfssljson -bare ${instance}
done
```

### Controller Manager Client Certs

```
{

cat > kube-controller-manager-csr.json <<EOF
{
  "CN": "system:kube-controller-manager",
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "US",
      "L": "Portland",
      "O": "system:kube-controller-manager",
      "OU": "Kubernetes The Hard Way",
      "ST": "Oregon"
    }
  ]
}
EOF

cfssl gencert \
  -ca=ca.pem \
  -ca-key=ca-key.pem \
  -config=ca-config.json \
  -profile=kubernetes \
  kube-controller-manager-csr.json | cfssljson -bare kube-controller-manager

}
```

### Kube Proxy Client Cert

```
{

cat > kube-proxy-csr.json <<EOF
{
  "CN": "system:kube-proxy",
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "US",
      "L": "Portland",
      "O": "system:node-proxier",
      "OU": "Kubernetes The Hard Way",
      "ST": "Oregon"
    }
  ]
}
EOF

cfssl gencert \
  -ca=ca.pem \
  -ca-key=ca-key.pem \
  -config=ca-config.json \
  -profile=kubernetes \
  kube-proxy-csr.json | cfssljson -bare kube-proxy

}
```

### Scheduler Client Cert

```
{

cat > kube-scheduler-csr.json <<EOF
{
  "CN": "system:kube-scheduler",
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "US",
      "L": "Portland",
      "O": "system:kube-scheduler",
      "OU": "Kubernetes The Hard Way",
      "ST": "Oregon"
    }
  ]
}
EOF

cfssl gencert \
  -ca=ca.pem \
  -ca-key=ca-key.pem \
  -config=ca-config.json \
  -profile=kubernetes \
  kube-scheduler-csr.json | cfssljson -bare kube-scheduler

}
```

### API Server Cert

```
{

KUBERNETES_PUBLIC_ADDRESS=$(gcloud compute addresses describe kubernetes-the-hard-way \
  --region $(gcloud config get-value compute/region) \
  --format 'value(address)')

KUBERNETES_HOSTNAMES=kubernetes,kubernetes.default,kubernetes.default.svc,kubernetes.default.svc.cluster,kubernetes.svc.cluster.local

cat > kubernetes-csr.json <<EOF
{
  "CN": "kubernetes",
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "US",
      "L": "Portland",
      "O": "Kubernetes",
      "OU": "Kubernetes The Hard Way",
      "ST": "Oregon"
    }
  ]
}
EOF

cfssl gencert \
  -ca=ca.pem \
  -ca-key=ca-key.pem \
  -config=ca-config.json \
  -hostname=10.32.0.1,10.240.0.10,10.240.0.11,10.240.0.12,${KUBERNETES_PUBLIC_ADDRESS},127.0.0.1,${KUBERNETES_HOSTNAMES} \
  -profile=kubernetes \
  kubernetes-csr.json | cfssljson -bare kubernetes

}
```

### Service Account Key Pair

```
{

cat > service-account-csr.json <<EOF
{
  "CN": "service-accounts",
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "US",
      "L": "Portland",
      "O": "Kubernetes",
      "OU": "Kubernetes The Hard Way",
      "ST": "Oregon"
    }
  ]
}
EOF

cfssl gencert \
  -ca=ca.pem \
  -ca-key=ca-key.pem \
  -config=ca-config.json \
  -profile=kubernetes \
  service-account-csr.json | cfssljson -bare service-account

}
```

### Verify Certs

You should now have a whole shed load of certs and keys etc in your current directory:

```
-rw-rw-r--+ 1 llharris llharris  231 Nov  5 10:04 admin-csr.json
-rw-------+ 1 llharris llharris 1675 Nov  5 10:04 admin-key.pem
-rw-r--r--+ 1 llharris llharris 1033 Nov  5 10:04 admin.csr
-rw-rw-r--+ 1 llharris llharris 1428 Nov  5 10:04 admin.pem
-rw-rw-r--+ 1 llharris llharris  232 Nov  5 09:52 ca-config.json
-rw-rw-r--+ 1 llharris llharris  211 Nov  5 09:52 ca-csr.json
-rw-------+ 1 llharris llharris 1679 Nov  5 09:52 ca-key.pem
-rw-r--r--+ 1 llharris llharris 1005 Nov  5 09:52 ca.csr
-rw-rw-r--+ 1 llharris llharris 1318 Nov  5 09:52 ca.pem
-rw-rw-r--+ 1 llharris llharris  272 Nov  5 10:07 kube-controller-manager-csr.json
-rw-------+ 1 llharris llharris 1679 Nov  5 10:07 kube-controller-manager-key.pem
-rw-r--r--+ 1 llharris llharris 1090 Nov  5 10:07 kube-controller-manager.csr
-rw-rw-r--+ 1 llharris llharris 1484 Nov  5 10:07 kube-controller-manager.pem
-rw-rw-r--+ 1 llharris llharris  248 Nov  5 10:08 kube-proxy-csr.json
-rw-------+ 1 llharris llharris 1675 Nov  5 10:08 kube-proxy-key.pem
-rw-r--r--+ 1 llharris llharris 1058 Nov  5 10:08 kube-proxy.csr
-rw-rw-r--+ 1 llharris llharris 1452 Nov  5 10:08 kube-proxy.pem
-rw-rw-r--+ 1 llharris llharris  254 Nov  5 10:08 kube-scheduler-csr.json
-rw-------+ 1 llharris llharris 1679 Nov  5 10:08 kube-scheduler-key.pem
-rw-r--r--+ 1 llharris llharris 1066 Nov  5 10:08 kube-scheduler.csr
-rw-rw-r--+ 1 llharris llharris 1460 Nov  5 10:08 kube-scheduler.pem
-rw-rw-r--+ 1 llharris llharris  232 Nov  5 10:08 kubernetes-csr.json
-rw-------+ 1 llharris llharris 1675 Nov  5 10:08 kubernetes-key.pem
-rw-r--r--+ 1 llharris llharris 1289 Nov  5 10:08 kubernetes.csr
-rw-rw-r--+ 1 llharris llharris 1663 Nov  5 10:08 kubernetes.pem
-rw-rw-r--+ 1 llharris llharris  238 Nov  5 10:09 service-account-csr.json
-rw-------+ 1 llharris llharris 1675 Nov  5 10:09 service-account-key.pem
-rw-r--r--+ 1 llharris llharris 1041 Nov  5 10:09 service-account.csr
-rw-rw-r--+ 1 llharris llharris 1440 Nov  5 10:09 service-account.pem
-rw-rw-r--+ 1 llharris llharris  244 Nov  5 10:07 worker-0-csr.json
-rw-------+ 1 llharris llharris 1679 Nov  5 10:07 worker-0-key.pem
-rw-r--r--+ 1 llharris llharris 1119 Nov  5 10:07 worker-0.csr
-rw-rw-r--+ 1 llharris llharris 1493 Nov  5 10:07 worker-0.pem
-rw-rw-r--+ 1 llharris llharris  244 Nov  5 10:07 worker-1-csr.json
-rw-------+ 1 llharris llharris 1675 Nov  5 10:07 worker-1-key.pem
-rw-r--r--+ 1 llharris llharris 1119 Nov  5 10:07 worker-1.csr
-rw-rw-r--+ 1 llharris llharris 1493 Nov  5 10:07 worker-1.pem
-rw-rw-r--+ 1 llharris llharris  244 Nov  5 10:07 worker-2-csr.json
-rw-------+ 1 llharris llharris 1675 Nov  5 10:07 worker-2-key.pem
-rw-r--r--+ 1 llharris llharris 1119 Nov  5 10:07 worker-2.csr
-rw-rw-r--+ 1 llharris llharris 1493 Nov  5 10:07 worker-2.pem
```

### Distribute the Client and Server Certs

Copy the relevant certs and keys to each worker instance:

```
$ for instance in worker-0 worker-1 worker-2
> do
> gcloud compute scp ca.pem ${instance}-key.pem ${instance}.pem ${instance}:~/
> done
```

Copy the relevant certs and keys to the controllers:

```
$ for instance in controller-0 controller-1 controller-2
> do
> gcloud compute scp ca.pem ca-key.pem kubernetes-key.pem kubernetes.pem service-account-key.pem service-account.pem ${instance}:~/
> done
```

## Generating Kubernetes Configuration Files for Authentication

### Client Auth Configs

Run the command:

```
gcloud compute addresses describe kubernetes-the-hard-way --region $(gcloud config get-value compute/region) --format 'value(address)'
```

This will let you see what the external static IP assigned to the load balancer. To assign the value directly to a variable re-run the command like this:

```
KUBERNETES_PUBLIC_ADDRESS=$(gcloud compute addresses describe kubernetes-the-hard-way --region $(gcloud config get-value compute/region) --format 'value(address)')
```
Check that the IP was properly assigned to the variable as follows: `echo $KUBERNETES_PUBLIC_ADDRESS`

### Generate a kubeconfig for each worker node

```
for instance in worker-0 worker-1 worker-2; do
  kubectl config set-cluster kubernetes-the-hard-way \
    --certificate-authority=ca.pem \
    --embed-certs=true \
    --server=https://${KUBERNETES_PUBLIC_ADDRESS}:6443 \
    --kubeconfig=${instance}.kubeconfig

  kubectl config set-credentials system:node:${instance} \
    --client-certificate=${instance}.pem \
    --client-key=${instance}-key.pem \
    --embed-certs=true \
    --kubeconfig=${instance}.kubeconfig

  kubectl config set-context default \
    --cluster=kubernetes-the-hard-way \
    --user=system:node:${instance} \
    --kubeconfig=${instance}.kubeconfig

  kubectl config use-context default --kubeconfig=${instance}.kubeconfig
done
```

This should generate three files:

```
$ ls -l *kubecon*
-rw-------+ 1 llharris llharris 6386 Nov  5 10:19 worker-0.kubeconfig
-rw-------+ 1 llharris llharris 6382 Nov  5 10:19 worker-1.kubeconfig
-rw-------+ 1 llharris llharris 6382 Nov  5 10:19 worker-2.kubeconfig
```

### Generate a kubeconfig for the kube-proxy service

```
{
  kubectl config set-cluster kubernetes-the-hard-way \
    --certificate-authority=ca.pem \
    --embed-certs=true \
    --server=https://${KUBERNETES_PUBLIC_ADDRESS}:6443 \
    --kubeconfig=kube-proxy.kubeconfig

  kubectl config set-credentials system:kube-proxy \
    --client-certificate=kube-proxy.pem \
    --client-key=kube-proxy-key.pem \
    --embed-certs=true \
    --kubeconfig=kube-proxy.kubeconfig

  kubectl config set-context default \
    --cluster=kubernetes-the-hard-way \
    --user=system:kube-proxy \
    --kubeconfig=kube-proxy.kubeconfig

  kubectl config use-context default --kubeconfig=kube-proxy.kubeconfig
}
``` 

This should generate `kube-proxy.kubeconfig`

### Generate a kubeconfig for the kube-controller-manager service

```
{
  kubectl config set-cluster kubernetes-the-hard-way \
    --certificate-authority=ca.pem \
    --embed-certs=true \
    --server=https://127.0.0.1:6443 \
    --kubeconfig=kube-controller-manager.kubeconfig

  kubectl config set-credentials system:kube-controller-manager \
    --client-certificate=kube-controller-manager.pem \
    --client-key=kube-controller-manager-key.pem \
    --embed-certs=true \
    --kubeconfig=kube-controller-manager.kubeconfig

  kubectl config set-context default \
    --cluster=kubernetes-the-hard-way \
    --user=system:kube-controller-manager \
    --kubeconfig=kube-controller-manager.kubeconfig

  kubectl config use-context default --kubeconfig=kube-controller-manager.kubeconfig
}
```

This should create: `kube-controller-manager.kubeconfig`

### Generate a kubeconfig for the kube-scheduler service

```
{
  kubectl config set-cluster kubernetes-the-hard-way \
    --certificate-authority=ca.pem \
    --embed-certs=true \
    --server=https://127.0.0.1:6443 \
    --kubeconfig=kube-scheduler.kubeconfig

  kubectl config set-credentials system:kube-scheduler \
    --client-certificate=kube-scheduler.pem \
    --client-key=kube-scheduler-key.pem \
    --embed-certs=true \
    --kubeconfig=kube-scheduler.kubeconfig

  kubectl config set-context default \
    --cluster=kubernetes-the-hard-way \
    --user=system:kube-scheduler \
    --kubeconfig=kube-scheduler.kubeconfig

  kubectl config use-context default --kubeconfig=kube-scheduler.kubeconfig
}
```
This should create `kube-scheduler.kubeconfig`

### Generate a kubeconfig for the admin user

```
{
  kubectl config set-cluster kubernetes-the-hard-way \
    --certificate-authority=ca.pem \
    --embed-certs=true \
    --server=https://127.0.0.1:6443 \
    --kubeconfig=admin.kubeconfig

  kubectl config set-credentials admin \
    --client-certificate=admin.pem \
    --client-key=admin-key.pem \
    --embed-certs=true \
    --kubeconfig=admin.kubeconfig

  kubectl config set-context default \
    --cluster=kubernetes-the-hard-way \
    --user=admin \
    --kubeconfig=admin.kubeconfig

  kubectl config use-context default --kubeconfig=admin.kubeconfig
}
```

This should generate `admin.kubeconfig`

### Distribute the Kubernetes Config Files

```
$ for instance in worker-0 worker-1 worker-2
> do
> gcloud compute scp ${instance}.kubeconfig kube-proxy.kubeconfig ${instance}:~/
> done
```

```
$ for instance in controller-0 controller-1 controller-2
> do
> gcloud compute scp admin.kubeconfig kube-controller-manager.kubeconfig kube-scheduler.kubeconfig ${instance}:~/
> done
```

## Generating the data encryption config and key

The encryption key and config is used by Kubernetes for encrypting secrets in which various data is stored.

### Generate the key

``` 
