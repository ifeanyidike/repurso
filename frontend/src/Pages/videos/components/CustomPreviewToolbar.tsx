import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Sun,
  Monitor,
  Smartphone,
  Tablet,
  RotateCcw,
  Crop,
  Grid3X3,
  MessageSquare,
  Timer,
  Eye,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomPreviewToolbarProps {
  onDeviceChange: (device: string) => void;
  onPlaybackSpeedChange: (speed: number) => void;
  onVolumeChange: (volume: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  duration: string;
  currentTime: string;
}

const CustomPreviewToolbar = ({
  onDeviceChange,
  onPlaybackSpeedChange,
  onVolumeChange,
  isPlaying,
  onPlayPause,
  duration,
  currentTime,
}: CustomPreviewToolbarProps) => {
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
    onVolumeChange(newVolume[0]);
    if (newVolume[0] === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  return (
    <div className="bg-gray-900/95 text-white backdrop-blur-sm">
      {/* Main Controls */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/20"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/20"
            onClick={onPlayPause}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/20"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm font-medium">{currentTime}</span>
            <span className="text-sm text-gray-400">/</span>
            <span className="text-sm text-gray-400">{duration}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-white/20"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <div className="w-24">
              <Slider
                value={[isMuted ? 0 : volume]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* Device Preview */}
          <Select onValueChange={onDeviceChange}>
            <SelectTrigger className="w-32 h-8 border-white/20 bg-transparent text-white">
              <SelectValue placeholder="Desktop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desktop">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Desktop
                </div>
              </SelectItem>
              <SelectItem value="tablet">
                <div className="flex items-center gap-2">
                  <Tablet className="h-4 w-4" />
                  Tablet
                </div>
              </SelectItem>
              <SelectItem value="mobile">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Mobile
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Playback Speed */}
          <Select
            onValueChange={(value) => onPlaybackSpeedChange(Number(value))}
          >
            <SelectTrigger className="w-24 h-8 border-white/20 bg-transparent text-white">
              <SelectValue placeholder="1x" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.5">0.5x</SelectItem>
              <SelectItem value="1">1x</SelectItem>
              <SelectItem value="1.5">1.5x</SelectItem>
              <SelectItem value="2">2x</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {/* Preview Options */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-white/20"
                  onClick={() => setShowGrid(!showGrid)}
                >
                  <Grid3X3
                    className={`h-4 w-4 ${showGrid ? "text-blue-400" : ""}`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Grid</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-white/20"
                  onClick={() => setShowOverlays(!showOverlays)}
                >
                  <Eye
                    className={`h-4 w-4 ${showOverlays ? "text-blue-400" : ""}`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Overlays</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-white/20"
                  onClick={() => setShowCaptions(!showCaptions)}
                >
                  <MessageSquare
                    className={`h-4 w-4 ${showCaptions ? "text-blue-400" : ""}`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Captions</TooltipContent>
            </Tooltip>

            <div className="h-4 w-px bg-white/20 mx-2" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-white/20"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fullscreen</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Timeline (can be enhanced with markers, chapters, etc.) */}
      <div className="px-3 pb-3">
        <div className="relative">
          <Slider
            defaultValue={[0]}
            max={100}
            step={1}
            className="cursor-pointer"
          />
          {/* Example markers for key moments */}
          <div className="absolute top-1/2 left-[30%] -translate-y-1/2">
            <div className="w-1 h-3 bg-blue-400 rounded" />
          </div>
          <div className="absolute top-1/2 left-[60%] -translate-y-1/2">
            <div className="w-1 h-3 bg-blue-400 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomPreviewToolbar;
