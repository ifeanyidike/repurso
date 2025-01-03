import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, message, Progress, UploadProps } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import ParticleEffect from "./ParticleEffect";
import { files } from "../../../service/Files";

const { Dragger } = Upload;

const FileUploadArea: React.FC = () => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploadComplete, setIsUploadComplete] = useState<boolean>(false);

  // Add a Set to track files that are being processed
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(
    new Set()
  );

  const handleDragEnter = (): void => setIsDragging(true);
  const handleDragLeave = (): void => setIsDragging(false);
  const handleDrop = (): void => setIsDragging(false);

  const props: UploadProps = {
    name: "file",
    multiple: true,
    showUploadList: false,
    customRequest: async ({ file, onProgress, onSuccess, onError }) => {
      const fileName = (file as File).name;

      // Check if the file is already being processed
      if (processingFiles.has(fileName)) {
        message.warning(`${fileName} is already being uploaded.`);
        return;
      }

      // Add the file to the processingFiles Set
      setProcessingFiles((prev) => new Set(prev).add(fileName));

      try {
        setUploadingFile(true);
        setIsUploadComplete(false);
        setUploadProgress(0);

        const { success, error } = await files.uploadVideo(
          file as File,
          (loaded: number, total: number) => {
            const percent = Math.round((loaded / total) * 100);
            setUploadProgress(percent);
          }
        );

        if (success) {
          onSuccess && onSuccess("File uploaded successfully");
          message.success(success);
          setIsUploadComplete(true);
          setTimeout(() => setUploadingFile(false), 1000);
        } else {
          onError && onError(new Error(error));
          message.error(error);
          setUploadingFile(false);
        }
      } catch (error) {
        setUploadingFile(false);
        message.error("Upload failed.");
        onError && onError(new Error("Upload failed"));
      } finally {
        // Remove the file from the processingFiles Set
        setProcessingFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(fileName);
          return newSet;
        });
      }
    },
  };

  return (
    <div className="flex items-center justify-center w-[800px] h-[500px]">
      <motion.div
        className={`upload-area relative rounded-xl p-0 w-full h-full transition-all transform ${
          isDragging
            ? "border-blue-400 scale-105 shadow-2xl"
            : "border-gray-600"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Dragger
          {...props}
          className="ant-upload-drag  !bg-transparent !text-white !text-3xl"
          accept=".mp4, .mov"
        >
          <div className="flex flex-col items-center">
            {isDragging && <ParticleEffect />}
            <motion.div
              className="mb-6"
              animate={{ scale: isDragging ? 1.2 : 1 }}
              transition={{ type: "spring", stiffness: 150 }}
            >
              <InboxOutlined style={{ fontSize: "60px", color: "#00b4d8" }} />
            </motion.div>
            <p className="text-2xl font-semibold text-white mb-2">
              Drag & Drop Files Here
            </p>
            <p className="text-base text-gray-400">
              or{" "}
              <span className="text-blue-400 underline cursor-pointer">
                Browse Files
              </span>
            </p>
            {uploadingFile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full mt-6"
              >
                <Progress
                  percent={uploadProgress}
                  strokeColor={{
                    "0%": "#00b4d8",
                    "100%": isUploadComplete ? "#52c41a" : "#0077b6",
                  }}
                  status={isUploadComplete ? "success" : "active"}
                  className="rounded-lg bg-gray-700 shadow-lg"
                  trailColor="transparent"
                />
                {isUploadComplete && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center text-green-500 font-semibold mt-2"
                  >
                    Upload Complete!
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </Dragger>
      </motion.div>
    </div>
  );
};

export default FileUploadArea;
