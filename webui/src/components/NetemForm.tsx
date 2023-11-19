import { Button, Form, Input, Select } from "antd";
import axios from "axios";
import React, { useState } from "react";
import { SERVERPORT } from "../consts";

const { Option } = Select;

type Rate = "Mbps" | "Kbps";
type Delay = "ms" | "s";

interface RateValue {
  number?: number;
  unit?: Rate;
}

interface DelayValue {
  number?: number;
  unit?: Delay;
}

interface LossValue {
  number?: number;
}

interface RateInputProps {
  value?: RateValue;
  onChange?: (value: RateValue) => void;
}

interface DelayInputProps {
  value?: DelayValue;
  onChange?: (value: DelayValue) => void;
}

interface LossInputProps {
  value?: LossValue;
  onChange?: (value: LossValue) => void;
}

const RateInput: React.FC<RateInputProps> = ({ value = {}, onChange }) => {
  const [number, setNumber] = useState<number>(0);
  const [unit, setUnit] = useState<Rate>("Mbps");

  const triggerChange = (changedValue: RateValue) => {
    onChange?.({ number, unit: unit, ...value, ...changedValue });
  };

  const onNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = parseInt(e.target.value || "0", 10);
    if (Number.isNaN(number)) {
      return;
    }
    if (!("number" in value)) {
      setNumber(newNumber);
    }
    triggerChange({ number: newNumber });
  };

  const onUnitChange = (newUnit: Rate) => {
    if (!("unit" in value)) {
      setUnit(newUnit);
    }
    triggerChange({ unit: newUnit });
  };

  return (
    <span>
      <Input
        type="text"
        value={value.number || number}
        onChange={onNumberChange}
        style={{ width: 100 }}
      />
      <Select
        value={value.unit || unit}
        style={{ width: 80, margin: "0 8px" }}
        onChange={onUnitChange}
      >
        <Option value="Mbps">Mbps</Option>
        <Option value="Kbps">Kbps</Option>
      </Select>
    </span>
  );
};

const DelayInput: React.FC<DelayInputProps> = ({ value = {}, onChange }) => {
  const [number, setNumber] = useState<number>(0);
  const [unit, setUnit] = useState<Delay>("ms");

  const triggerChange = (changedValue: DelayValue) => {
    onChange?.({ number, unit: unit, ...value, ...changedValue });
  };

  const onNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = parseInt(e.target.value || "0", 10);
    if (Number.isNaN(number)) {
      return;
    }
    if (!("number" in value)) {
      setNumber(newNumber);
    }
    triggerChange({ number: newNumber });
  };

  const onUnitChange = (newUnit: Delay) => {
    if (!("unit" in value)) {
      setUnit(newUnit);
    }
    triggerChange({ unit: newUnit });
  };

  return (
    <span>
      <Input
        type="text"
        value={value.number || number}
        onChange={onNumberChange}
        style={{ width: 100 }}
      />
      <Select
        value={value.unit || unit}
        style={{ width: 80, margin: "0 8px" }}
        onChange={onUnitChange}
      >
        <Option value="ms">ms</Option>
        <Option value="s">s</Option>
      </Select>
    </span>
  );
};

const LossInput: React.FC<LossInputProps> = ({ value = {}, onChange }) => {
  const [number, setNumber] = useState<number>(0);

  const triggerChange = (changedValue: RateValue) => {
    onChange?.({ number, ...value, ...changedValue });
  };

  const onNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = parseInt(e.target.value || "0", 10);
    if (Number.isNaN(number)) {
      return;
    }
    if (!("number" in value)) {
      setNumber(newNumber);
    }
    triggerChange({ number: newNumber });
  };

  return (
    <span>
      <Input
        type="text"
        value={value.number || number}
        onChange={onNumberChange}
        style={{ width: 100 }}
      />
    </span>
  );
};

export interface NetemFormProps {
  nic: string;
}

const NetemForm: React.FC<NetemFormProps> = ({ nic }) => {
  const onFinish = (values: any) => {
    if (nic === "") return;
    console.log("Received values from form: ", values);
    axios
      .put(`http://${window.location.hostname}:${SERVERPORT}/api/v1/netem`, {
        NIC: nic,
        delay:
          values.delay.unit === "ms"
            ? values.delay.number
            : values.delay.number * 1000,
        loss: values.loss.number,
        rate:
          values.rate.unit === "Mbps"
            ? values.rate.number
            : values.rate.number / 1000,
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const checkGe0 = (_: any, value: { number: number }) => {
    if (value.number >= 0) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Price must be greater than zero!"));
  };

  const checkRate = (_: any, value: RateValue) => {
    if (!value.unit || !value.number) {
      return Promise.reject(new Error("Invalid rate or unit!"));
    }
    if (value.unit === "Kbps" && value.number >= 1000) {
      return Promise.resolve();
    } else if (value.unit === "Mbps" && value.number >= 1) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Rate must be greater than 1 Mbps!"));
  };

  const onReset = () => {
    if (nic === "") return;
    axios
      .put(`http://${window.location.hostname}:${SERVERPORT}/api/v1/netem`, {
        NIC: nic,
        delay: -1,
        loss: -1,
        rate: -1,
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Form
        name="customized_form_controls"
        layout="inline"
        onFinish={onFinish}
        initialValues={{
          delay: {
            number: 0,
            unit: "ms",
          },
          rate: {
            number: 1,
            unit: "Mbps",
          },
          loss: {
            number: 0,
          },
        }}
      >
        <Form.Item name="delay" label="Delay" rules={[{ validator: checkGe0 }]}>
          <DelayInput />
        </Form.Item>
        <Form.Item
          name="loss"
          label="Loss (%)"
          rules={[{ validator: checkGe0 }]}
        >
          <LossInput />
        </Form.Item>
        <Form.Item name="rate" label="Rate" rules={[{ validator: checkRate }]}>
          <RateInput />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
        <Button type="default" onClick={onReset}>
          Reset
        </Button>
      </Form>
    </div>
  );
};

export default NetemForm;
