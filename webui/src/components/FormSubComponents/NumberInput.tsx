import { useState } from "react";
import { getOnFloatNumberChange } from "../FormUtils";
import { Input } from "antd";

export interface NumberInputProps {
  value?: number;
  onChange?: (value: number) => void;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
}) => {
  const [number, setNumber] = useState<string>("0");

  const triggerChange = (changedValue: number) => {
    onChange?.(changedValue);
  };

  return (
    <Input
      type="text"
      value={value || number}
      onChange={getOnFloatNumberChange(setNumber, ({ number: number }) => {
        triggerChange(number);
      })}
      style={{ width: 70 }}
    />
  );
};
