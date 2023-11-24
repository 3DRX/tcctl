# tcctl

![tcctl](./README.assets/tcctl.png)

> A webui for tc netem, designed to be run on any Linux system.

## Features

- [x] Visualize network interface traffic status
- [x] Apply network shaping rules manually & automatically by trace file
    - [x] Control delay, packet loss rate, bandwidth
    - [x] Run as deamon
    - [ ] Configure packet loss distribution
    - [ ] Filter by IP and port

## Quick Start

> The following operations should be taken as root user

Dependencies to run on router: python3 python3-psutil python3-flask

```
opkg update
opkg install python3 python3-pip python3-psutil tc-full
pip install flask gunicorn
```

Usage: install dependencies, restart, decompress the zip (download available in release) and put it at /root/tcctl (IMPORTANT),
cd into it and run `chmod +x install.sh && install.sh`, which will add `/etc/init.d/tcctl` start and enable it by default.
Then go to `http://<host_name_of_your_router>:8080`.

## Documentation

[Full Documentation](https://www.3drx.top/blog/gadgets/tcctl)
