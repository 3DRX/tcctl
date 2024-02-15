import { Select, Tabs, notification } from "antd";
import type { TabsProps } from "antd";
import { useEffect, useState } from "react";
import {
  InterfaceData,
  parseInterfaceData,
  bytesPerSecondToKbps,
  postInterfaces,
  putNetem,
} from "../utils.ts";
import NetemForm from "./NetemForm.tsx";
import TraceForm from "./TraceForm.tsx";
import Description from "./Description.tsx";
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { DarkPrimeCol, LightPrimeCol } from "../consts.ts";

type option = {
  label: string;
  value: string;
};

type ChartData = {
  x: number;
  send: number;
  recv: number;
};

export type HistoryProps = {
  dark: boolean;
};

const History: React.FC<HistoryProps> = (props) => {
  const [interfaces, setinterfaces] = useState<option[]>([]);
  const [nic, setnic] = useState<string>("");
  const [count, setcount] = useState<number>(0);
  const [lastData, setlastData] = useState<InterfaceData | null>(null);
  const [tab, settab] = useState<string>(localStorage.getItem("tab") || "1");
  const [api, contextHolder] = notification.useNotification();
  const [chartData, setchartData] = useState<ChartData[]>([]);

  useEffect(() => {
    localStorage.setItem("tab", tab);
  }, [tab]);

  useEffect(() => {
    postInterfaces()
      .then((res) => {
        let newInterfaces = [];
        for (const nic in res) {
          newInterfaces.push({
            label: nic,
            value: nic,
          });
        }
        setinterfaces(newInterfaces);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    if (nic === "") {
      return;
    }
    const interval = setInterval(async () => {
      try {
        const res = await postInterfaces();
        const data: InterfaceData | null = parseInterfaceData(res[nic]);
        if (data === null) {
          api.error({
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
                ),
                recv: bytesPerSecondToKbps(
                  data.bytes_recv - lastData.bytes_recv,
                ),
              },
            ];
          });
        }
        setlastData((_) => data);
        setcount((prevCount) => prevCount + 1);
      } catch (err) {
        console.log(err);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [nic, count, lastData, chartData]);

  const tabItems: TabsProps["items"] = [
    {
      key: "1",
      label: "Manual",
      children: <NetemForm nic={nic} api={api} />,
    },
    {
      key: "2",
      label: "Trace",
      children: <TraceForm nic={nic} api={api} />,
    },
  ];

  const onTabChange = (key: string) => {
    settab(key);
    setchartData((_) => []);
    setlastData((_) => null);
    setcount((_) => 0);
    if (nic === "") {
      return;
    }
    putNetem({
      nic: nic,
      delayMs: -1,
      lossRandomPercent: -1,
      rateKbps: -1,
      corruptPercent: -1,
      duplicatePercent: -1,
      reorderPercent: -1,
    }).catch((err: Error) => {
      api.error({
        message: "Error",
        description: `${err.message}`,
        placement: "topRight",
        style: {
          height: 85,
        },
      });
    });
  };

  return (
    <div style={{ alignItems: "center" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Description dark={props.dark} />
        <Select
          defaultValue="Select a NIC"
          style={{
            width: 140,
            marginTop: "0.5em",
            marginBottom: "0.5em",
          }}
          onChange={(value: string) => {
            setlastData(null);
            setnic(value);
            setcount(0);
          }}
          options={interfaces}
        />
      </div>
      <div
        style={{
          height: "60vh",
          maxHeight: "22em",
          width: "98vw",
          marginBottom: "-1em",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={501}
            height={400}
            data={chartData}
            syncMethod="index"
          >
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
      {contextHolder}
      <div style={{ width: "80vw", marginLeft: "auto", marginRight: "auto" }}>
        <Tabs defaultActiveKey={tab} items={tabItems} onChange={onTabChange} />
      </div>
    </div>
  );
};

export default History;
