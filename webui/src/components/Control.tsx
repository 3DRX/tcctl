import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { useEffect, useState } from "react";
import NetemForm from "./NetemForm.tsx";
import TraceForm from "./TraceForm.tsx";
import { putNetem } from "../utils.ts";
import { NotificationInstance } from "antd/es/notification/interface";
import { NICPlaceholder } from "../consts.ts";
import { TraceGenerator } from "./TraceGenerator.tsx";

type ControlProps = {
  nic: string;
  api: NotificationInstance;
};

export const Control: React.FC<ControlProps> = ({ nic, api }) => {
  const [tab, settab] = useState<string>(localStorage.getItem("tab") || "1");

  useEffect(() => {
    localStorage.setItem("tab", tab);
  }, [tab]);

  const tabItems: TabsProps["items"] = [
    {
      key: "1",
      label: "Manual",
      children: <NetemForm nic={nic} api={api} />,
    },
    {
      key: "2",
      label: "Trace",
      children: <TraceForm nic={nic} api={api} />,
    },
    {
      key: "3",
      label: "Trace Generator",
      children: <TraceGenerator />,
    },
  ];

  const onTabChange = (key: string) => {
    settab(key);
    if (nic === NICPlaceholder) {
      return;
    }
    putNetem({
      nic: nic,
      delayMs: -1,
      lossRandomPercent: -1,
      rateKbps: -1,
      corruptPercent: -1,
      duplicatePercent: -1,
      reorderPercent: -1,
    }).catch((err: Error) => {
      api.error({
        message: "Error",
        description: `${err.message}`,
        placement: "topRight",
        style: {
          height: 85,
        },
      });
    });
  };

  return (
    <>
      <div style={{ width: "80vw", marginLeft: "auto", marginRight: "auto" }}>
        <Tabs defaultActiveKey={tab} items={tabItems} onChange={onTabChange} />
      </div>
    </>
  );
};
