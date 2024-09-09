---
title: Getting Started
description: Setup tcctl in less than 5 minuts.
---

## Install & Run

:::caution
The following operations should be taken as root user.
:::

1. Download [release zip](https://github.com/3DRX/tcctl/releases/latest)
on OpenWrt and decompress it to /root/tcctl
2. Install [tc](https://man7.org/linux/man-pages/man8/tc.8.html), for example, on OpenWrt using opkg:
```
opkg update && opkg install tc-full
```
3. Reboot
4. `cd /root/tcctl && chmod +x ./install.sh && ./install.sh`
5. Done! Go to `http://<host_name>:8080`

## Trouble Shooting

The log of server can be found at tcctl.log, for any found issue, please [open an issue on github](https://github.com/3DRX/tcctl/issues/new).
