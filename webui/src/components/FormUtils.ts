// returns the onChange function for float number inputs
export function getOnFloatNumberChange(
  setNumber: React.Dispatch<React.SetStateAction<string>>,
  triggerChange: (changedValue: any) => void,
) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length === 0) {
      setNumber("0");
      triggerChange({ number: 0 });
      return;
    }
    const newNumber = parseFloat(e.target.value || "0");
    if (Number.isNaN(newNumber)) {
      return;
    }
    if (e.target.value[e.target.value.length - 1] === ".") {
      setNumber(e.target.value);
    } else {
      setNumber(newNumber.toString());
      triggerChange({ number: newNumber });
    }
  };
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

