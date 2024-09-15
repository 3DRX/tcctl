---
title: Tcctl hardware setup
description: How to setup hardware for network simulation
---

Tcctl works on any linux system that have the `tc` command installed
which supports netem.
This tutorial is a guide on how to setup openwrt on hardwares such as
NanoPi r2s.

![r2s](../../../../assets/r2s.jpg)

## Prerequisites

1. Your Pi
2. SD card to install firmware on your Pi
3. SD card reader to connect it to your computer

## Steps

1. Find the suitable openwrt firmware for you device here:
https://firmware-selector.openwrt.org/.
2. Flash the firmware to the SD card, for example, you can use
[balenaEtcher](https://github.com/balena-io/etcher).
3. Put the card in, and power up the machine. If your are flashing
the operating system into eMMC, please follow the hardware
manufactor's guide.
4. Test network connections.
