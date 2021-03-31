# IAM CONFIG

I want a directory service for authentication. Obviously AD is pretty much ubiquitous but results in needing bloaty Windows VMs... or does it?

Well, yes. I looked at OpenLDAP, FreeIPA and 389 Directory Server, and while all of them would probably do the trick, the amount of effort required to get them setup couple with the fact they aren't genuine AD kind of outweighs the resource expense.

At the risk of getting my spurs caught on the carpet, I went with a single 2016 VM acting as both an ADDS and Enterprise CA. This was simply so I could get LDAPS working even though it's totally the wrong way to go about it, it works fine for a lab.

### DC + CA STEPS

* Build a Win2016 Server (Standard Desktop Experience) VM image.
* Power on, name, IP, etc.
* Patch it and install Virtio drivers.
* Add DNS record to DNSmasq: `192.168.200.250 windc1.ad.200a.co.uk`
* Install AD.
  * Add roles/featres, AD DS
  * New Forest
  * Domain name is going to be `ad.200a.co.uk`
  * All default settings.
  * Setup DNS conditional forwarders for home.200a.co.uk and 200a.co.uk pointing to DNSmasq server 192.168.200.254.
* Install CA role
  * Enterprise CA
  * RootCA
  * Set algo and validity period as required
* Open MMC
  * Add Snap-In Certificate Templates
  * Click on Certificate Templates, Action
  * View Object Identifiers
  * Ensure Server Authentication is in the list of available OIDs.
  * Open MMC
  * Add Certificates snap-in, Computer Account
  * Open Personal > Certificates
  * Right Click Certificates folder > All Tasks > Request New Certificate
  * Next, next, tick Domain Controller, click Enroll, Finish
  * Run ldp.exe
  * Connect to DC hostname, port 636 tick SSL. It should show something like...
  
  ```
  supportedLDAPPolicies (20): MaxPoolThreads; MaxPercentDirSyncRequests; MaxDatagramRecv; MaxReceiveBuffer; InitRecvTimeout; MaxConnections; MaxConnIdleTime; MaxPageSize; MaxBatchReturnMessages; MaxQueryDuration; MaxDirSyncDuration; MaxTempTableSize; MaxResultSetSize; MinResultSets; MaxResultSetsPerConn; MaxNotificationPerConn; MaxValRange; MaxValRangeTransitive; ThreadMemoryLimit;   SystemMemoryLimitPercent; 
  supportedLDAPVersion (2): 3; 2; 
  supportedSASLMechanisms (4): GSSAPI; GSS-SPNEGO; EXTERNAL; DIGEST-MD5; 
  ```

* Shutdown the DC. Modify virtual hardware:
  * vCPU Current 2, Maximum 2
  * Memory Current 3072, Max 6144
  * If we need more memory because it's creaking while we try to do something we can use `virsh` to modify the settings on the fly apparently without needing downtime.

### MODIFY RAM ALLOCATION ONLINE

Some examples:

```
virsh # dominfo windc1
Id:             15
Name:           windc1
UUID:           5450c4c4-d016-46c8-8b9c-4404343a1d8f
OS Type:        hvm
State:          running
CPU(s):         2
CPU time:       102.6s
Max memory:     6291456 KiB
Used memory:    3145728 KiB
Persistent:     yes
Autostart:      enable
Managed save:   no
Security model: apparmor
Security DOI:   0
Security label: libvirt-5450c4c4-d016-46c8-8b9c-4404343a1d8f (enforcing)
```

Increase memory allocation to 4GB:
```
virsh # setmem windc1 4194304

virsh # dominfo windc1
Id:             15
Name:           windc1
...
Max memory:     6291456 KiB
Used memory:    4194304 KiB
...
```

Decrease allocation to 2GB:
```
virsh # setmem windc1 2097152

virsh # dominfo windc1
Id:             15
Name:           windc1
...
Max memory:     6291456 KiB
Used memory:    2097152 KiB
...
```


