import { NotificationInstance } from "antd/es/notification/interface";
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

export function bytesPerSecondToKbps(
  bytes: number,
  intervalSec: number,
): number {
  return (bytes * 8) / (1024 * intervalSec);
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

export function sendTraceLine(
  datSplit: string[],
  nic: string,
  api: NotificationInstance,
) {
  const lineSplit: number[] = datSplit.map(Number);
  if (lineSplit.length !== 3) {
    api.error({
      message: "Invalid trace line",
      description: "Each line must contain 3 numbers",
    });
    return;
  }
  for (const num of lineSplit) {
    if (isNaN(num) || num < 0) {
      api.error({
        message: "Invalid trace line",
        description: "Each number must be a positive number",
      });
      return;
    }
  }
  putNetem({
    nic: nic,
    delayMs: lineSplit[0],
    lossRandomPercent: lineSplit[1],
    rateKbps: lineSplit[2] * 1024,
    corruptPercent: 0,
    duplicatePercent: 0,
    reorderPercent: 0,
  }).catch((err) => {
    api.error({
      message: "Failed to set netem",
      description: err.toString(),
    });
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

enum NetemDistribution {
  uniform = "uniform",
  normal = "normal",
  pareto = "pareto",
  paretonormal = "paretonormal",
}

export enum QueueType {
  pfifo = "pfifo",
  bfifo = "bfifo",
}

export type NetemForm = {
  nic: string;
  delayMs: number;
  delayJitterMs?: number;
  delayCorrelationPercent?: number;
  delayDistribution?: NetemDistribution;
  lossRandomPercent?: number;
  lossRandomCorrelationPercent?: number;
  lossStateP13?: number;
  lossStateP31?: number;
  lossStateP32?: number;
  lossStateP23?: number;
  lossStateP14?: number;
  lossGEModelPercent?: number;
  lossGEModelR?: number;
  lossGEModel1H?: number;
  lossGEModel1K?: number;
  lossECN?: boolean;
  corruptPercent: number;
  corruptCorrelationPecent?: number;
  duplicatePercent: number;
  duplicateCorrelationPecent?: number;
  reorderPercent: number;
  reorderCorrelationPecent?: number;
  reorderGapDistance?: number;
  rateKbps: number;
  slotMinDelayMs?: number;
  slotMaxDelayMs?: number;
  slotDistribution?: NetemDistribution;
  slotDelayJitterMs?: number;
  slotPackets?: number;
  slotBytes?: number;
  queueType?: QueueType;
  queueLimitBytes?: number;
  queueLimitPackets?: number;
};

export async function putNetem(data: NetemForm) {
  console.log(data);
  const response = await fetch(
    `http://${window.location.hostname}:${SERVERPORT}/api/v2/netem`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );
  if (!response.ok) {
    const body = (await response.text()).replace(/"/g, "").replace(/\\n/g, "");
    throw new Error(`${body}`);
  }
  return response?.json();
}
