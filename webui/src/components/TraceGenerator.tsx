import { memo, useRef, useState } from "react";
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { ValueType, YAxisSelect } from "./YAxisSelect";
import { Button, Form } from "antd";
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

type ChartProps = {
  chartData: ChartDataItem[];
};

const Chart = (props: ChartProps) => {
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
};

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
  setchartData: React.Dispatch<React.SetStateAction<ChartDataItem[]>>;
};

const TraceGeneratorForm = memo<TraceGeneratorFormProps>(({ setchartData }) => {
  const [form] = Form.useForm();

  function onFinish(values: any) {
    console.log(`onFinish: ${JSON.stringify(values)}`);
  }

  function onValuesChange(_: any, allValues: any) {
    console.log(`onValuesChange: ${JSON.stringify(allValues)}`);
  }

  function getInitialValues(): any {
    return defaultFormValues;
  }

  function onReset() {}

  return (
    <div
      style={{
        flex: 1,
        // border: "1px solid #d9d9d9",
      }}
    >
      <Form
        name="trace_generator_form"
        layout="inline"
        onFinish={onFinish}
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
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Form.Item style={formItemStyle}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
          <Button type="default" onClick={onReset} style={formItemStyle}>
            Reset
          </Button>
        </div>
      </Form>
    </div>
  );
});

export const TraceGenerator = () => {
  const [chartData, setchartData] =
    useState<ChartDataItem[]>(chartDataPlaceholder);

  return (
    <div
      style={{
        display: "flex",
        marginBottom: "1em",
      }}
    >
      <Chart chartData={chartData} />
      <TraceGeneratorForm setchartData={setchartData} />
    </div>
  );
};
