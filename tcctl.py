import os
from flask import Flask
from typing import List


class NetemController(object):
    def __init__(self, NIC: str, app: Flask):
        self.NIC = NIC
        self.__first = True
        self.__app = app
        app.logger.info(f"create NetemController for {NIC}")
        pass

    def __success(self, result: str) -> bool:
        # TODO
        parsed: List[str] = result.split("\n").pop()
        if len(parsed) == 0:
            return True
        return False

    def set(self, delay: float, loss: float, bandwidth: float):
        # if any of the 3 values is below 0, unset netem
        if delay < 0 or loss < 0 or bandwidth < 0:
            self.unset()
            return
        operation = "add" if self.__first else "change"
        self.__first = False
        cmd = f"tc qdisc {operation} dev {self.NIC} root netem delay {delay}ms loss {loss}% rate {bandwidth}mbit"
        self.__app.logger.info(cmd)
        result = os.popen(cmd).read()
        if not self.__success(result):
            self.__app.logger.error(
                f"failed to set delay {delay}ms loss {loss}% rate {bandwidth}mbit"
            )
            pass
        pass

    def unset(self):
        cmd = f"tc qdisc del dev {self.NIC} root"
        self.__app.logger.info(cmd)
        result = os.popen(cmd).read()
        if not self.__success(result):
            self.__app.logger.error(
                f"failed to unset netem limit of {self.NIC}")
            pass
        self.__first = True
        pass

    def __del__(self):
        self.unset()
        self.__app.logger.info(f"delete NetemController for {self.NIC}")
        pass

    pass
