import React, { useState, useEffect } from "react";
import { FiMinusCircle, FiPlusCircle } from "react-icons/fi";
import { observer } from "mobx-react-lite";
import { runInAction } from "mobx";
import { stores } from "../../store/Stores";
import { cn } from "../../utils";
import { themeStore } from "../../store/ThemeStore";

type Props = {
  timelineScale: number;
  defaultScale: number;
};

const TimelineZoomSlider: React.FC<Props> = observer((props) => {
  const { timelineScale, defaultScale } = props;
  const videoDuration = stores.editorStore!.videoDuration;

  const MIN_ZOOM = defaultScale * 2;
  const MAX_ZOOM = videoDuration / 200;
  const rangeDistance = MIN_ZOOM - MAX_ZOOM;

  function getRange(scale: number) {
    return ((MIN_ZOOM - scale) / rangeDistance) * 100;
  }
  function linearToLogScale(value: number) {
    const minLog = Math.log(MIN_ZOOM);
    const maxLog = Math.log(MAX_ZOOM);
    const scale = (Math.log(value) - minLog) / (maxLog - minLog);
    return scale * 100;
  }

  function logToLinearScale(percentage: number) {
    const minLog = Math.log(MIN_ZOOM);
    const maxLog = Math.log(MAX_ZOOM);
    const logValue = minLog + (percentage / 100) * (maxLog - minLog);
    return Math.exp(logValue); // Convert back to linear value
  }

  const [range, setRange] = useState(linearToLogScale(defaultScale));

  useEffect(() => {
    // const newRange = getRange(timelineScale);
    const newRange = linearToLogScale(timelineScale);
    setRange(newRange);
  }, [timelineScale]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    console.log("val", val);

    // const scale = MIN_ZOOM - (rangeDistance * val) / 100;
    const scale = logToLinearScale(val);
    console.log("scale", scale);
    setRange(val);
    // setTimelineScale(scale);
    runInAction(
      () => (stores.editorStore!.timelineStore.timelineScale = scale)
    );
  };

  const handleIncrease = () => {
    const newScale = Math.max(timelineScale / 1.5, MAX_ZOOM);

    if (newScale >= MAX_ZOOM) {
      // setTimelineScale(newScale);
      runInAction(
        () => (stores.editorStore!.timelineStore.timelineScale = newScale)
      );
      const newRange = linearToLogScale(newScale);
      setRange(newRange);
    }
  };

  const handleReduce = () => {
    const newScale = Math.min(timelineScale * 1.5, MIN_ZOOM); // Zoom in (increase the zoom scale)

    if (newScale <= MIN_ZOOM) {
      // setTimelineScale(newScale);
      runInAction(
        () => (stores.editorStore!.timelineStore.timelineScale = newScale)
      );
      const newRange = linearToLogScale(newScale);
      console.log("new range", newRange, newScale);
      setRange(newRange);
    }
  };

  return (
    <div className={cn("flex gap-1 items-center w-full")}>
      <button onClick={handleReduce}>
        <FiMinusCircle
          color={!themeStore.isDarkTheme ? "#fafafa" : "#191b1d"}
          size={14}
        />
      </button>

      <input
        onChange={onChange}
        type="range"
        className={cn(
          "w-full timeline-zoom-range",
          themeStore.isDarkTheme && "!bg-[#191b1d]"
        )}
        value={range}
        min={0}
        max={100}
      />

      <button onClick={handleIncrease}>
        <FiPlusCircle
          color={!themeStore.isDarkTheme ? "#fafafa" : "#191b1d"}
          size={14}
        />
      </button>
    </div>
  );
});

export default TimelineZoomSlider;
