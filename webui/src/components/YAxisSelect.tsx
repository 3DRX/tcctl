import { Checkbox } from "antd";

export enum ValueType {
  Delay = "delay",
  Loss = "loss",
  Rate = "rate",
}

export const YAxisSelect = (props: {
  checkState: {
    delay: boolean;
    loss: boolean;
    rate: boolean;
  };
  setcheckState: React.Dispatch<
    React.SetStateAction<{
      delay: boolean;
      loss: boolean;
      rate: boolean;
    }>
  >;
  queue: React.MutableRefObject<ValueType[]>;
}) => {
  const toogleSwitch = (n: ValueType) =>
    props.setcheckState((prev) => {
      return { ...prev, [n]: !prev[n] };
    });

  function handleSwitchChange(n: ValueType) {
    if (props.queue.current.find((item: ValueType) => item === n)) {
      props.queue.current = props.queue.current.filter(
        (item: ValueType) => item !== n,
      );
      toogleSwitch(n);
    } else {
      if (props.queue.current.length === 2) {
        const temp: ValueType | undefined = props.queue.current.shift();
        if (temp !== undefined) {
          toogleSwitch(temp);
          toogleSwitch(n);
          props.queue.current.push(n);
        }
      } else {
        props.queue.current.push(n);
        toogleSwitch(n);
      }
    }
  }

  return (
    <>
      <Checkbox
        checked={props.checkState.delay}
        onChange={() => handleSwitchChange(ValueType.Delay)}
      >
        Delay
      </Checkbox>
      <Checkbox
        checked={props.checkState.loss}
        onChange={() => handleSwitchChange(ValueType.Loss)}
      >
        Loss
      </Checkbox>
      <Checkbox
        checked={props.checkState.rate}
        onChange={() => handleSwitchChange(ValueType.Rate)}
      >
        Rate
      </Checkbox>
    </>
  );
};
