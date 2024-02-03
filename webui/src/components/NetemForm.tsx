import { Button, Form, Input, Select } from "antd";
import React, { useRef, useState } from "react";
import { putNetem } from "../utils";
import { useHotkeys } from "react-hotkeys-hook";
import { NotificationInstance } from "antd/es/notification/interface";
import { LossInput } from "./LossInput";

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

export enum LossPattern {
  Random = "random",
  State = "state",
  Gemodel = "gemodel",
}

export interface LossValue {
  randomPercent?: number;
  randomCorrelation?: number;
  stateP13?: number;
  stateP31?: number;
  stateP32?: number;
  stateP23?: number;
  stateP14?: number;
  gemodelP?: number;
  gemodelR?: number;
  gemodel1H?: number;
  gemodel1K?: number;
  ecn?: boolean;
  pattern?: LossPattern;
}

interface PercentageValue {
  number?: number;
}

interface RateInputProps {
  value?: RateValue;
  onChange?: (value: RateValue) => void;
}

interface MsInputProps {
  value?: DelayValue;
  onChange?: (value: DelayValue) => void;
}

export interface LossInputProps {
  value?: LossValue;
  onChange?: (value: LossValue) => void;
}

interface PercentageInputProps {
  value?: PercentageValue;
  onChange?: (value: PercentageValue) => void;
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

const MsInput: React.FC<MsInputProps> = ({ value = {}, onChange }) => {
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
        style={{ width: 70 }}
      />
      <Select
        value={value.unit || unit}
        style={{ width: 61, margin: "0 8px" }}
        onChange={onUnitChange}
      >
        <Option value="ms">ms</Option>
        <Option value="s">s</Option>
      </Select>
    </span>
  );
};

const PercentageInput: React.FC<PercentageInputProps> = ({
  value = {},
  onChange,
}) => {
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
        style={{ width: 50 }}
      />
    </span>
  );
};

export interface NetemFormProps {
  nic: string;
  api: NotificationInstance;
}

const NetemForm: React.FC<NetemFormProps> = ({ nic, api }) => {
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
        nic: nic,
        delayMs:
          values.delay.unit === "ms"
            ? values.delay.number
            : values.delay.number * 1000,
        lossRandomPercent: values.loss.randomPercent,
        lossRandomCorrelationPercent: values.loss.randomCorrelation,
        lossStateP13: values.loss.stateP13,
        lossStateP31: values.loss.stateP31,
        lossStateP32: values.loss.stateP32,
        lossStateP23: values.loss.stateP23,
        lossStateP14: values.loss.stateP14,
        lossGEModelPercent: values.loss.gemodelP,
        lossGEModelR: values.loss.gemodelR,
        lossGEModel1H: values.loss.gemodel1H,
        lossGEModel1K: values.loss.gemodel1K,
        lossECN: values.loss.ecn,
        corruptPercent: values.corrupt.number,
        duplicatePercent: values.duplicate.number,
        reorderPercent: values.reorder.number,
        rateKbps:
          values.rate.unit === "Kbps"
            ? values.rate.number
            : values.rate.number * 1024,
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

  const checkLoss = (_: any, value: LossValue) => {
    // if any of the values are not 0 <= x <= 100, reject
    if (
      value.pattern === LossPattern.Random &&
      (value.randomPercent! < 0 ||
        value.randomPercent! > 100 ||
        value.randomCorrelation! < 0 ||
        value.randomCorrelation! > 100)
    ) {
      return Promise.reject(new Error("must be >= 0 and <= 100"));
    }
    if (
      value.pattern === LossPattern.State &&
      (value.stateP13! < 0 ||
        value.stateP13! > 100 ||
        value.stateP31! < 0 ||
        value.stateP31! > 100 ||
        value.stateP32! < 0 ||
        value.stateP32! > 100 ||
        value.stateP23! < 0 ||
        value.stateP23! > 100 ||
        value.stateP14! < 0 ||
        value.stateP14! > 100)
    ) {
      return Promise.reject(new Error("must be >= 0 and <= 100"));
    }
    if (
      value.pattern === LossPattern.Gemodel &&
      (value.gemodelP! < 0 ||
        value.gemodelP! > 100 ||
        value.gemodelR! < 0 ||
        value.gemodelR! > 100 ||
        value.gemodel1H! < 0 ||
        value.gemodel1H! > 100 ||
        value.gemodel1K! < 0 ||
        value.gemodel1K! > 100)
    ) {
      return Promise.reject(new Error("must be >= 0 and <= 100"));
    }
    return Promise.resolve();
  };

  const checkPercentage = (_: any, value: { number: number }) => {
    if (value.number >= 0 && value.number <= 100) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("must be >= 0 and <= 100"));
  };

  const checkGe0 = (_: any, value: { number: number }) => {
    if (value.number >= 0) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("must be >= 0"));
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
        nic: nic,
        delayMs: -1,
        corruptPercent: -1,
        duplicatePercent: -1,
        reorderPercent: -1,
        rateKbps: -1,
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
        loss: {
          pattern: LossPattern.Random,
          randomPercent: 0,
          randomCorrelation: 0,
          stateP13: 0,
          stateP31: 0,
          stateP32: 0,
          stateP23: 0,
          stateP14: 0,
          gemodelP: 0,
          gemodelR: 0,
          gemodel1H: 0,
          gemodel1K: 0,
          ecn: false,
        },
        corrupt: {
          number: 0,
        },
        duplicate: {
          number: 0,
        },
        reorder: {
          number: 0,
        },
        rate: {
          number: 20,
          unit: "Mbps",
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
        paddingBottom: "1em",
      }}
    >
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
          <MsInput />
        </Form.Item>
        <Form.Item
          name="corrupt"
          label="Corrupt (%)"
          rules={[{ validator: checkPercentage }]}
          style={formItemStyle}
        >
          <PercentageInput />
        </Form.Item>
        <Form.Item
          name="duplicate"
          label="Duplicate (%)"
          rules={[{ validator: checkPercentage }]}
          style={formItemStyle}
        >
          <PercentageInput />
        </Form.Item>
        <Form.Item
          name="reorder"
          label="Reorder (%)"
          rules={[{ validator: checkPercentage }]}
          style={formItemStyle}
        >
          <PercentageInput />
        </Form.Item>
        <Form.Item
          name="rate"
          label="Rate"
          rules={[{ validator: checkRate }]}
          style={formItemStyle}
        >
          <RateInput />
        </Form.Item>
        <Form.Item
          name="loss"
          label="Loss"
          rules={[{ validator: checkLoss }]}
          style={formItemStyle}
        >
          <LossInput />
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
