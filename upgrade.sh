#!/bin/bash

# This script is used to upgrade the tcctl daemon
# Takes 1 argument: the url of the new tcctl zip

echo "Downloading the new tcctl zip to /tmp"
wget -O /tmp/tcctl.zip $1
echo "Decompressing the new tcctl zip"
unzip /tmp/tcctl.zip -d /tmp/tcctl
echo "Stopping the tcctl daemon"
/etc/init.d/tcctld stop
rm /etc/init.d/tcctld
echo "Copying the new tcctl dir to /root/tcctl"
rm -rf /root/tcctl
mv /tmp/tcctl /root/tcctl
echo "cd into /root/tcctl and install"
cd /root/tcctl
chmod +x ./install.sh
echo "Upgrade done"

