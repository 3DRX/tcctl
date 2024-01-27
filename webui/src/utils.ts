import { SERVERPORT } from "./consts";

export type InterfaceData = {
  bytes_sent: number;
  bytes_recv: number;
};

export function parseInterfaceData(data: number[]): InterfaceData | null {
  if (data.length !== 2) {
    return null;
  } else {
    return {
      bytes_sent: data[0],
      bytes_recv: data[1],
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
  putNetem({
    NIC: nic,
    delay: lineSplit[0],
    loss: lineSplit[1],
    rate: lineSplit[2],
  }).catch((err) => {
    console.log(err);
  });
  return true;
}

export async function postInterfaces() {
  const response = await fetch(
    `http://${window.location.hostname}:${SERVERPORT}/api/v2/interfaces`,
    {
      method: "POST",
    },
  );
  return response.json();
}

export type NetemForm = {
  NIC: string;
  delay: number;
  loss: number;
  rate: number;
};

export async function putNetem(data: NetemForm) {
  const response = await fetch(
    `http://${window.location.hostname}:${SERVERPORT}/api/v1/netem`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );
  return response.json();
}
