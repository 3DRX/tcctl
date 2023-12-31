import axios from "axios";
import { SERVERPORT } from "./consts";

export type InterfaceData = {
  bytes_sent: number;
  bytes_recv: number;
  packets_sent: number;
  packets_recv: number;
  errin: number;
  errout: number;
  dropin: number;
  dropout: number;
};

export function parseInterfaceData(data: number[]): InterfaceData | null {
  if (data.length !== 8) {
    return null;
  } else {
    return {
      bytes_sent: data[0],
      bytes_recv: data[1],
      packets_sent: data[2],
      packets_recv: data[3],
      errin: data[4],
      errout: data[5],
      dropin: data[6],
      dropout: data[7],
    };
  }
}

export function bytesPerSecondToKbps(bytes: number): number {
  return (bytes * 8) / 1024;
}

export function isTracefileValid(input: string): boolean {
  const lines: string[] = input.split("\n");
  lines.pop();
  for (const line of lines) {
    const lineSplit: string[] = line.split(" ");
    if (lineSplit.length !== 3) {
      return false;
    }
    for (const value of lineSplit) {
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        return false;
      }
    }
  }
  return true;
}

export function sendTraceLine(line: string, nic: string): boolean {
  const lineSplit: any[] = line.split(" ");
  lineSplit.forEach((n) => Number(n));
  if (lineSplit.length !== 3) {
    return false;
  }
  for (const num of lineSplit) {
    if (isNaN(num) || num < 0) {
      return false;
    }
  }
  axios
    .put(`http://${window.location.hostname}:${SERVERPORT}/api/v1/netem`, {
      NIC: nic,
      delay: lineSplit[0],
      loss: lineSplit[1],
      rate: lineSplit[2],
    })
    .catch((err) => {
      console.log(err);
    });
  return true;
}
