FROM centos:6.6
MAINTAINER Rodrigo Tsuru "caixapostal@gmail.com"
# make sure centos is up to date and install unzip support to decompress I.M file later
RUN yum update -y && yum install -y unzip wget
#create user and group to use with websphere and Installation Manager
RUN groupadd -r wasadmin && useradd -r -g wasadmin wasadmin
#copy I.M to image
RUN cd /tmp && wget https://googledrive.com/host/0B1TfHhOuw5TLMWw2YkNITVhWWjQ/agent.installer.linux.gtk.x86_64_1.8.2000.20150303_1526.zip
# unzip I.M install it and delete all files. The installation log is written to /opt/im_install.log
RUN cd /tmp && unzip agent.installer.linux.gtk.x86_64_1.8.2000.20150303_1526.zip && ./installc -log /opt/im_install.log -acceptLicense && rm -rf *
#change the user owner for IBM folder and subfolders to be wasadmin:wasadmin . I use this for WebSphere based products.
RUN cd /opt && chown -R wasadmin:wasadmin IBM
