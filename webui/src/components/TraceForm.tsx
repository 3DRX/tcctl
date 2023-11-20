import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { Button, Upload } from "antd";
import { useState } from "react";
import { isTracefileValid } from "../utils";

export interface TraceFormProps {
  nic: string;
}

const TraceForm: React.FC<TraceFormProps> = ({ nic }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

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
  };

  const onConfirm = () => {
    if (fileList.length === 1) {
      const file: any = fileList[0];
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          if (isTracefileValid(e.target.result)) {
            console.log("Valid trace file");
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
        <Button icon={<UploadOutlined />} disabled={fileList.length >= 1}>
          Select File
        </Button>
      </Upload>
      <Button
        disabled={fileList.length === 0}
        onClick={onConfirm}
        style={{ marginTop: "1em" }}
      >
        Confirm
      </Button>
    </div>
  );
};

export default TraceForm;
