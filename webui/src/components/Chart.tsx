import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { ChartData } from "./ChartUtils";
import { DarkPrimeCol, LightPrimeCol, NICPlaceholder } from "../consts";
import { useEffect, useState } from "react";
import {
  InterfaceData,
  bytesPerSecondToKbps,
  parseInterfaceData,
  postInterfaces,
} from "../utils";
import { NotificationInstance } from "antd/es/notification/interface";
import { useInterval } from "usehooks-ts";

export const Chart = (props: {
  dark: boolean;
  nic: string;
  api: NotificationInstance;
}) => {
  const [count, setcount] = useState<number>(0);
  const [lastData, setlastData] = useState<InterfaceData | null>(null);
  const [chartData, setchartData] = useState<ChartData[]>([]);

  useEffect(() => {
    setchartData([]);
    setlastData(null);
    setcount(0);
  }, [props.nic]);

  useInterval(
    async () => {
      const res = await postInterfaces();
      const data: InterfaceData | null = parseInterfaceData(res[props.nic]);
      if (data === null) {
        props.api.error({
          message: "Error",
          description: "Data is invalid",
          placement: "topRight",
          style: {
            height: 85,
          },
        });
        return;
      }
      if (lastData !== null) {
        setchartData((prevData) => {
          if (prevData.length > 46) {
            prevData.shift();
          }
          return [
            ...prevData,
            {
              x: count - 1,
              send: bytesPerSecondToKbps(
                data.bytes_sent - lastData.bytes_sent,
                0.5,
              ),
              recv: bytesPerSecondToKbps(
                data.bytes_recv - lastData.bytes_recv,
                0.5,
              ),
            },
          ];
        });
      }
      setlastData(data);
      setcount((prevCount) => prevCount + 1);
    },
    props.nic === NICPlaceholder ? null : 500,
  );

  return (
    <div
      style={{
        height: "60vh",
        maxHeight: "20em",
        width: "90vw",
        marginBottom: "-1em",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart width={501} height={400} data={chartData} syncMethod="index">
          <XAxis dataKey="x" />
          <YAxis
            label={{ value: "Kbps", angle: -90, position: "insideLeft" }}
          />
          <Legend layout="horizontal" verticalAlign="top" align="right" />
          <Line
            type="linear"
            dataKey="send"
            stroke={props.dark ? DarkPrimeCol : LightPrimeCol}
            fill={props.dark ? DarkPrimeCol : LightPrimeCol}
            isAnimationActive={false}
            strokeWidth={3}
          />
          <Line
            type="linear"
            dataKey="recv"
            stroke={props.dark ? LightPrimeCol : DarkPrimeCol}
            fill={props.dark ? LightPrimeCol : DarkPrimeCol}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
