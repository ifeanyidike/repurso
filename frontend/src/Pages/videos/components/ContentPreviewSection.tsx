import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import CustomPreviewToolbar from "./CustomPreviewToolbar";
import { Pause, Play } from "lucide-react";

const ContentPreviewSection = ({ content }: any) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState("desktop");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const getPreviewScale = () => {
    switch (selectedDevice) {
      case "mobile":
        return "w-[375px]";
      case "tablet":
        return "w-[768px]";
      default:
        return "w-full max-w-6xl";
    }
  };

  return (
    <div className="flex-1 bg-[#1a1a1a] flex flex-col">
      {/* Content Preview Area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden p-8">
        <div className={`relative ${getPreviewScale()} aspect-video group`}>
          <img
            src={content.thumbnail}
            alt={content.title}
            className="w-full h-full object-cover rounded-lg shadow-2xl"
          />
          {content.status === "ready" && (
            <Button
              size="lg"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>
          )}
          {content.status === "processing" && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4" />
                <p className="text-lg font-medium mb-2">Processing...</p>
                <Progress
                  value={content.processingProgress}
                  className="w-48 mx-auto"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Toolbar */}
      <CustomPreviewToolbar
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onDeviceChange={setSelectedDevice}
        onPlaybackSpeedChange={setPlaybackSpeed}
        onVolumeChange={(volume) => console.log("Volume changed:", volume)}
        duration="5:24"
        currentTime="2:15"
      />
    </div>
  );
};

export default ContentPreviewSection;
