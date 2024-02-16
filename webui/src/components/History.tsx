import { Button, Form, Select, notification } from "antd";
import { useEffect, useState } from "react";
import { postInterfaces } from "../utils.ts";
import Description from "./Description.tsx";
import { Control } from "./Control.tsx";
import { Chart } from "./Chart.tsx";

type option = {
  label: string;
  value: string;
};

export type HistoryProps = {
  dark: boolean;
};

const History: React.FC<HistoryProps> = (props) => {
  const [interfaces, setinterfaces] = useState<option[]>([]);
  const [nic, setnic] = useState<string>("");
  const [api, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();

  useEffect(() => {
    postInterfaces()
      .then((res) =>
        setinterfaces(
          Object.keys(res).map((nic) => ({ label: nic, value: nic })),
        ),
      )
      .catch((err) => console.log(err));
  }, []);

  return (
    <div style={{ alignItems: "center" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Description dark={props.dark} />
        <Form
          form={form}
          initialValues={{
            nicSelect: "Select a NIC",
          }}
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "1em",
            marginTop: "0.5em",
          }}
        >
          <Form.Item name="nicSelect">
            <Select
              defaultValue="Select a NIC"
              style={{
                width: 140,
              }}
              onChange={setnic}
              options={interfaces}
            />
          </Form.Item>
          <Button
            onClick={() => {
              setnic("");
              form.setFieldsValue({ nicSelect: "Select a NIC" });
            }}
            disabled={nic === ""}
          >
            Stop
          </Button>
        </Form>
      </div>
      <Chart dark={props.dark} nic={nic} api={api} />
      {contextHolder}
      <Control nic={nic} api={api} />
    </div>
  );
};

export default History;
