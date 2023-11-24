# tcctl

![tcctl](./README.assets/tcctl.png)

> A webui for tc netem, designed to be run on OpenWrt routers.

## Features

- [x] Visualize network interface traffic status
- [x] Apply network shaping rules manually & automatically by trace file
    - [x] Control delay, packet loss rate, bandwidth
    - [ ] Configure packet loss distribution
    - [ ] Filter by IP and port

## Quick Start

Dependencies to run on router: python3 python3-psutil python3-flask

```
opkg update
opkg install python3 python3-pip python3-psutil tc-full
pip install flask gunicorn
```

Usage: install dependencies, restart, decompress the zip (download available in release),
cd into it and run `run_prod.sh`.
Then go to `http://<host_name_of_your_router>:8080`.

## Documentation

[Full Documentation](https://www.3drx.top/blog/gadgets/tcctl)
