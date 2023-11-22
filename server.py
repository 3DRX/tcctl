from flask import Flask, request, send_from_directory
from tcctl import NetemController
import psutil
import os

app = Flask(__name__, static_folder="./webui/dist/")
controllers = []


@app.route("/api/v1/interfaces", methods=["POST"])
def post_interfaces():
    return psutil.net_io_counters(pernic=True)


@app.route("/api/v1/netem", methods=["PUT"])
def put_netem():
    body = request.get_json()
    # sanity check
    if "NIC" not in body:
        return "missing NIC", 400
    if "delay" not in body:
        return "missing delay", 400
    if "loss" not in body:
        return "missing loss", 400
    if "rate" not in body:
        return "missing rate", 400
    if body["NIC"] not in psutil.net_io_counters(pernic=True):
        return "invalid NIC", 400
    # set netem
    for ctl in controllers:
        if ctl.NIC == body["NIC"]:
            ctl.set(
                float(body["delay"]),
                float(body["loss"]),
                float(body["rate"]),
            )
            return ""
        pass
    controllers.append(NetemController(body["NIC"]))
    controllers[-1].set(
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
    app.run(debug=False, port=8080)
    pass
