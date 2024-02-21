import { memo, useEffect, useRef, useState } from "react";
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { ValueType, YAxisSelect } from "./YAxisSelect";
import { Form } from "antd";
import { checkGe0, formItemStyle } from "./FormUtils";
import { MsInput } from "./FormSubComponents/MsInput";
import { WaveSelect, WaveType } from "./FormSubComponents/WaveSelect";
import { NumberInput } from "./FormSubComponents/NumberInput";

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

type ChartDataItem = {
  x: number;
  delay: number;
  loss: number;
  rate: number;
};

type DelayDataItem = {
  x: number;
  delay: number;
};

type LossDataItem = {
  x: number;
  loss: number;
};

type RateDataItem = {
  x: number;
  rate: number;
};

type ChartProps = {
  chartData: ChartDataItem[];
};

const Chart = memo<ChartProps>((props) => {
  const [checkState, setcheckState] = useState({
    delay: false,
    loss: false,
    rate: false,
  });
  const queue = useRef<ValueType[]>([]);

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
        flex: 1,
        // border: "1px solid #d9d9d9",
      }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          width={501}
          height={400}
          data={props.chartData}
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
  );
});

const defaultFormValues = {
  cycle: {
    number: 0,
    unit: "s",
  },
  offset: {
    number: 0,
    unit: "s",
  },
  waveType: WaveType.Sine,
  top: 0,
  bottom: 0,
};

type TraceGeneratorFormProps = {
  setchartValues: React.Dispatch<
    React.SetStateAction<{
      cycle: {
        number: number;
        unit: string;
      };
      offset: {
        number: number;
        unit: string;
      };
      waveType: WaveType;
      top: number;
      bottom: number;
    }>
  >;
  label: "delay" | "loss" | "rate";
};

const TraceGeneratorForm = memo<TraceGeneratorFormProps>(
  ({ setchartValues, label }) => {
    const [form] = Form.useForm();

    function onValuesChange(_: any, allValues: typeof defaultFormValues) {
      console.log(`onValuesChange: ${JSON.stringify(allValues)}`);
      setchartValues(allValues);
    }

    function getInitialValues(): any {
      return defaultFormValues;
    }

    return (
      <>
        <a>{label}</a>
        <Form
          name={`trace_generator_form_${label}`}
          layout="inline"
          onValuesChange={onValuesChange}
          initialValues={getInitialValues()}
          form={form}
        >
          <Form.Item
            name="cycle"
            label="Cycle"
            rules={[{ validator: checkGe0 }]}
            style={formItemStyle}
          >
            <MsInput />
          </Form.Item>
          <Form.Item name="offset" label="Offset" style={formItemStyle}>
            <MsInput />
          </Form.Item>
          <Form.Item name="waveType" label="Wave Type" style={formItemStyle}>
            <WaveSelect />
          </Form.Item>
          <Form.Item name="top" label="Top" style={formItemStyle}>
            <NumberInput />
          </Form.Item>
          <Form.Item name="bottom" label="Bottom" style={formItemStyle}>
            <NumberInput />
          </Form.Item>
        </Form>
      </>
    );
  },
);

