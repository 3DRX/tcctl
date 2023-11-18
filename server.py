from flask import Flask, request
from tcctl import NetemController
import psutil

app = Flask(__name__)
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
            ctl.set(body["delay"], body["loss"], body["rate"])
            return ""
        pass
    controllers.append(NetemController(body["NIC"]))
    controllers[-1].set(body["delay"], body["loss"], body["rate"])
    return ""


if __name__ == "__main__":
    app.run(debug=True)
    pass
