# tcctl

![tcctl](./README.assets/tcctl.png)

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
Then go to `http://<host_name_of_your_router>:8080`.

[Full Documentation](https://www.3drx.top/blog/gadgets/tcctl)
