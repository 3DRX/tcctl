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


def parse(path: str) -> List[float]:
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
    trace: List[float] = parse(sys.argv[1])
    first: bool = True
    length: int = len(trace)
    os.system(f"tc qdisc del dev {NIC} root")
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
        if first:
            os.system(f"tc qdisc add dev {NIC} root netem rate {t}mbit")
            first = False
        else:
            os.system(f"tc qdisc change dev {NIC} root netem rate {t}mbit")
            pass
        time.sleep(1)
        pass
    os.system(f"tc qdisc del dev {NIC} root")
    pass
