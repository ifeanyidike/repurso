import React from "react";

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => (
  <div className="relative w-full h-4 bg-gray-300 rounded-md mt-2 overflow-hidden">
    <div
      className="absolute !text-white h-full bg-gradient-to-r from-pink-500 to-yellow-500"
      style={{ width: `${progress}%` }}
    />
  </div>
);

export default ProgressBar;
