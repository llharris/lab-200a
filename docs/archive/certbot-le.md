# Certbot

Cerbot is a utility for managing certificates from Let's Encrypt. It can automatically configure some webservers with SSL certs, but for my purposes I'm just going to use it to generate certificates for manual configuration using the `certonly` mode.

## Certonly Manual Mode

The easiest way to run certbot interactively is to use: `certbot certonly --manual` and follow the prompts. This process looks like...

```
root@ubuntu-vm:/home/llharris/docker# certbot certonly --manual
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Plugins selected: Authenticator manual, Installer None
Enter email address (used for urgent renewal and security notices) (Enter 'c' to
cancel): lee.mark.harris@gmail.com

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Please read the Terms of Service at
https://letsencrypt.org/documents/LE-SA-v1.2-November-15-2017.pdf. You must
agree in order to register with the ACME server at
https://acme-v02.api.letsencrypt.org/directory
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(A)gree/(C)ancel: A

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Would you be willing to share your email address with the Electronic Frontier
Foundation, a founding partner of the Let's Encrypt project and the non-profit
organization that develops Certbot? We'd like to send you email about our work
encrypting the web, EFF news, campaigns, and ways to support digital freedom.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(Y)es/(N)o: N
Please enter in your domain name(s) (comma and/or space separated)  (Enter 'c'
to cancel): *.home.200a.co.uk
Obtaining a new certificate
Performing the following challenges:
dns-01 challenge for home.200a.co.uk

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NOTE: The IP of this machine will be publicly logged as having requested this
certificate. If you're running certbot in manual mode on a machine that is not
your server, please ensure you're okay with that.

Are you OK with your IP being logged?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(Y)es/(N)o: Y

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Please deploy a DNS TXT record under the name
_acme-challenge.home.200a.co.uk with the following value:

QVWfa8R2JO13sj0zlFOfiwIeCLqUkrgbbaWQ6I9qUQo

Before continuing, verify the record is deployed.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Press Enter to Continue
```

At this point, I need to go and create a TXT record in my DNS management interface which is hosted by Cloudflare.

