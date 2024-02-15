import { useEffect, useState } from "react";
import "./App.css";
import History from "./components/History";
import { ConfigProvider, FloatButton, theme } from "antd";
import sun from "/sun.png";
import moon from "/moon.png";
import { DarkPrimeCol, LightPrimeCol } from "./consts";

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
          token: {
            colorPrimary: dark ? DarkPrimeCol : LightPrimeCol,
            colorLink: dark ? DarkPrimeCol : LightPrimeCol,
          },
        }}
      >
        <History dark={dark} />
        <FloatButton
          onClick={(_) => {
            setdark(!dark);
          }}
          icon={
            <img
              src={dark ? sun : moon}
              style={{
                width: "100%",
                height: "100%",
                marginTop: "0.17em",
                marginLeft: "0.01em",
              }}
            />
          }
        />
      </ConfigProvider>
    </div>
  );
}

export default App;
