import { Timeline, TimelineEffect, TimelineRow } from "./Timeline";
import { cloneDeep } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { MdOndemandVideo, MdOutlineSubtitles } from "react-icons/md";
import { IoImageOutline, IoMagnetSharp } from "react-icons/io5";
import { PiTextTBold } from "react-icons/pi";
import {
  AiFillLock,
  AiFillUnlock,
  AiOutlineEyeInvisible,
} from "react-icons/ai";
import { RxEyeOpen, RxScissors } from "react-icons/rx";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FcAudioFile } from "react-icons/fc";
import TimelineZoomSlider from "./Utilities/TimelineZoomSlider";
import { observer } from "mobx-react-lite";
import { runInAction } from "mobx";
import { motion } from "framer-motion";
import { EditorStore } from "../store/EditorStore";
import { stores } from "../store/Stores";
import { CustomFabricObject, ElementTypes } from "../types/properties";
import {
  Audio,
  Element,
  ImageElement,
  SubtitleElement,
  TextElement,
  Video,
} from "../types/editor";
import { utility } from "../service/Utility";
import { themeStore } from "../store/ThemeStore";
import { cn } from "../utils";
import { property } from "../store/PropertyStore";

const CustomScale = (props: { scale: number }) => {
  const { scale } = props;
  const min = Math.floor(scale / 60);
  const second = (scale % 60).toString().padStart(2, "0");
  // return <>{editor.formatTime(scale)}</>;
  const digits = Math.floor((scale % 60) * 10)
    .toString()
    .slice(0, 2);

  return <>{`${min}:${digits}`}</>;
};

type Props = {
  // engine: RefObject<TimelineState>;
  store: EditorStore;
};

