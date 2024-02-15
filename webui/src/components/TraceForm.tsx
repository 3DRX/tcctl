import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { Button, Upload, List, message } from "antd";
import { useEffect, useState } from "react";
import { isTracefileValid, sendTraceLine } from "../utils";
import { NotificationInstance } from "antd/es/notification/interface";

export interface TraceFormProps {
  nic: string;
  api: NotificationInstance;
}

const TraceForm: React.FC<TraceFormProps> = ({ nic, api }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [data, setdata] = useState<string[]>([]);
  const [currentData, setcurrentData] = useState<string[]>([]);
  const [startTrace, setstartTrace] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!startTrace || data.length === 0) {
      return;
    } else {
      const intervalId = setInterval(() => {
        const dat = data.shift()!;
        const datSplit: string[] = dat.split(" ");
        setcurrentData([
          ...currentData,
          `delay ${datSplit[0]}ms, loss ${datSplit[1]}%, rate ${datSplit[2]}Mbps`,
        ]);
        sendTraceLine(dat, nic, api);
        if (data.length === 0) {
          // stop interval
          setstartTrace(false);
        }
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [startTrace, currentData]);

  const onConfirm = (e: any) => {
    e.preventDefault();
    if (fileList.length === 1) {
      const file: any = fileList[0];
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          if (isTracefileValid(e.target.result)) {
            messageApi.success(`${file.name} uploaded successfully`);
            const dat = e.target.result.split("\n");
            dat.pop();
            setdata(dat);
            setcurrentData([]);
            setstartTrace(true);
          } else {
            messageApi.error(`${file.name} is invalid trace file`);
            const theFile = fileList[0];
            theFile.status = "error";
            theFile.response = "Invalid trace file";
            setFileList([theFile]);
            return;
          }
        };
        reader.readAsText(file);
      } else {
        console.log(`Error: File ${file.name} is not a text file`);
        setFileList([]);
        return;
      }
    } else {
      console.log(`Error: ${fileList}`);
      setFileList([]);
      return;
    }
  };

  const uploadProps: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
      setcurrentData([]);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
    accept: ".txt",
    disabled: startTrace,
  };

  return (
    <div>
      {contextHolder}
      <div
        style={{
          display: "flex",
          gap: "1em",
          marginTop: "-0.5em",
        }}
      >
        <div style={{ flex: 2 }}>
          <List
            size="small"
            locale={{ emptyText: "No data" }}
            dataSource={currentData}
            renderItem={(item) => <List.Item>{item}</List.Item>}
            style={{
              marginBottom: "1em",
              marginTop: "-0.5em",
              flexDirection: "column-reverse",
            }}
            header={<div>Trace History</div>}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1em",
            width: "100%",
            maxWidth: "40vw",
            flex: 1,
            marginTop: "1em",
          }}
        >
          <Upload {...uploadProps}>
            <Button
              icon={<UploadOutlined />}
              disabled={fileList.length >= 1 || nic === ""}
              onClick={() => setcurrentData([])}
            >
              Select File
            </Button>
          </Upload>
          <Button
            disabled={fileList.length === 0 || startTrace}
            loading={startTrace}
            htmlType={undefined}
            onClick={onConfirm}
            type="primary"
            style={{
              width: "100%",
              maxWidth: "8.5em",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Start
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TraceForm;
