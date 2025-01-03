import React, {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ScrollSync } from "react-virtualized";
import { ITimelineEngine, TimelineEngine } from "../engine/engine";
import { MIN_SCALE_COUNT, PREFIX, START_CURSOR_TIME } from "../interface/const";
import {
  TimelineEditor,
  TimelineRow,
  TimelineState,
} from "../interface/timeline";
import { checkProps } from "../utils/check_props";
import {
  getScaleCountByRows,
  parserPixelToTime,
  parserTimeToPixel,
} from "../utils/deal_data";
import { Cursor } from "./cursor/cursor";
import { EditArea } from "./edit_area/edit_area";
import { TimeArea } from "./time_area/time_area";
import WaveformView from "./WaveformData";
import { stores } from "../../../store/Stores";
import { observer } from "mobx-react-lite";
import { cn } from "../../../utils";

export const Timeline = observer(
  React.forwardRef<TimelineState, TimelineEditor>((props, ref) => {
    const checkedProps = checkProps(props);
    const { style, currentCursorTime } = props;
    let {
      effects,
      editorData: data,
      scrollTop,
      autoScroll,
      hideCursor,
      disableDrag,
      scale,
      scaleWidth,
      startLeft,
      minScaleCount,
      maxScaleCount,
      onChange,
      engine,
      autoReRender = true,
      onScroll: onScrollVertical,
    } = checkedProps;

    const engineRef = useRef<ITimelineEngine>(engine || new TimelineEngine());
    const domRef = useRef<HTMLDivElement>(null);
    const areaRef = useRef<HTMLDivElement>();
    const scrollSync = useRef<ScrollSync>(null);

    const [editorData, setEditorData] = useState(data);

    const [scaleCount, setScaleCount] = useState(MIN_SCALE_COUNT);

    const [cursorTime, setCursorTime] = useState(START_CURSOR_TIME);

    const [isPlaying, setIsPlaying] = useState(false);

    const [width, setWidth] = useState(Number.MAX_SAFE_INTEGER);

    useLayoutEffect(() => {
      handleSetScaleCount(getScaleCountByRows(data, { scale: scale! }));
      setEditorData(data);
    }, [data, minScaleCount, maxScaleCount, scale]);

    useEffect(() => {
      engineRef.current.effects = effects;
    }, [effects]);

    useEffect(() => {
      engineRef.current.data = editorData;
    }, [editorData]);

    useEffect(() => {
      autoReRender && engineRef.current.reRender();
    }, [editorData]);

    // deprecated
    useEffect(() => {
      scrollSync.current &&
        scrollSync.current.setState({ scrollTop: scrollTop! });
    }, [scrollTop]);

    /** 动态设置scale count */
    const handleSetScaleCount = (value: number) => {
      const data = Math.min(maxScaleCount!, Math.max(minScaleCount!, value));
      setScaleCount(data);
    };

    /** 处理主动数据变化 */
    const handleEditorDataChange = (editorData: TimelineRow[]) => {
      const result = onChange && onChange(editorData);
      if (result !== false) {
        engineRef.current.data = editorData;
        autoReRender && engineRef.current.reRender();
      }
    };

    /** 处理光标 */
    const handleSetCursor = (param: {
      left?: number;
      time?: number;
      updateTime?: boolean;
    }) => {
      let { left, time, updateTime = true } = param;
      if (typeof left === "undefined" && typeof time === "undefined") return;

      if (typeof time === "undefined") {
        if (typeof left === "undefined")
          left = parserTimeToPixel(time!, {
            startLeft: startLeft!,
            scale: scale!,
            scaleWidth: scaleWidth!,
          });
        time = parserPixelToTime(left, {
          startLeft: startLeft!,
          scale: scale!,
          scaleWidth: scaleWidth!,
        });
      }

      let result = true;
      if (updateTime) {
        result = engineRef.current.setTime(time);
        autoReRender && engineRef.current.reRender();
      }
      // stores.editorStore.seekAudios(time);
      result && setCursorTime(time);
      return result;
    };

    /** 设置scrollLeft */
    const handleDeltaScrollLeft = (delta: number) => {
      // 当超过最大距离时，禁止自动滚动
      const data = scrollSync.current!.state.scrollLeft + delta;
      if (data > scaleCount * (scaleWidth! - 1) + startLeft! - width) return;
      scrollSync.current &&
        scrollSync.current.setState({
          scrollLeft: Math.max(scrollSync.current.state.scrollLeft + delta, 0),
        });
    };

    // 处理运行器相关数据
    useEffect(() => {
      const handleTime = ({ time }: { time: number }) => {
        handleSetCursor({ time, updateTime: false });
      };
      const handlePlay = () => setIsPlaying(true);
      const handlePaused = () => setIsPlaying(false);
      engineRef.current.on("setTimeByTick", handleTime);
      engineRef.current.on("play", handlePlay);
      engineRef.current.on("paused", handlePaused);
    }, []);

    // ref 数据
    useImperativeHandle(ref, () => ({
      get target() {
        return domRef.current!;
      },
      get listener() {
        return engineRef.current;
      },
      get isPlaying() {
        return engineRef.current.isPlaying;
      },
      get isPaused() {
        return engineRef.current.isPaused;
      },
      setPlayRate: engineRef.current.setPlayRate.bind(engineRef.current),
      getPlayRate: engineRef.current.getPlayRate.bind(engineRef.current),
      setTime: (time: number) => handleSetCursor({ time }),
      getTime: engineRef.current.getTime.bind(engineRef.current),
      reRender: engineRef.current.reRender.bind(engineRef.current),
      play: (param: Parameters<TimelineState["play"]>[0]) =>
        engineRef.current.play({ ...param }),
      pause: engineRef.current.pause.bind(engineRef.current),
      setScrollLeft: (val) => {
        scrollSync.current &&
          scrollSync.current.setState({ scrollLeft: Math.max(val, 0) });
      },
      setScrollTop: (val) => {
        scrollSync.current &&
          scrollSync.current.setState({ scrollTop: Math.max(val, 0) });
      },
    }));

    // 监听timeline区域宽度变化
    useEffect(() => {
      if (areaRef.current) {
        const resizeObserver = new ResizeObserver(() => {
          if (!areaRef.current) return;
          setWidth(areaRef.current.getBoundingClientRect().width);
          stores.editorStore!.timelineStore.timelineWidth =
            areaRef.current.getBoundingClientRect().width;
        });
        resizeObserver.observe(areaRef.current!);
        return () => {
          resizeObserver && resizeObserver.disconnect();
        };
      }
    }, []);

    return (
      <div
        ref={domRef}
        style={style}
        className={cn(`${PREFIX} ${disableDrag ? PREFIX + "-disable" : ""} `)}
      >
        <ScrollSync ref={scrollSync}>
          {({ scrollLeft, scrollTop, onScroll }) => (
            <>
              <TimeArea
                {...checkedProps}
                timelineWidth={width}
                disableDrag={disableDrag || isPlaying}
                setCursor={handleSetCursor}
                cursorTime={currentCursorTime || cursorTime}
                editorData={editorData}
                scaleCount={scaleCount}
                setScaleCount={handleSetScaleCount}
                onScroll={onScroll}
                scrollLeft={scrollLeft}
              />
              <EditArea
                {...checkedProps}
                timelineWidth={width}
                ref={(ref) => ((areaRef.current as any) = ref?.domRef.current)}
                disableDrag={disableDrag || isPlaying}
                editorData={editorData}
                cursorTime={currentCursorTime || cursorTime}
                scaleCount={scaleCount}
                setCursor={handleSetCursor}
                setScaleCount={handleSetScaleCount}
                scrollTop={scrollTop}
                scrollLeft={scrollLeft}
                setEditorData={handleEditorDataChange}
                deltaScrollLeft={autoScroll ? handleDeltaScrollLeft : () => {}}
                onScroll={(params) => {
                  onScroll(params);
                  onScrollVertical && onScrollVertical(params);
                }}
              />

              {!hideCursor && (
                <Cursor
                  {...checkedProps}
                  timelineWidth={width}
                  disableDrag={isPlaying}
                  scrollLeft={scrollLeft}
                  scaleCount={scaleCount}
                  setScaleCount={handleSetScaleCount}
                  setCursor={handleSetCursor}
                  cursorTime={cursorTime}
                  editorData={editorData}
                  areaRef={areaRef}
                  scrollSync={scrollSync}
                  deltaScrollLeft={autoScroll && handleDeltaScrollLeft}
                />
              )}
            </>
          )}
        </ScrollSync>
      </div>
    );
  })
);
