import { useState } from "react";
import { Buffer, QueueInputProps, QueueValue } from "../FormUtils";
import { Input, Select } from "antd";

const { Option } = Select;

export const QueueInput: React.FC<QueueInputProps> = ({
  value = {},
  onChange,
}) => {
  const [number, setNumber] = useState<number>(0);
  const [unit, setUnit] = useState<Buffer>("Kbytes");

  const triggerChange = (changedValue: QueueValue) => {
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

  const onUnitChange = (newUnit: Buffer) => {
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
        style={{ width: 90, margin: "0 8px" }}
        onChange={onUnitChange}
      >
        <Option value="Kbytes">Kbytes</Option>
        <Option value="packets">packets</Option>
      </Select>
    </span>
  );
};
