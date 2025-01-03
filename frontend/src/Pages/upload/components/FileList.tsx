import React, { useState } from "react";
import { List, Progress, Button } from "antd";
import { motion } from "framer-motion";
import { CheckCircleTwoTone, UploadOutlined } from "@ant-design/icons";

interface File {
  name: string;
  size: number;
  progress: number;
}

const FileList: React.FC = () => {
  const [files, setFiles] = useState<File[]>([
    { name: "image1.png", size: 2048, progress: 70 },
    { name: "video.mp4", size: 8192, progress: 50 },
  ]);

  return (
    <div className="mt-8 w-full md:w-3/4 lg:w-2/3">
      <List
        dataSource={files}
        renderItem={(file) => (
          <List.Item>
            <div className="flex items-center w-full">
              <motion.div
                className="mr-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                {file.progress === 100 ? (
                  <CheckCircleTwoTone
                    twoToneColor="#52c41a"
                    className="text-2xl"
                  />
                ) : (
                  <UploadOutlined className="text-2xl text-yellow-500" />
                )}
              </motion.div>
              <div className="w-full">
                <div className="text-white font-medium">{file.name}</div>
                <div className="text-gray-300 text-xs">{file.size} KB</div>
                <Progress
                  percent={file.progress}
                  strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
                  showInfo={false}
                  className="mt-2"
                />
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default FileList;
