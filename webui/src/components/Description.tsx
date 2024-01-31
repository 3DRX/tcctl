import { HeartTwoTone } from "@ant-design/icons";

export type DescriptionProps = {
  dark: boolean;
  style?: React.CSSProperties;
};

function Description(props: DescriptionProps) {
  return (
    <div
      style={{
        ...props.style,
        position: "absolute",
        left: "1ex",
      }}
    >
      <h4
        style={{
          color: props.dark ? "white" : "black",
          fontFamily: "monospace",
        }}
      >
        made with <HeartTwoTone twoToneColor="#eb2f96" /> by{" "}
        <a
          href="https://github.com/3DRX"
          target="_blank"
          style={{
            fontWeight: "bold",
          }}
        >
          3DRX
        </a>
      </h4>
    </div>
  );
}

export default Description;
