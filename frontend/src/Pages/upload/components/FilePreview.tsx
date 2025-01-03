import React from "react";
import ProgressBar from "./ProgressBar";
import { motion } from "framer-motion";

interface File {
  name: string;
  progress: number;
  size: string;
}

const files: File[] = [
  { name: "Image1.png", progress: 70, size: "2 MB" },
  { name: "Document.pdf", progress: 50, size: "4 MB" },
];

const FilePreview: React.FC = () => (
  <div className="file-preview-container mt-8">
    {files.map((file, index) => (
      <motion.div
        key={index}
        className="file-card bg-white bg-opacity-10 backdrop-blur-md p-4 rounded-lg mb-4"
        whileHover={{ scale: 1.02 }}
      >
        <div className="file-info flex justify-between items-center">
          <span className="text-white font-semibold">{file.name}</span>
          <span className="text-gray-400">{file.size}</span>
        </div>
        <ProgressBar progress={file.progress} />
      </motion.div>
    ))}
  </div>
);

export default FilePreview;
