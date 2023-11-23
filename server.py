from flask import Flask, request, send_from_directory
from tcctl import NetemController
import psutil
import os
from logging.config import dictConfig
from typing import Dict

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
            },
            "custom_handler": {
                "class": "logging.FileHandler",
                "formatter": "default",
                "filename": "tcctl.log",
            },
        },
        "root": {"level": "INFO", "handlers": ["wsgi", "custom_handler"]},
    }
)

app: Flask = Flask(__name__, static_folder="./dist/")
controllers: Dict[str, NetemController] = {}


@app.route("/api/v1/interfaces", methods=["POST"])
def post_interfaces():
    return psutil.net_io_counters(pernic=True)


@app.route("/api/v1/netem", methods=["PUT"])
def put_netem():
    body = request.get_json()
    # sanity check
    if "NIC" not in body:
        app.logger.warning(f"missing NIC in {body}")
        return "missing NIC", 400
    if "delay" not in body:
        app.logger.warning(f"missing delay in {body}")
        return "missing delay", 400
    if "loss" not in body:
        app.logger.warning(f"missing loss in {body}")
        return "missing loss", 400
    if "rate" not in body:
        app.logger.warning(f"missing rate in {body}")
        return "missing rate", 400
    if body["NIC"] not in psutil.net_io_counters(pernic=True):
        app.logger.warning(f"invalid NIC {body['NIC']}")
        return "invalid NIC", 400
    # set netem
    if body["NIC"] not in controllers:
        controllers[body["NIC"]] = NetemController(body["NIC"], app)
        pass
    controllers[body["NIC"]].set(
        float(body["delay"]),
        float(body["loss"]),
        float(body["rate"]),
    )
    return ""


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(app.static_folder + "/" + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    app.run(debug=True, port=8080)
    pass
