import { useEffect, useState } from "react";
import "./App.css";
import History from "./components/History";
import { ConfigProvider, FloatButton, theme } from "antd";

function App() {
  const [dark, setdark] = useState(localStorage.getItem("dark") === "true");

  useEffect(() => {
    localStorage.setItem("dark", JSON.stringify(dark));
    document.documentElement.style.setProperty(
      "--color-background",
      dark ? "black" : "white",
    );
  }, [dark]);

  function genIcon(ico: string) {
    return (
      <div style={{ marginLeft: "-0.2ex", marginTop: "0.2ex" }}>{ico}</div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: dark ? "black" : "white",
      }}
    >
      <ConfigProvider
        theme={{
          algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        <History dark={dark} />
        <FloatButton
          onClick={(_) => {
            setdark(!dark);
          }}
          icon={genIcon(dark ? "☀️" : "🌙")}
        />
      </ConfigProvider>
    </div>
  );
}

export default App;
