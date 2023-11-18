import os
import signal
import time
import sys
from typing import List


NIC = "br-lan"


def on_exit(signum, frame):
    """
    unset bandwidth limit when exiting
    """
    print()
    print("exiting, unset bandwidth limit")
    os.system(f"tc qdisc del dev {NIC} root")
    sys.exit(0)
    pass


def parse_trace(path: str) -> List[float]:
    trace: List[float] = []
    with open(path, "r") as f:
        for line in f.readlines():
            line = line.strip()
            if len(line) > 0:
                delay, loss, bandwidth = list(map(float, line.split(" ")))
                trace.append(bandwidth)
                pass
            pass
        pass
    return trace


class NetemController(object):
    def __init__(self, NIC: str):
        self.NIC = NIC
        self.__first = True
        os.system(f"tc qdisc del dev {NIC} root")
        pass

    def set(self, delay: float, loss: float, bandwidth: float):
        # if any of the 3 values is below 0, unset netem
        if delay < 0 or loss < 0 or bandwidth < 0:
            self.unset()
            return
        operation = "add" if self.__first else "change"
        self.__first = False
        os.system(
            f"tc qdisc {operation} dev {self.NIC} root netem delay {delay}ms loss {loss}% rate {bandwidth}mbit"
        )
        print(f"set netem delay {delay}ms loss {loss}% rate {bandwidth}mbit")
        pass

    def unset(self):
        os.system(f"tc qdisc del dev {self.NIC} root")
        self.__first = True
        print(f"unset netem limit of {self.NIC}")
        pass

    def __del__(self):
        os.system(f"tc qdisc del dev {self.NIC} root")
        print(f"unset netem limit of {self.NIC}")
        pass

    pass


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: sudo python3 tcscript.py <trace file path>")
        sys.exit(0)
        pass
    if not os.path.exists(sys.argv[1]):
        print("error: trace file not found")
        sys.exit(0)
        pass
    if os.geteuid() != 0:
        print("error: permission denied (this program need to be run as root)")
        sys.exit(0)
        pass
    signal.signal(signal.SIGINT, on_exit)
    signal.signal(signal.SIGTERM, on_exit)
    trace: List[float] = parse_trace(sys.argv[1])
    first: bool = True
    length: int = len(trace)
    ctl = NetemController(NIC)
    last_bandwidth: float = 0.0
    for i, t in enumerate(trace):
        t = max(2, t)
        if t == last_bandwidth:
            time.sleep(1)
            continue
        else:
            last_bandwidth = t
            pass
        print(f"[{i+1}/{length}] limiting bandwidth to {t}Mbps")
        ctl.set(0, 0, t)
        time.sleep(1)
        pass
    os.system(f"tc qdisc del dev {NIC} root")
    pass
