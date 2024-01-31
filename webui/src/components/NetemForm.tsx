import { Button, Form, notification, Input, Select } from "antd";
import React, { useRef, useState } from "react";
import { putNetem } from "../utils";
import { useHotkeys } from "react-hotkeys-hook";

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
  const [api, contextHolder] = notification.useNotification();
  const formRef = useRef(null);
  useHotkeys(
    "ctrl+return",
    () => {
      if (formRef.current) {
        // @ts-ignore
        formRef.current.submit();
      }
    },
    [],
  );

  function checkNICSelected() {
    if (nic === "") {
      api.error({
        message: "Error",
        description: "Please select a NIC first",
        placement: "topRight",
        style: {
          height: 85,
        },
      });
      return false;
    }
    return true;
  }

  const onFinish = (values: any) => {
    if (checkNICSelected()) {
      putNetem({
        NIC: nic,
        DelayMs:
          values.delay.unit === "ms"
            ? values.delay.number
            : values.delay.number * 1000,
        LossPercent: values.loss.number,
        RateKbps:
          values.rate.unit === "Mbps"
            ? values.rate.number
            : values.rate.number / 1000,
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
    }
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
    if (checkNICSelected()) {
      putNetem({
        NIC: nic,
        DelayMs: -1,
        LossPercent: -1,
        RateKbps: -1,
      }).catch((err) => {
        console.log(err);
      });
    }
  };

  const formItemStyle: React.CSSProperties = {
    marginTop: "1em",
  };

  const getInitialValues = () => {
    const form = localStorage.getItem("netem-form");
    if (form) {
      return JSON.parse(form);
    } else {
      return {
        delay: {
          number: 0,
          unit: "ms",
        },
        rate: {
          number: 20,
          unit: "Mbps",
        },
        loss: {
          number: 0,
        },
      };
    }
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
      {contextHolder}
      <Form
        name="customized_form_controls"
        layout="inline"
        onFinish={onFinish}
        onValuesChange={(_, allValues) => {
          localStorage.setItem("netem-form", JSON.stringify(allValues));
        }}
        initialValues={getInitialValues()}
        ref={formRef}
      >
        <Form.Item
          name="delay"
          label="Delay"
          rules={[{ validator: checkGe0 }]}
          style={formItemStyle}
        >
          <DelayInput />
        </Form.Item>
        <Form.Item
          name="loss"
          label="Loss (%)"
          rules={[{ validator: checkGe0 }]}
          style={formItemStyle}
        >
          <LossInput />
        </Form.Item>
        <Form.Item
          name="rate"
          label="Rate"
          rules={[{ validator: checkRate }]}
          style={formItemStyle}
        >
          <RateInput />
        </Form.Item>
        <Form.Item style={formItemStyle}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
        <Button type="default" onClick={onReset} style={formItemStyle}>
          Reset
        </Button>
      </Form>
    </div>
  );
};

export default NetemForm;
