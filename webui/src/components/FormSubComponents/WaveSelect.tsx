import { Select } from "antd";

export enum WaveType {
  Sine = "sine",
  Square = "square",
  Triangle = "triangle",
  Sawtooth = "saw",
}

type WaveSelectProps = {
  value?: WaveType;
  onChange?: (value: WaveType) => void;
};

export const WaveSelect: React.FC<WaveSelectProps> = (props) => {
  return (
    <Select
      defaultValue={props.value || WaveType.Sine}
      style={{ width: 110 }}
      options={[
        { value: WaveType.Sine, label: "Sine" },
        { value: WaveType.Square, label: "Square" },
        { value: WaveType.Triangle, label: "Triangle" },
        { value: WaveType.Sawtooth, label: "Sawtooth" },
      ]}
    />
  );
};
