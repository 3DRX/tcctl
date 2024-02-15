import { Input, Select, Switch } from "antd";
import React, { useState } from "react";
import { LossInputProps, LossPattern, LossValue } from "./NetemForm";
import { getOnFloatNumberChange } from "./FormUtils";

const { Option } = Select;

export const LossInput: React.FC<LossInputProps> = ({
  value = {},
  onChange,
}) => {
  const [pattern, setpattern] = useState(LossPattern.Random);
  const [randomPercent, setrandomPercent] = useState("0");
  const [randomCorrelation, setrandomCorrelation] = useState("0");
  const [stateP13, setstateP13] = useState(0);
  const [stateP31, setstateP31] = useState(0);
  const [stateP32, setstateP32] = useState(0);
  const [stateP23, setstateP23] = useState(0);
  const [stateP14, setstateP14] = useState(0);
  const [gemodelP, setgemodelP] = useState(0);
  const [gemodelR, setgemodelR] = useState(0);
  const [gemodel1H, setgemodel1H] = useState(0);
  const [gemodel1K, setgemodel1K] = useState(0);
  const [ecn, setecn] = useState(false);

  const triggerChange = (changedValue: LossValue) => {
    onChange?.({ ...value, ...changedValue });
  };

  const renderLossInput = () => {
    if (pattern === LossPattern.Random) {
      return (
        <>
          <>percent</>
          <Input
            type="text"
            value={value.randomPercent || randomPercent}
            onChange={getOnFloatNumberChange(
              setrandomPercent,
              ({ number: number }) => {
                triggerChange({ randomPercent: number });
              },
            )}
            style={{ width: 50 }}
          />
          <>correlation</>
          <Input
            type="text"
            value={value.randomCorrelation || randomCorrelation}
            onChange={getOnFloatNumberChange(
              setrandomCorrelation,
              ({ number: number }) => {
                triggerChange({ randomCorrelation: number });
              },
            )}
            style={{ width: 50 }}
          />
        </>
      );
    } else if (pattern === LossPattern.State) {
      return (
        <>
          <>p13</>
          <Input
            type="text"
            value={value.stateP13 || stateP13}
            onChange={(e) => {
              const newStateP13 = parseInt(e.target.value || "0", 10);
              if (Number.isNaN(stateP13)) {
                return;
              }
              if (!("stateP13" in value)) {
                setstateP13(newStateP13);
              }
              triggerChange({ stateP13: newStateP13 });
            }}
            style={{ width: 50 }}
          />
          <>p31</>
          <Input
            type="text"
            value={value.stateP31 || stateP31}
            onChange={(e) => {
              const newStateP31 = parseInt(e.target.value || "0", 10);
              if (Number.isNaN(stateP31)) {
                return;
              }
              if (!("stateP31" in value)) {
                setstateP31(newStateP31);
              }
              triggerChange({ stateP31: newStateP31 });
            }}
            style={{ width: 50 }}
          />
          <>p32</>
          <Input
            type="text"
            value={value.stateP32 || stateP32}
            onChange={(e) => {
              const newStateP32 = parseInt(e.target.value || "0", 10);
              if (Number.isNaN(stateP32)) {
                return;
              }
              if (!("stateP32" in value)) {
                setstateP32(newStateP32);
              }
              triggerChange({ stateP32: newStateP32 });
            }}
            style={{ width: 50 }}
          />
          <>p23</>
          <Input
            type="text"
            value={value.stateP23 || stateP23}
            onChange={(e) => {
              const newStateP23 = parseInt(e.target.value || "0", 10);
              if (Number.isNaN(stateP23)) {
                return;
              }
              if (!("stateP23" in value)) {
                setstateP23(newStateP23);
              }
              triggerChange({ stateP23: newStateP23 });
            }}
            style={{ width: 50 }}
          />
          <>p14</>
          <Input
            type="text"
            value={value.stateP14 || stateP14}
            onChange={(e) => {
              const newStateP14 = parseInt(e.target.value || "0", 10);
              if (Number.isNaN(stateP14)) {
                return;
              }
              if (!("stateP14" in value)) {
                setstateP14(newStateP14);
              }
              triggerChange({ stateP14: newStateP14 });
            }}
            style={{ width: 50 }}
          />
        </>
      );
    } else if (pattern === LossPattern.Gemodel) {
      return (
        <>
          <>P</>
          <Input
            type="text"
            value={value.gemodelP || gemodelP}
            onChange={(e) => {
              const newGemodelP = parseInt(e.target.value || "0", 10);
              if (Number.isNaN(gemodelP)) {
                return;
              }
              if (!("gemodelP" in value)) {
                setgemodelP(newGemodelP);
              }
              triggerChange({ gemodelP: newGemodelP });
            }}
            style={{ width: 50 }}
          />
          <>R</>
          <Input
            type="text"
            value={value.gemodelR || gemodelR}
            onChange={(e) => {
              const newGemodelR = parseInt(e.target.value || "0", 10);
              if (Number.isNaN(gemodelR)) {
                return;
              }
              if (!("gemodelR" in value)) {
                setgemodelR(newGemodelR);
              }
              triggerChange({ gemodelR: newGemodelR });
            }}
            style={{ width: 50 }}
          />
          <>1-H</>
          <Input
            type="text"
            value={value.gemodel1H || gemodel1H}
            onChange={(e) => {
              const newGemodel1H = parseInt(e.target.value || "0", 10);
              if (Number.isNaN(gemodel1H)) {
                return;
              }
              if (!("gemodel1H" in value)) {
                setgemodel1H(newGemodel1H);
              }
              triggerChange({ gemodel1H: newGemodel1H });
            }}
            style={{ width: 50 }}
          />
          <>1-K</>
          <Input
            type="text"
            value={value.gemodel1K || gemodel1K}
            onChange={(e) => {
              const newGemodel1K = parseInt(e.target.value || "0", 10);
              if (Number.isNaN(gemodel1K)) {
                return;
              }
              if (!("gemodel1K" in value)) {
                setgemodel1K(newGemodel1K);
              }
              triggerChange({ gemodel1K: newGemodel1K });
            }}
            style={{ width: 50 }}
          />
        </>
      );
    } else {
      return null;
    }
  };

  return (
    <span>
      <Select
        value={value.pattern || pattern}
        style={{ width: 135, margin: "0 8px" }}
        onChange={(newPattern) => {
          setpattern(newPattern);
          switch (newPattern) {
            case LossPattern.Random:
              setstateP13(0);
              setstateP31(0);
              setstateP32(0);
              setstateP23(0);
              setstateP14(0);
              setgemodelP(0);
              setgemodelR(0);
              setgemodel1H(0);
              setgemodel1K(0);
              triggerChange({
                pattern: newPattern,
                stateP13: 0,
                stateP31: 0,
                stateP32: 0,
                stateP23: 0,
                stateP14: 0,
                gemodelP: 0,
                gemodelR: 0,
                gemodel1H: 0,
                gemodel1K: 0,
              });
              break;
            case LossPattern.State:
              setrandomPercent("0");
              setrandomCorrelation("0");
              setgemodelP(0);
              setgemodelR(0);
              setgemodel1H(0);
              setgemodel1K(0);
              triggerChange({
                pattern: newPattern,
                randomPercent: 0,
                randomCorrelation: 0,
                gemodelP: 0,
                gemodelR: 0,
                gemodel1H: 0,
                gemodel1K: 0,
              });
              break;
            case LossPattern.Gemodel:
              setrandomPercent("0");
              setrandomCorrelation("0");
              setstateP13(0);
              setstateP31(0);
              setstateP32(0);
              setstateP23(0);
              setstateP14(0);
              triggerChange({
                pattern: newPattern,
                randomPercent: 0,
                randomCorrelation: 0,
                stateP13: 0,
                stateP31: 0,
                stateP32: 0,
                stateP23: 0,
                stateP14: 0,
              });
              break;
            default:
              break;
          }
        }}
      >
        <Option value="random">random</Option>
        <Option value="state">4 state Markov</Option>
        <Option value="gemodel">Gilbert Elliot</Option>
      </Select>
      {renderLossInput()}
      <>ecn</>
      <Switch
        defaultChecked={value.ecn || ecn}
        onChange={(checked) => {
          setecn(checked);
          triggerChange({ ecn: checked });
        }}
        style={{
          marginLeft: "4px",
        }}
      />
    </span>
  );
};
