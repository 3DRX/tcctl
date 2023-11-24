from flask import Flask, request, send_from_directory
from tcctl import NetemController
import psutil
import os
from logging.config import dictConfig
from typing import Dict
import atexit

dictConfig(
    {
        "version": 1,
        "formatters": {
            "default": {
                "format": "[%(asctime)s] %(levelname)s in %(module)s: %(message)s",
            }
        },
        "handlers": {
            "wsgi": {
                "class": "logging.StreamHandler",
                "stream": "ext://flask.logging.wsgi_errors_stream",
                "formatter": "default",
            }
        },
        "root": {"level": "INFO", "handlers": ["wsgi"]},
    }
)

tcctl_server: Flask = Flask(__name__, static_folder="./dist/")
controllers: Dict[str, NetemController] = {}


def on_exit():
    for ctl in controllers:
        del controllers[ctl]
        pass
    pass


atexit.register(on_exit)


@tcctl_server.route("/api/v1/interfaces", methods=["POST"])
def post_interfaces():
    return psutil.net_io_counters(pernic=True)


@tcctl_server.route("/api/v1/netem", methods=["PUT"])
def put_netem():
    body = request.get_json()
    # sanity check
    if "NIC" not in body:
        tcctl_server.logger.warning(f"missing NIC in {body}")
        return "missing NIC", 400
    if "delay" not in body:
        tcctl_server.logger.warning(f"missing delay in {body}")
        return "missing delay", 400
    if "loss" not in body:
        tcctl_server.logger.warning(f"missing loss in {body}")
        return "missing loss", 400
    if "rate" not in body:
        tcctl_server.logger.warning(f"missing rate in {body}")
        return "missing rate", 400
    if body["NIC"] not in psutil.net_io_counters(pernic=True):
        tcctl_server.logger.warning(f"invalid NIC {body['NIC']}")
        return "invalid NIC", 400
    # set netem
    if body["NIC"] not in controllers:
        controllers[body["NIC"]] = NetemController(body["NIC"], tcctl_server)
        pass
    controllers[body["NIC"]].set(
        float(body["delay"]),
        float(body["loss"]),
        float(body["rate"]),
    )
    return ""


@tcctl_server.route("/", defaults={"path": ""})
@tcctl_server.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(tcctl_server.static_folder + "/" + path):
        return send_from_directory(tcctl_server.static_folder, path)
    else:
        return send_from_directory(tcctl_server.static_folder, "index.html")


if __name__ == "__main__":
    tcctl_server.run(debug=True, port=8080)
    pass
