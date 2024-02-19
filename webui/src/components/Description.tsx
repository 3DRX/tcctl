import { HeartTwoTone } from "@ant-design/icons";
import { DarkPrimeCol, LightPrimeCol } from "../consts";
import { memo } from "react";

export type DescriptionProps = {
  dark: boolean;
};

function Description(props: DescriptionProps) {
  return (
    <div
      style={{
        position: "absolute",
        left: "2ex",
        marginTop: "-1.5em",
      }}
    >
      <h4
        style={{
          color: props.dark ? "white" : "black",
          fontFamily: "monospace",
        }}
      >
        made with{" "}
        <HeartTwoTone
          twoToneColor={props.dark ? DarkPrimeCol : LightPrimeCol}
        />{" "}
        by{" "}
        <a
          href="https://github.com/3DRX"
          target="_blank"
          style={{
            fontWeight: "bold",
            color: props.dark ? DarkPrimeCol : LightPrimeCol,
          }}
        >
          3DRX
        </a>
      </h4>
    </div>
  );
}

export default memo(Description);
