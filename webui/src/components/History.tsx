import { Select } from "antd";
import { SERVERPORT } from "../consts.ts";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import ReactEcharts from "echarts-for-react";
import {
  InterfaceData,
  parseInterfaceData,
  bytesPerSecondToKbps,
} from "../utils.ts";
import NetemForm from "./NetemForm.tsx";

type option = {
  label: string;
  value: string;
};

const defaultOption: any = {
  legend: {
    orient: "horizontal",
    left: "center",
    data: ["recv", "sent"],
  },
  xAxis: {
    name: "Time(s)",
    data: [],
  },
  yAxis: {
    type: "value",
    name: "Kbps",
  },
  series: [
    {
      data: [],
      type: "line",
      stack: "x",
      name: "recv",
    },
    {
      data: [],
      type: "line",
      stack: "x",
      name: "sent",
    },
  ],
};

const History = () => {
  const [interfaces, setinterfaces] = useState<option[]>([]);
  const [nic, setnic] = useState<string>("");
  const [count, setcount] = useState<number>(0);
  const [dataqueue, setdataqueue] = useState<InterfaceData[]>([]);
  const [option, setoption] = useState(defaultOption);
  const echart = useRef<any>(null);

  useEffect(() => {
    axios
      .post(
        `http://${window.location.hostname}:${SERVERPORT}/api/v1/interfaces`,
      )
      .then((res) => {
        let newInterfaces = [];
        for (const nic in res.data) {
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
    } else {
      const intervalId = setInterval(() => {
        generateChart();
        setcount(count + 1);
      }, 500);
      return () => clearInterval(intervalId);
    }
  }, [nic, count]);

  const generateChart = () => {
    axios
      .post(
        `http://${window.location.hostname}:${SERVERPORT}/api/v1/interfaces`,
      )
      .then((res) => {
        const data: InterfaceData | null = parseInterfaceData(res.data[nic]);
        let newDataqueue: InterfaceData[] = [];
        if (data === null) {
          console.log("warning: data is invalid");
          return;
        }
        const newOption = option;
        if (dataqueue.length !== 0) {
          newOption.xAxis.data.push(count - 1);
          newOption.series[0].data.push(
            bytesPerSecondToKbps(
              data.bytes_recv - dataqueue[dataqueue.length - 1].bytes_recv,
              0.5,
            ),
          );
          newOption.series[1].data.push(
            bytesPerSecondToKbps(
              data.bytes_sent - dataqueue[dataqueue.length - 1].bytes_sent,
              0.5,
            ),
          );
          if (newOption.xAxis.data.length > 45) {
            newOption.xAxis.data.shift();
            newOption.series[0].data.shift();
            newOption.series[1].data.shift();
            newDataqueue = dataqueue.slice(1);
          } else {
            newDataqueue = dataqueue;
          }
        }
        if (echart && echart.current) {
          echart.current.getEchartsInstance().setOption(newOption);
        }
        setoption(newOption);
        setdataqueue([...newDataqueue, data]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <Select
        defaultValue="Select a NIC"
        style={{ width: 120 }}
        onChange={(value: string) => {
          if (echart && echart.current) {
            echart.current.getEchartsInstance().clear();
            const newOption = option;
            newOption.xAxis.data = [];
            newOption.series[0].data = [];
            newOption.series[1].data = [];
            echart.current.getEchartsInstance().setOption(newOption);
            setoption(newOption);
          }
          setoption(defaultOption);
          setdataqueue([]);
          setnic(value);
          setcount(0);
        }}
        options={interfaces}
      />
      <ReactEcharts
        option={defaultOption}
        ref={echart}
        style={{ height: "45vh", width: "100vw" }}
      />
      <NetemForm />
    </>
  );
};

export default History;
