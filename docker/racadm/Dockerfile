FROM centos:7
MAINTAINER lee.mark.harris@gmail.com
RUN yum update -y && yum install -y wget perl openssl-devel
RUN wget -q -O - http://linux.dell.com/repo/hardware/latest/bootstrap.cgi | bash
RUN yum install -y srvadmin-idrac
COPY entrypoint.sh /
ENTRYPOINT ["/entrypoint.sh"]
