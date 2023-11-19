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

export function bytesPerSecondToKbps(
  bytes: number,
): number {
  return ((bytes) * 8) / 1024;
}
