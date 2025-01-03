import React from "react";
import FileUploadArea from "./components/FileUploadArea";
import ParallaxBackground from "./components/ParallaxBackground";
import { cn } from "../../utils";

const Upload: React.FC = () => {
  return (
    <div className="app-container relative flex items-center justify-center h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-purple-900">
      <ParallaxBackground />
      <div className="content-wrapper flex flex-col items-center z-10">
        <h1 className={cn("text-white text-4xl font-extrabold mb-8")}>
          Upload Your Files in Style
        </h1>
        <FileUploadArea />
      </div>
    </div>
  );
};

export default Upload;
