"use client";
import React, { useEffect, useRef, useState } from "react";
import Peaks, { PeaksInstance, PeaksOptions } from "peaks.js";
import { observer } from "mobx-react-lite";
import { stores } from "../../../store/Stores";
import { cn } from "../../../utils";

// import { createPointMarker, createSegmentMarker } from "./MarkerFactories";
// import { createSegmentLabel } from "./SegmentLabelFactory";

interface WaveformViewProps {
  audioUrl: string;
  audioContentType: string;
  waveformDataUrl?: string;
  audioContext?: AudioContext;
  setSegments?: (segments: any[]) => void;
  setPoints?: (points: any[]) => void;
  height?: string;
}

const WaveformView: React.FC<WaveformViewProps> = observer(
  ({
    audioUrl,
    audioContentType,
    waveformDataUrl,
    audioContext,
    setSegments,
    setPoints,
    height = "h-[50px]",
  }) => {
    const zoomviewWaveformRef = useRef<HTMLDivElement | null>(null);
    const overviewWaveformRef = useRef<HTMLDivElement | null>(null);
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    const timelineScale = stores.editorStore!.timelineStore.timelineScale;
    const waveformRefreshTrigger =
      stores.editorStore!.timelineStore.videoTriggerPlaceholder;

    const peaks = useRef<PeaksInstance | null>(null);

    useEffect(() => {
      console.log("audioUrl", audioUrl);
    }, [audioUrl]);
    useEffect(() => {
      console.log("WaveformComponent mounted", audioUrl);
      if (typeof window !== "undefined") {
        initPeaks();
      }
      // initPeaks();

      return () => {
        console.log("WaveformView unmounting");
        peaks.current?.destroy();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      console.log("WaveformComponent updated");
      if (typeof window !== "undefined") {
        initPeaks();
      }
      // initPeaks();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioUrl, waveformDataUrl, timelineScale, waveformRefreshTrigger]);

    const initPeaks = () => {
      const options: PeaksOptions = {
        overview: {
          container: overviewWaveformRef.current!,
        },
        zoomview: {
          container: zoomviewWaveformRef.current!,
        },
        showPlayheadTime: false,
        showAxisLabels: false,
        axisLabelColor: "black",
        axisGridlineColor: "black",
        waveformColor: "gray",

        mediaElement: audioElementRef.current!,
        keyboard: true,
        logger: console.error.bind(console),
        //   webAudio: {
        //     audioContext: audioContext,
        //   },
        //   createSegmentMarker: createSegmentMarker,
        //   createSegmentLabel: createSegmentLabel,
        //   createPointMarker: createPointMarker,
      };

      if (waveformDataUrl) {
        options.dataUri = {
          arraybuffer: waveformDataUrl,
        };
      } else {
        options.webAudio = {
          audioContext: new AudioContext(),
        } as any;
      }

      if (audioElementRef.current) {
        audioElementRef.current.src = audioUrl;
      }

      if (peaks) {
        peaks.current?.destroy();
      }

      Peaks.init(options, (err, peaksInstance) => {
        if (err) {
          console.error("Error initializing Peaks.js", err);
        } else {
          // setPeaks(peaksInstance);
          onPeaksReady(peaksInstance!);
        }
      });
    };

    const onPeaksReady = (peaksInstance: PeaksInstance) => {
      console.log("Peaks.js is ready");
      peaks.current = peaksInstance;
    };

    const zoomIn = () => {
      peaks.current?.zoom.zoomIn();
    };

    const zoomOut = () => {
      peaks.current?.zoom.zoomOut();
    };

    const addSegment = () => {
      if (peaks.current) {
        const time = peaks.current.player.getCurrentTime();

        peaks.current.segments.add({
          startTime: time,
          endTime: time + 10,
          labelText: "Test Segment",
          editable: true,
        });
      }
    };

    const addPoint = () => {
      if (peaks.current) {
        const time = peaks.current.player.getCurrentTime();

        peaks.current.points.add({
          time,
          labelText: "Test Point",
          editable: true,
        });
      }
    };

    //   const logMarkers = () => {
    //     if (peaks) {
    //       setSegments(peaks.segments.getSegments());
    //       setPoints(peaks.points.getPoints());
    //     }
    //   };

    return (
      <div
        className="w-full !bg-transparent mb-2"
        onClick={(e) =>
          console.log(
            "eeee",
            e.currentTarget.getBoundingClientRect(),
            e.currentTarget.offsetWidth
          )
        }
      >
        <div
          className={cn(
            "zoomview-container shadow-lg w-full leading-4 -z-10",
            height
          )}
          ref={overviewWaveformRef}
        ></div>

        <audio ref={audioElementRef} muted controls style={{ display: "none" }}>
          <source src={audioUrl} type={audioContentType} />
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }
);

export default WaveformView;
