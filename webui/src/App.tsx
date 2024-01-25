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
        <History />
        <FloatButton
          onClick={(_) => {
            setdark(!dark);
          }}
          icon={dark ? "☀️" : "🌙"}
        />
      </ConfigProvider>
    </div>
  );
}

export default App;
