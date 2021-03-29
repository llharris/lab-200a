# Ubuntu Firewall Configuration

Ubuntu uses ufw as a mean of controlling IP tables. For KVM bridges to work, it seems that UFW has to be enabled.

To allow all incoming connection and turn on UFW:

```
$ sudo ufw default allow incoming
$ sudo ufw enable
```

Alternatively you can configure rules for each inbound port and then enable UFW.

Get the current rules and status of UFW using:

```
$ sudo ufw status verbose
Status: active
Logging: on (high)
Default: deny (incoming), allow (outgoing), deny (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere                  
53/tcp                     ALLOW IN    Anywhere                  
53/udp                     ALLOW IN    Anywhere                  
80/tcp                     ALLOW IN    Anywhere                  
443/tcp                    ALLOW IN    Anywhere                  
2222/tcp                   ALLOW IN    Anywhere                  
3306/tcp                   ALLOW IN    Anywhere                  
5900/tcp                   ALLOW IN    Anywhere                  
8080/tcp                   ALLOW IN    Anywhere                  
50000/tcp                  ALLOW IN    Anywhere                  
22/tcp (v6)                ALLOW IN    Anywhere (v6)             
53/tcp (v6)                ALLOW IN    Anywhere (v6)             
53/udp (v6)                ALLOW IN    Anywhere (v6)             
80/tcp (v6)                ALLOW IN    Anywhere (v6)             
443/tcp (v6)               ALLOW IN    Anywhere (v6)             
2222/tcp (v6)              ALLOW IN    Anywhere (v6)             
3306/tcp (v6)              ALLOW IN    Anywhere (v6)             
5900/tcp (v6)              ALLOW IN    Anywhere (v6)             
8080/tcp (v6)              ALLOW IN    Anywhere (v6)             
50000/tcp (v6)             ALLOW IN    Anywhere (v6) 
```