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
