# LET'S ENCRYPT, SHALL WE?

* Download acme.sh
* Create .cfenv and populate CF_Key with Global API Key and CF_Email
* `. .cfenv`
* `./acme.sh --issue -d 'domain' -d 'another.domain' --dns dns_cf --test`
* Omit `--test` when working to get a production cert.

## vCenter Certificates

```
root@vcsa7 [ ~ ]# /usr/lib/vmware-vmca/bin/certificate-manager
                 _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
                |                                                                     |
                |      *** Welcome to the vSphere 6.8 Certificate Manager  ***        |
                |                                                                     |
                |                   -- Select Operation --                            |
                |                                                                     |
                |      1. Replace Machine SSL certificate with Custom Certificate     |
                |                                                                     |
                |      2. Replace VMCA Root certificate with Custom Signing           |
                |         Certificate and replace all Certificates                    |
                |                                                                     |
                |      3. Replace Machine SSL certificate with VMCA Certificate       |
                |                                                                     |
                |      4. Regenerate a new VMCA Root Certificate and                  |
                |         replace all certificates                                    |
                |                                                                     |
                |      5. Replace Solution user certificates with                     |
                |         Custom Certificate                                          |
                |         NOTE: Solution user certs will be deprecated in a future    |
                |         release of vCenter. Refer to release notes for more details.|
                |                                                                     |
                |      6. Replace Solution user certificates with VMCA certificates   |
                |                                                                     |
                |      7. Revert last performed operation by re-publishing old        |
                |         certificates                                                |
                |                                                                     |
                |      8. Reset all Certificates                                      |
                |_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _|
Note : Use Ctrl-D to exit.
Option[1 to 8]: 1

Please provide valid SSO and VC privileged user credential to perform certificate operations.
Enter username [Administrator@vsphere.local]:
Enter password:
         1. Generate Certificate Signing Request(s) and Key(s) for Machine SSL certificate

         2. Import custom certificate(s) and key(s) to replace existing Machine SSL certificate

Option [1 or 2]: 2

Please provide valid custom certificate for Machine SSL.
File : /root/vcsa7.200a.co.uk.cer

Please provide valid custom key for Machine SSL.
File : /root/vcsa7.200a.co.uk.key

Please provide the signing certificate of the Machine SSL certificate
File : /root/fullchain.cer

You are going to replace Machine SSL cert using custom cert
Continue operation : Option[Y/N] ? : y
Command Output: /root/vcsa7.200a.co.uk.cer: OK

Get site nameCompleted [Replacing Machine SSL Cert...]
default-site
Lookup all services
Get service default-site:e8d8c736-b2d9-4316-9336-069a92741373
```