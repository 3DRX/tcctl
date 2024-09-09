import { Button, Form, Input, Select } from "antd";
import React, { useState } from "react";
import { QueueType, putNetem } from "../utils";
import { NotificationInstance } from "antd/es/notification/interface";
import { LossInput } from "./LossInput";
import {
  LossPattern,
  LossValue,
  PercentageInputProps,
  Rate,
  RateInputProps,
  RateValue,
  checkGe0,
  checkGe100,
  checkPercentage,
  formItemStyle,
  getOnFloatNumberChange,
} from "./FormUtils";
import { NICPlaceholder } from "../consts";
import { MsInput } from "./FormSubComponents/MsInput";
import { QueueInput } from "./FormSubComponents/QueueInput";

const { Option } = Select;

const defalutValues = {
  delay: {
    number: 0,
    unit: "ms",
  },
  delayJitter: {
    number: 0,
    unit: "ms",
  },
  delayCorrelation: {
    number: 0,
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
  queue: {
    number: 1000,
    unit: "Kbytes",
  },
};

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

const PercentageInput: React.FC<PercentageInputProps> = ({
  value = {},
  onChange,
}) => {
  const [number, setNumber] = useState<string>(value.number?.toString() || "0");

  return (
    <span>
      <Input
        type="text"
        value={number}
        onChange={getOnFloatNumberChange(setNumber, ({ number: number }) => {
          onChange?.({ ...value, number });
        })}
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
  const [form] = Form.useForm();

  function checkNICSelected() {
    if (nic === NICPlaceholder) {
      api.error({
        message: "Error",
        description: "Please select a NIC first",
        placement: "topRight",
        style: {
          height: 80,
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
        delayJitterMs:
          values.delayJitter.unit === "ms"
            ? values.delayJitter.number
            : values.delayJitter.number * 1000,
        delayCorrelationPercent: values.delayCorrelation.number,
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
        queueType:
          values.queue.unit === "packets" ? QueueType.pfifo : QueueType.bfifo,
        queueLimitBytes:
          values.queue.unit === "Kbytes" ? values.queue.number * 1024 : 0,
        queueLimitPackets:
          values.queue.unit === "packets" ? values.queue.number : 0,
      }).catch((err: Error) => {
        api.error({
          message: "Error",
          description: `${err.message}`,
          placement: "topRight",
          style: {
            height: getNotificationHeight(err.message),
            width: getNotificationWidth(err.message),
            overflow: "scroll",
          },
        });
      });
    }
  };

  const getNotificationWidth = (message: string) => {
    const width = message.length * 10;
    if (width > 300) {
      if (width < 550) {
        return width;
      } else {
        return 550;
      }
    } else {
      return 300;
    }
  };

  const getNotificationHeight = (message: string) => {
    const width = message.length * 10;
    if (width <= 550) {
      return 95;
    } else {
      return 150;
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

  const onValuesChange = (_: any, allValues: any) => {
    localStorage.setItem("netem-form", JSON.stringify(allValues));
  };

  const onReset = () => {
    form.resetFields(); // rerender form, avoid state mismatch
    form.setFieldsValue(defalutValues); // set value to defalutValues (resetFields only set it to values in localStorage)
    onValuesChange(null, defalutValues); // update localStorage
    if (checkNICSelected()) {
      putNetem({
        nic: nic,
        delayMs: -1,
        corruptPercent: -1,
        duplicatePercent: -1,
        reorderPercent: -1,
        rateKbps: -1,
      }).catch((err: Error) => {
        api.error({
          message: "Error",
          description: `${err.message}`,
          placement: "topRight",
          style: {
            height: 80,
            width: getNotificationWidth(err.message),
          },
        });
      });
    }
  };

  const getInitialValues = () => {
    const form = localStorage.getItem("netem-form");
    return form ? JSON.parse(form) : defalutValues;
  };

  return (
    <div
      style={{
        alignItems: "center",
        paddingBottom: "1em",
      }}
    >
      <Form
        name="netem_form"
        layout="inline"
        onFinish={onFinish}
        onValuesChange={onValuesChange}
        initialValues={getInitialValues()}
        form={form}
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
          name="delayJitter"
          label="Delay Jitter"
          rules={[{ validator: checkGe0 }]}
          style={formItemStyle}
        >
          <MsInput />
        </Form.Item>
        <Form.Item
          name="delayCorrelation"
          label="Delay Correlation (%)"
          rules={[{ validator: checkPercentage }]}
          style={formItemStyle}
        >
          <PercentageInput />
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
        <Form.Item
          name="queue"
          label="Queue"
          rules={[{ validator: checkGe100 }]}
          style={formItemStyle}
        >
          <QueueInput />
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
      <p>
        Visit{" "}
        <a
          href="https://man7.org/linux/man-pages/man8/tc-netem.8.html"
          target="_blank"
        >
          tc-netem manual
        </a>{" "}
        for more about the parameters.
      </p>
    </div>
  );
};

export default NetemForm;
