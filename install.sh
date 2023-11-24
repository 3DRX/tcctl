#!/bin/bash
chmod +x ./tcctl
chmod +x ./start-tcctl.sh
chmod +x ./stop-tcctl.sh
echo "adding /etc/init.d/tcctl"
mv ./tcctl /etc/init.d/
echo "enableing /etc/init.d/tcctl"
/etc/init.d/tcctl enable
echo "starting /etc/init.d/tcctl"
/etc/init.d/tcctl start
