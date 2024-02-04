#!/bin/bash
chmod +x ./tcctld
chmod +x ./start-tcctl.sh
chmod +x ./stop-tcctl.sh
echo "adding /etc/init.d/tcctl"
cp ./tcctld /etc/init.d/
echo "enableing /etc/init.d/tcctl"
/etc/init.d/tcctld enable
echo "starting /etc/init.d/tcctl"
/etc/init.d/tcctld start