export const TraceGenerator = () => {
  const [chartData, setchartData] =
    useState<ChartDataItem[]>(chartDataPlaceholder);
  const [delayValues, setdelayValues] = useState(defaultFormValues);
  const [lossValues, setlossValues] = useState(defaultFormValues);
  const [rateValues, setrateValues] = useState(defaultFormValues);

  useEffect(() => {
    const delay: DelayDataItem[] = [];
    const loss: LossDataItem[] = [];
    const rate: RateDataItem[] = [];
    if (delayValues.waveType === WaveType.Sine) {
      for (let i = 0; i < delayValues.cycle.number; i++) {
        delay.push({
          x: i,
          delay:
            delayValues.top *
              Math.sin((i * 2 * Math.PI) / delayValues.cycle.number) +
            delayValues.bottom,
        });
      }
    } else if (delayValues.waveType === WaveType.Square) {
      for (let i = 0; i < delayValues.cycle.number; i++) {
        delay.push({
          x: i,
          delay:
            i < delayValues.cycle.number / 2
              ? delayValues.top
              : delayValues.bottom,
        });
      }
    } else if (delayValues.waveType === WaveType.Triangle) {
      for (let i = 0; i < delayValues.cycle.number; i++) {
        delay.push({
          x: i,
          delay:
            (2 * delayValues.top * i) / delayValues.cycle.number +
            delayValues.bottom,
        });
      }
    } else if (delayValues.waveType === WaveType.Sawtooth) {
      for (let i = 0; i < delayValues.cycle.number; i++) {
        delay.push({
          x: i,
          delay:
            (delayValues.top * i) / delayValues.cycle.number +
            delayValues.bottom,
        });
      }
    }

    if (lossValues.waveType === WaveType.Sine) {
      for (let i = 0; i < lossValues.cycle.number; i++) {
        loss.push({
          x: i,
          loss:
            lossValues.top *
              Math.sin((i * 2 * Math.PI) / lossValues.cycle.number) +
            lossValues.bottom,
        });
      }
    } else if (lossValues.waveType === WaveType.Square) {
      for (let i = 0; i < lossValues.cycle.number; i++) {
        loss.push({
          x: i,
          loss:
            i < lossValues.cycle.number / 2
              ? lossValues.top
              : lossValues.bottom,
        });
      }
    } else if (lossValues.waveType === WaveType.Triangle) {
      for (let i = 0; i < lossValues.cycle.number; i++) {
        loss.push({
          x: i,
          loss:
            (2 * lossValues.top * i) / lossValues.cycle.number +
            lossValues.bottom,
        });
      }
    } else if (lossValues.waveType === WaveType.Sawtooth) {
      for (let i = 0; i < lossValues.cycle.number; i++) {
        loss.push({
          x: i,
          loss:
            (lossValues.top * i) / lossValues.cycle.number + lossValues.bottom,
        });
      }
    }
    if (rateValues.waveType === WaveType.Sine) {
      for (let i = 0; i < rateValues.cycle.number; i++) {
        rate.push({
          x: i,
          rate:
            rateValues.top *
              Math.sin((i * 2 * Math.PI) / rateValues.cycle.number) +
            rateValues.bottom,
        });
      }
    } else if (rateValues.waveType === WaveType.Square) {
      for (let i = 0; i < rateValues.cycle.number; i++) {
        rate.push({
          x: i,
          rate:
            i < rateValues.cycle.number / 2
              ? rateValues.top
              : rateValues.bottom,
        });
      }
    } else if (rateValues.waveType === WaveType.Triangle) {
      for (let i = 0; i < rateValues.cycle.number; i++) {
        rate.push({
          x: i,
          rate:
            (2 * rateValues.top * i) / rateValues.cycle.number +
            rateValues.bottom,
        });
      }
    } else if (rateValues.waveType === WaveType.Sawtooth) {
      for (let i = 0; i < rateValues.cycle.number; i++) {
        rate.push({
          x: i,
          rate:
            (rateValues.top * i) / rateValues.cycle.number + rateValues.bottom,
        });
      }
    }
    const newChartData: ChartDataItem[] = [];
    for (let i = 0; i < delay.length; i++) {
      newChartData.push({
        x: i,
        delay: delay[i]
          ? delay[i].delay
          : delay[i - delayValues.cycle.number]?.delay,
        loss: loss[i] ? loss[i].loss : loss[i - lossValues.cycle.number]?.loss,
        rate: rate[i] ? rate[i].rate : rate[i - rateValues.cycle.number]?.rate,
      });
    }
    console.log(`newChartData: ${JSON.stringify(newChartData)}`);
    setchartData((_: ChartDataItem[]) => {
      return newChartData;
    });
  }, [delayValues, lossValues, rateValues]);

  return (
    <div
      style={{
        display: "flex",
        marginBottom: "1em",
      }}
    >
      <Chart chartData={chartData} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <TraceGeneratorForm setchartValues={setdelayValues} label="delay" />
        <TraceGeneratorForm setchartValues={setlossValues} label="loss" />
        <TraceGeneratorForm setchartValues={setrateValues} label="rate" />
      </div>
    </div>
  );
};