[Cloudflare DNS Management](https://i.imgur.com/Pc7wk5m.png)

```
Waiting for verification...
Cleaning up challenges

IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/home.200a.co.uk/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/home.200a.co.uk/privkey.pem
   Your cert will expire on 2021-01-25. To obtain a new or tweaked
   version of this certificate in the future, simply run certbot
   again. To non-interactively renew *all* of your certificates, run
   "certbot renew"
 - Your account credentials have been saved in your Certbot
   configuration directory at /etc/letsencrypt. You should make a
   secure backup of this folder now. This configuration directory will
   also contain certificates and private keys obtained by Certbot so
   making regular backups of this folder is ideal.
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le
```

My certificate and chain are saved in `/etc/letsencrypt/live/home.200a.co.uk/fullchain.pem and my keyfile (which only exists locally) is in /etc/letsencrypt/live/home.200a.co.uk/privkey.pem.

Now, obviously doing this process manually is great for the purposes of testing, but because these certificates are free, one of the drawbacks is that they expire every 90 days, as specified in the certbot output above. This means that you'd have to manually renew the certificate before the 90 days elapses and then go through the process of configuring whatever web service it is that was using the certificate to use the new version...which is a pain.

Anyway.

Under `/etc/letsencrypt/live/home.200a.co.uk` I have the following:

```
-rw-r--r-- 1 root root 692 Oct 27 21:46 README
lrwxrwxrwx 1 root root  39 Oct 27 21:46 cert.pem -> ../../archive/home.200a.co.uk/cert1.pem
lrwxrwxrwx 1 root root  40 Oct 27 21:46 chain.pem -> ../../archive/home.200a.co.uk/chain1.pem
lrwxrwxrwx 1 root root  44 Oct 27 21:46 fullchain.pem -> ../../archive/home.200a.co.uk/fullchain1.pem
lrwxrwxrwx 1 root root  42 Oct 27 21:46 privkey.pem -> ../../archive/home.200a.co.uk/privkey1.pem
```

We can view the certificate contents and make sure that the X509 Subject Alternative DNS name matches our domain. In my case I want a wildcard domain certificate because I intent to use the same cert on everything...because I'm lazy and this is just a lab at the end of the day.

Run the command: `openssl x509 -in cert.pem -text -noout`

You should get something like this...

```
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number:
            04:1a:24:77:2b:30:22:a7:32:d3:c6:f8:42:d5:0e:14:bf:31
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: C = US, O = Let's Encrypt, CN = Let's Encrypt Authority X3
        Validity
            Not Before: Oct 27 20:46:46 2020 GMT
            Not After : Jan 25 20:46:46 2021 GMT
        Subject: CN = *.home.200a.co.uk
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                RSA Public-Key: (2048 bit)
                Modulus:
                    00:a9:81:58:70:b8:7c:7f:ad:11:46:47:37:59:b4:
                    95:3c:28:ca:0c:e1:2c:61:8d:fe:6e:ec:a4:15:97:
                    d7:8b:77:ef:5d:35:61:50:7c:8e:46:fa:67:1f:17:
                    05:34:b9:b3:bf:95:28:5f:05:a9:13:40:42:d9:28:
                    30:a1:9c:27:ee:56:6d:5a:59:82:47:c9:43:ef:64:
                    8d:76:95:eb:87:5f:a1:32:f2:1a:60:a5:e1:fe:8e:
                    1c:54:85:67:9c:55:b0:a3:bc:10:3a:1f:bc:73:66:
                    54:c2:a2:dd:59:28:cb:ca:98:57:19:d9:06:05:10:
                    57:fb:ad:5d:eb:c4:9f:65:1b:44:92:b9:47:bf:06:
                    ed:de:39:5d:00:fa:73:db:fe:65:3b:63:56:6c:1a:
                    93:38:50:07:6b:b7:9d:23:1f:1e:c8:ff:4a:3c:36:
                    99:c7:b0:92:23:36:03:6f:00:c6:b3:e4:16:74:77:
                    3c:e2:ce:87:da:48:e2:b6:28:96:d6:2f:ee:88:73:
                    8f:db:7f:59:e1:9d:11:0a:7d:81:dc:07:85:a0:37:
                    35:2e:11:d2:58:30:4a:11:2d:d2:b2:f6:aa:dd:4d:
                    5b:3f:ed:2d:89:f5:b9:69:34:2f:9b:0a:65:52:f5:
                    af:58:5e:4d:d2:f2:3f:92:72:09:00:67:1c:a5:36:
                    aa:e3
                Exponent: 65537 (0x10001)
        X509v3 extensions:
            X509v3 Key Usage: critical
                Digital Signature, Key Encipherment
            X509v3 Extended Key Usage:
                TLS Web Server Authentication, TLS Web Client Authentication
            X509v3 Basic Constraints: critical
                CA:FALSE
            X509v3 Subject Key Identifier:
                D8:15:FD:34:E7:A5:0E:EF:BD:96:04:D3:84:E9:B9:61:A6:7B:55:B2
            X509v3 Authority Key Identifier:
                keyid:A8:4A:6A:63:04:7D:DD:BA:E6:D1:39:B7:A6:45:65:EF:F3:A8:EC:A1

            Authority Information Access:
                OCSP - URI:http://ocsp.int-x3.letsencrypt.org
                CA Issuers - URI:http://cert.int-x3.letsencrypt.org/

            X509v3 Subject Alternative Name:
                DNS:*.home.200a.co.uk
            X509v3 Certificate Policies:
                Policy: 2.23.140.1.2.1
                Policy: 1.3.6.1.4.1.44947.1.1.1
                  CPS: http://cps.letsencrypt.org
...
```

### Using the Certificate

First port of call is to SSL enable Cockpit which is running on my main CentOS 8 box. The machine is called `deskmini.home.200a.co.uk` and resolves in DNS to `192.168.200.254`.

If I SSH onto that machine, and run `remotectl certificate` I can see that the current certificate in use by Cockpit is the default self-signed one: `certificate: /etc/cockpit/ws-certs.d/0-self-signed.cert`

Cockpit's self-signed cert is actually a concatenation of the private key and certificate. Cockpit will also utilise the highest numbered file within the directory `/etc/cockpit/ws-certs.d` as the web server certificate.

All I need to do is copy the private key and certificate to the machine running cockpit, concatenate them together and send the output to a suitably named file in the right location: `cat letsencrypt/privkey.pem letsencrypt/cert.pem > /etc/cockpit/ws-certs.d/50-letsencrypt.cert`

Then restart cockpit: `systemctl restart cockpit.socket`

And voilá:

![Cockpit SSL](img/ssl_cockpit_login.png)

