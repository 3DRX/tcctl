# tcctl

> A webui for tc netem, designed to be run on OpenWRT routers.

Dependencies to run on router: python3 python3-psutil python3-flask

```
opkg update
opkg install python3
opkg install python3-pip
opkg install python3-psutil
pip install flask
```

Usage: install dependencies, decompress build.zip (download available in release),
and run `run_prod.sh`.
