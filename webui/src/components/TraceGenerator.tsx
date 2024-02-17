import { useRef, useState } from "react";
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { ValueType, YAxisSelect } from "./YAxisSelect";

const chartDataPlaceholder = [
  {
    x: 0,
    delay: 0,
    loss: 1,
    rate: 2,
  },
  {
    x: 1,
    delay: 1,
    loss: 0,
    rate: 1,
  },
  {
    x: 2,
    delay: 2,
    loss: 1,
    rate: 0,
  },
  {
    x: 3,
    delay: 1,
    loss: 2,
    rate: 1,
  },
];

export const TraceGenerator = () => {
  const [checkState, setcheckState] = useState({
    delay: false,
    loss: false,
    rate: false,
  });
  const queue = useRef<ValueType[]>([]);
  const [chartData, setchartData] = useState(chartDataPlaceholder);

  const MaybeRenderFirstYAxis = () => {
    return queue.current.length > 0 ? (
      <>
        <YAxis
          yAxisId={queue.current[0]}
          label={{
            value: queue.current[0],
            angle: -90,
            position: "insideLeft",
          }}
        />
        <Line
          yAxisId={queue.current[0]}
          type="monotone"
          dataKey={queue.current[0]}
          stroke="#8884d8"
        />
      </>
    ) : (
      <></>
    );
  };

  const MaybeRenderSecondYAxis = () => {
    return queue.current.length > 1 ? (
      <>
        <YAxis
          yAxisId={queue.current[1]}
          orientation="right"
          label={{
            value: queue.current[1],
            angle: -90,
            position: "insideRight",
          }}
        />
        <Line
          yAxisId={queue.current[1]}
          type="monotone"
          dataKey={queue.current[1]}
          stroke="#82ca9d"
        />
      </>
    ) : (
      <></>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        marginBottom: "1em",
      }}
    >
      <div
        style={{
          flex: 1,
          // border: "1px solid #d9d9d9",
        }}
      >
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            width={501}
            height={400}
            data={chartData}
            syncMethod="index"
          >
            <XAxis dataKey="x" />
            {MaybeRenderFirstYAxis()}
            {MaybeRenderSecondYAxis()}
            <Legend />
          </LineChart>
        </ResponsiveContainer>
        <YAxisSelect
          checkState={checkState}
          setcheckState={setcheckState}
          queue={queue}
        />
      </div>
      <div
        style={{
          flex: 1,
          // border: "1px solid #d9d9d9",
        }}
      ></div>
    </div>
  );
};
