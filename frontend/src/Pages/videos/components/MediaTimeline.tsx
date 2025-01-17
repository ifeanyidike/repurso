import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Image as ImageIcon,
  Music,
  Type,
  Film,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const TimelineRuler = ({ duration, zoom, offset }) => {
  const markers = [];
  const markerInterval = 1; // 1-second intervals at base zoom
  const scaledInterval = markerInterval / zoom;
  const totalMarkers = Math.ceil(duration / scaledInterval);
  const visibleMarkers = Math.ceil(100 / zoom);

  for (
    let i = Math.floor(offset);
    i <= Math.min(totalMarkers, offset + visibleMarkers);
    i++
  ) {
    const position = (i / duration) * 100 * zoom - offset * 100;
    markers.push(
      <div
        key={i}
        className="absolute h-full border-l border-gray-300"
        style={{ left: `${position}%` }}
      >
        {i % Math.ceil(scaledInterval * 10) === 0 && (
          <div className="text-xs text-gray-500 transform -translate-x-1/2 mt-2">
            {formatTime(i)}
          </div>
        )}
      </div>
    );
  }

  return <div className="relative h-10 bg-gray-50">{markers}</div>;
};

const WaveformTrack = ({ isAudio }) => {
  const waveformPoints = Array.from(
    { length: 200 },
    () => Math.random() * (isAudio ? 40 : 20) + (isAudio ? 10 : 30)
  );

  return (
    <div className="h-24 bg-gray-800 relative overflow-hidden">
      <svg width="100%" height="100%" preserveAspectRatio="none">
        <path
          d={`M0,50 ${waveformPoints
            .map(
              (point, i) =>
                `L${(i / waveformPoints.length) * 100} ${50 - point} L${
                  (i / waveformPoints.length) * 100
                } ${50 + point}`
            )
            .join(" ")}`}
          fill="none"
          stroke={isAudio ? "#60A5FA" : "#4ADE80"}
          strokeWidth="1"
          className="opacity-75"
        />
      </svg>
    </div>
  );
};

const ImageTrack = ({ images }) => (
  <div className="flex gap-2 overflow-x-auto">
    {images.map((img, index) => (
      <div
        key={index}
        className="h-20 w-32 bg-gray-900 rounded-md flex-shrink-0 relative group"
      >
        <img
          src={img.thumbnail}
          alt={`Thumbnail ${index}`}
          className="w-full h-full object-cover rounded-md"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center">
          <p className="text-white text-xs">{formatTime(img.startTime)}</p>
        </div>
      </div>
    ))}
  </div>
);

const MediaTimeline = ({ duration, selectedContent }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [scrollOffset, setScrollOffset] = useState(0);
  const containerRef = useRef();

  const handleZoom = (direction) => {
    const newZoom = Math.max(0.5, Math.min(4, zoom + direction * 0.5));
    setZoom(newZoom);
  };

  const handleScroll = (e) => {
    const newOffset = Math.max(0, scrollOffset - e.deltaY / 100);
    setScrollOffset(newOffset);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) container.addEventListener("wheel", handleScroll);
    return () => {
      if (container) container.removeEventListener("wheel", handleScroll);
    };
  }, [scrollOffset]);

  const sampleImages = [
    { thumbnail: "https://placehold.co/320x180", startTime: 15 },
    { thumbnail: "https://placehold.co/320x180", startTime: 45 },
  ];

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}>
            <SkipBack />
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause /> : <Play />}
          </button>
          <button
            onClick={() => setCurrentTime(Math.min(duration, currentTime + 5))}
          >
            <SkipForward />
          </button>
          <span className="text-white font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleZoom(-1)}>
            <ZoomOut />
          </button>
          <button onClick={() => handleZoom(1)}>
            <ZoomIn />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative h-64 overflow-x-auto"
        style={{ width: `${100 * zoom}%` }}
      >
        <TimelineRuler duration={duration} zoom={zoom} offset={scrollOffset} />
        <WaveformTrack isAudio={true} />
        <ImageTrack images={sampleImages} />
      </div>

      <div className="bg-gray-800 p-4">
        <Slider
          value={[currentTime]}
          min={0}
          max={duration}
          step={0.1}
          onValueChange={([value]) => setCurrentTime(value)}
        />
      </div>
    </div>
  );
};

export default MediaTimeline;