const TimelineContent = observer((props: Props) => {
  const elements = stores.editorStore!.store.elements;
  const videoDuration = stores.editorStore!.videoDuration;
  const videoTime = stores.editorStore!.videoTime;
  const prevTime = stores.editorStore!.prevTime;
  const tracks = stores.editorStore!.timelineStore.tracksArray;
  const domRef = useRef<HTMLDivElement>(null);

  const mockEffect: Record<string, TimelineEffect> = {
    image_effect: {
      id: "image",
      name: "Image",
    },
    parent_video: {
      id: "parent-video",
      name: "Video",
    },
    text_effect: {
      id: "text",
      name: "Text",
    },
    video_effect: {
      id: "video",
      name: "Video",
    },
    sound_effect: {
      id: "sound",
      name: "Sound",
    },
    subtitle_effect: {
      id: "subtitle",
      name: "Subtitle",
    },
  };

  const mockData: TimelineRow[] = [
    ...tracks.map((e) => {
      if (e[0].type === ElementTypes.primaryVideo) {
        return {
          id: crypto.randomUUID(),
          rowHeight: 80,
          type: "parent_video",
          locked: e[0].locked,
          hidden: e[0].hidden,
          actions: e.map((v) => ({
            id: v.id,
            start: v.time,
            end: v.time + v.duration,
            effectId: "parent_video",
            audio: (v as Video).audio,
            title: (v as Video).title,
            dat: (v as Video).datUrl,
            src: (v as Video).src,
            volume: (v as Video).volume,
          })),
        };
      } else if (e[0].type === "text") {
        return {
          id: crypto.randomUUID(),
          rowHeight: 35,
          type: "text",
          locked: e[0].locked,
          hidden: e[0].hidden,
          actions: e.map((t) => ({
            id: t.id,
            start: t.time,
            end: t.time + t.duration,
            effectId: "text",
            text: (t as TextElement).text,
          })),
        };
      } else if (
        e[0].type === "image" ||
        e[0].type === "audio" ||
        e[0].type === "video"
      ) {
        return {
          id: crypto.randomUUID(),
          rowHeight: 40,
          type: e[0].type,
          locked: e[0].locked,
          hidden: e[0].hidden,
          actions: e.map((el) => ({
            id: el.id,
            start: el.time,
            end: el.time + el.duration,
            effectId: el.type,
            src: (el as ImageElement).src,
            title: (el as Audio).title,
            ...((el as Audio).volume && { volume: (el as Audio).volume }),
          })),
        };
      }

      const s = e[0] as SubtitleElement;
      return {
        id: e[0].id,
        rowHeight: 35,
        type: "subtitle",
        locked: e[0].locked,
        hidden: e[0].hidden,
        actions:
          s.elements?.map((se) => ({
            id: se.id,
            start: utility.getTimeFromSrtObject(se.start),
            end: utility.getTimeFromSrtObject(se.end),
            effectId: "subtitle",
            text: se.text,
          })) || [],
      };
    }),
  ];

  const [data, setData] = useState(mockData);
  const timelineWidth = window.innerWidth - 538;
  const timelineState = props.store.timelineStore.engine;
  const videoPlayer = props.store.videoPlayer;
  const isPlaying = props.store.isPlaying;
  const snapGrid = props.store.timelineStore.snapGrid;
  const fabricCanvas = props.store.fabricCanvas;
  const changeCount = props.store.changeCount;
  const timelineHeight = props.store.timelineStore.timelineHeight;
  const currentStore = stores.editorStores.find(
    (s) => s.storeID === props.store.storeID
  );

  useEffect(() => {
    const defaultEditorData = cloneDeep(mockData);
    console.log("defaultEditorData", defaultEditorData);
    setData(defaultEditorData);
  }, [elements.length, changeCount, stores.activeStoreID]);

  const scaleWidth = 160;
  const defaultScale = Math.ceil(
    (scaleWidth * videoDuration) / (timelineWidth! - 50)
  );
  const timelineScale = props.store.timelineStore.timelineScale || defaultScale;

  useEffect(() => {
    runInAction(() => {
      props.store.timelineStore.timelineScale = defaultScale;
      props.store.timelineStore.defaultScale = defaultScale;
    });
  }, []);

  const startLeft = 15;
  useEffect(() => {
    if (!timelineState.current || videoTime === null || videoTime === undefined)
      return;
    if (
      parseFloat(videoTime.toFixed(3)) !==
      parseFloat(timelineState.current.getTime().toFixed(3))
    ) {
      timelineState.current.setTime(videoTime);
    }
  }, [prevTime]);

  useEffect(() => {
    console.log("time line height", timelineHeight);
  }, [timelineHeight]);

  const isPrimaryNotSelected =
    !stores.editorStore!.store.selectedElement ||
    stores.editorStore!.store.selectedElement.type ===
      ElementTypes.primaryVideo;

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "w-full  h-12 flex justify-between items-center px-6 border-b border-gray-700 shadow-md",
          "rounded-xl rounded-b-none",
          themeStore.isDarkTheme ? "bg-[#d7d7d8]" : "bg-[#191b1d]"
        )}
      >
        {/* Left Section - Tools */}
        <div className="flex items-center gap-4">
          {/* Split Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => runInAction(async () => await utility.split())}
            className={cn(
              "p-2 rounded-lg transition-all",
              !themeStore.isDarkTheme
                ? "bg-gray-800 hover:bg-gray-700 active:bg-gray-600 "
                : "bg-gray-200 hover:bg-gray-300 active:bg-gray-400 "
            )}
          >
            <RxScissors
              color={!themeStore.isDarkTheme ? "#fafafa" : "#191b1d"}
              size={20}
            />
          </motion.button>

          {/* Delete Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => props.store.removeElement()}
            disabled={isPrimaryNotSelected}
            className={cn(
              "p-2 rounded-lg transition-all",
              !themeStore.isDarkTheme
                ? "bg-gray-800 hover:bg-gray-700 active:bg-gray-600 "
                : "bg-gray-200 hover:bg-gray-300 active:bg-gray-400 "
            )}
          >
            <RiDeleteBin6Line
              color={
                isPrimaryNotSelected
                  ? "#a1a1a1"
                  : !themeStore.isDarkTheme
                  ? "#fafafa"
                  : "#191b1d"
              }
              size={20}
            />
          </motion.button>
        </div>

        {/* Right Section - Snap Grid and Zoom Slider */}
        <div className="flex items-center gap-4">
          {/* Snap-to-Grid Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              props.store.timelineStore.setSnapGrid(!snapGrid);
            }}
            className={cn(
              !themeStore.isDarkTheme
                ? "bg-gray-800 hover:bg-gray-700 active:bg-gray-600 "
                : "bg-gray-200 hover:bg-gray-300 active:bg-gray-400 ",
              "p-2 rounded-lg transition-all",
              snapGrid && 'bg-green-600 "hover:bg-green-500 active:bg-green-400'
            )}
          >
            <IoMagnetSharp
              color={!themeStore.isDarkTheme ? "#fafafa" : "#191b1d"}
              size={18}
            />
          </motion.button>

          {/* Timeline Zoom Slider */}
          <TimelineZoomSlider
            defaultScale={defaultScale}
            timelineScale={timelineScale}
          />
        </div>
      </div>
      <div
        className={cn(
          "w-full timeline-container",
          themeStore.isDarkTheme && "!bg-[#d7d7d8]"
        )}
      >
        <div
          ref={domRef}
          style={{
            overflow: "overlay",
            height: timelineHeight || "",
          }}
          onScroll={(e) => {
            const target = e.target as HTMLDivElement;
            timelineState.current?.setScrollTop(target.scrollTop);
          }}
          className={"timeline-list"}
        >
          {data.map((item) => {
            return (
              <div
                className={`timeline-list-item ml-auto ${
                  ["parent_video", "video", "audio"].includes(item.type!)
                    ? "h-[80px]"
                    : item.type === "image"
                    ? "h-10"
                    : "h-[35px]"
                }`}
                key={item.id}
              >
                <div
                  className={cn(
                    "text gap-2",
                    ["parent_video", "video"].includes(item.type!) &&
                      "h-[80px]",
                    item.type === "image" && "h-10",
                    item.type === "audio" && "h-30",
                    item.type === "subtitle" && "h-[35px]",
                    themeStore.isDarkTheme ? "!text-black" : "text-white",
                    "font-bold"
                  )}
                >
                  <div>
                    {item.type?.includes("video") ? (
                      <MdOndemandVideo size={12} />
                    ) : item.type === "image" ? (
                      <IoImageOutline size={13} />
                    ) : item.type === "subtitle" ? (
                      <MdOutlineSubtitles size={12} />
                    ) : item.type === "text" ? (
                      <PiTextTBold size={12} />
                    ) : item.type === "audio" ? (
                      <FcAudioFile size={12} />
                    ) : null}
                  </div>

                  <div>
                    <button
                      onClick={() => {
                        let elementIds = item.actions.map((a) => a.id);
                        if (item.type === "subtitle") elementIds = [item.id];
                        props.store.lockOrUnlockTrack(
                          elementIds,
                          !!item.locked
                        );
                        const actionIdx = data.findIndex(
                          (d) => d.id === item.id
                        );
                        if (actionIdx !== -1) {
                          let newData = [...data];
                          newData[actionIdx] = {
                            ...item,
                            locked: !item.locked,
                          };
                          setData(newData);
                        }
                      }}
                    >
                      {item.locked ? (
                        <AiFillLock size={12} />
                      ) : (
                        <AiFillUnlock size={12} />
                      )}
                    </button>
                    {/* <AiFillLock size={12} /> */}
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        let elementIds = item.actions.map((a) => a.id);
                        if (item.type === "subtitle") elementIds = [item.id];
                        props.store.toggleHidden(elementIds, !!item.hidden);
                        const actionIdx = data.findIndex(
                          (d) => d.id === item.id
                        );
                        if (actionIdx !== -1) {
                          let newData = [...data];
                          newData[actionIdx] = {
                            ...item,
                            hidden: !item.hidden,
                          };
                          setData(newData);
                        }
                      }}
                    >
                      {!item.hidden ? (
                        <RxEyeOpen size={12} />
                      ) : (
                        <AiOutlineEyeInvisible size={12} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Timeline
          ref={timelineState}
          currentCursorTime={props.store.videoTime}
          onChange={setData}
          editorData={data}
          effects={mockEffect}
          hideCursor={false}
          gridSnap={snapGrid}
          autoReRender={true}
          autoScroll={true}
          dragLine={true}
          scale={timelineScale}
          scaleWidth={scaleWidth}
          startLeft={startLeft}
          onActionResizeEnd={(e) => {
            const { action, start, end } = e;
            const object = fabricCanvas
              ?.getObjects()
              ?.find((o) => (o as CustomFabricObject).id === action.id);

            if (object) {
              fabricCanvas?.setActiveObject(object);
            }

            if (action.effectId === "subtitle") {
              property.editSubtitleElement(action.id, { start, end });
            } else if (
              action.effectId === "image" ||
              action.effectId === "text" ||
              action.effectId === "video" ||
              action.effectId === "audio"
            ) {
              props.store.updateElement(action.id, {
                time: start,
                duration: end - start,
              } as Element);
            } else if (action.id === "parent_video") {
              props.store.undoRedo.updateUndoRedoStack();
            }
          }}
          onActionMoveEnd={(e) => {
            const { action, start, end } = e;
            console.log("action: ", action);
            if (action.effectId === "subtitle") {
              property.editSubtitleElement(action.id, { start, end });
            } else if (
              action.effectId === "image" ||
              action.effectId === "text" ||
              action.effectId === "video" ||
              action.effectId === "audio"
            ) {
              console.log("moved image");
              props.store.updateElement(action.id, {
                time: start,
                duration: end - start,
              } as Element);
            }
          }}
          onActionResizing={(e) => {
            const { action, start, end } = e;
            if (action.effectId === "parent_video") {
              props.store.timelineStore.videoTriggerPlaceholder =
                !props.store.timelineStore.videoTriggerPlaceholder;
            }
          }}
          getScaleRender={(scale) => <CustomScale scale={scale} />}
          style={{
            width: "100%",
            ...(themeStore.isDarkTheme && {
              backgroundColor: "#d7d7d8 !important",
            }),
          }}
        />
      </div>
      <button
        onClick={() => {
          timelineState.current?.play({ autoEnd: true });
        }}
      >
        Play
      </button>
    </div>
  );
});

export default TimelineContent;
