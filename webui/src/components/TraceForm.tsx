import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { Button, Upload, List } from "antd";
import { useEffect, useState } from "react";
import { isTracefileValid, sendTraceLine } from "../utils";

export interface TraceFormProps {
  nic: string;
}

const TraceForm: React.FC<TraceFormProps> = ({ nic }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [data, setdata] = useState<string[]>([]);
  const [currentData, setcurrentData] = useState<string[]>([]);
  const [startTrace, setstartTrace] = useState(false);

  const uploadProps: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
    accept: ".txt",
    disabled: startTrace,
  };

  useEffect(() => {
    if (!startTrace || data.length === 0) {
      return;
    } else {
      const intervalId = setInterval(() => {
        const dat: any = data.shift();
        if (currentData.length === 5) {
          currentData.shift();
        }
        const datSplit: string[] = dat.split(" ");
        setcurrentData([
          ...currentData,
          `delay ${datSplit[0]}ms, loss ${datSplit[1]}%, rate ${datSplit[2]}Mbps`,
        ]);
        const flag = sendTraceLine(dat, nic);
        if (!flag) {
          console.log(`Error: send ${dat} to ${nic}`);
        }
        if (data.length === 0) {
          // stop interval
          setstartTrace(false);
        }
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [startTrace, currentData]);

  const onConfirm = () => {
    if (fileList.length === 1) {
      const file: any = fileList[0];
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          if (isTracefileValid(e.target.result)) {
            console.log("Valid trace file");
            const dat = e.target.result.split("\n");
            dat.pop();
            setdata(dat);
            setcurrentData([]);
            setstartTrace(true);
          } else {
            console.log("Invalid trace file");
            setFileList([]);
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

  return (
    <div>
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
        onClick={onConfirm}
        style={{ marginTop: "1em", marginBottom: "1em" }}
      >
        Start
      </Button>
      <List
        size="small"
        bordered
        dataSource={currentData}
        renderItem={(item) => <List.Item>{item}</List.Item>}
      />
    </div>
  );
};

export default TraceForm;
