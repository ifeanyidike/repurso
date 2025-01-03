import React, { FC, useLayoutEffect, useRef, useState } from "react";
import { TimelineAction, TimelineRow } from "../../interface/action";
import { CommonProp } from "../../interface/common_prop";
import {
  DEFAULT_ADSORPTION_DISTANCE,
  DEFAULT_MOVE_GRID,
} from "../../interface/const";
import { prefix } from "../../utils/deal_class_prefix";
import {
  getScaleCountByPixel,
  parserTimeToPixel,
  parserTimeToTransform,
  parserTransformToTime,
} from "../../utils/deal_data";
import { RowDnd } from "../row_rnd/row_rnd";
import {
  RndDragCallback,
  RndDragEndCallback,
  RndDragStartCallback,
  RndResizeCallback,
  RndResizeEndCallback,
  RndResizeStartCallback,
  RowRndApi,
} from "../row_rnd/row_rnd_interface";
import { DragLineData } from "./drag_lines";
import { CustomFabricObject } from "../../../../types/properties";
import { observer } from "mobx-react-lite";
import { stores } from "../../../../store/Stores";
import Draggable from "react-draggable";
import WaveformView from "../WaveformData";

export type EditActionProps = CommonProp & {
  row: TimelineRow;
  action: TimelineAction;
  dragLineData: DragLineData;
  setEditorData: (params: TimelineRow[]) => void;
  handleTime: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => number;
  areaRef: React.MutableRefObject<HTMLDivElement>;
  /** 设置scroll left */
  deltaScrollLeft?: (delta: number) => void;
};

export const EditAction: FC<EditActionProps> = observer(
  ({
    editorData,
    row,
    action,
    effects,
    rowHeight,
    scale,
    scaleWidth,
    scaleSplitCount,
    startLeft,
    gridSnap,
    disableDrag,

    scaleCount,
    maxScaleCount,
    setScaleCount,
    onActionMoveStart,
    onActionMoving,
    onActionMoveEnd,
    onActionResizeStart,
    onActionResizeEnd,
    onActionResizing,

    dragLineData,
    setEditorData,
    onClickAction,
    onClickActionOnly,
    onDoubleClickAction,
    onContextMenuAction,
    getActionRender,
    handleTime,
    areaRef,
    deltaScrollLeft,
  }) => {
    const rowRnd = useRef<RowRndApi>();
    const isDragWhenClick = useRef(false);
    const {
      id,
      maxEnd,
      minStart,
      end,
      start,
      selected,
      flexible = true,
      movable = true,
      effectId,
    } = action;
    const fabricCanvas = stores.editorStore!.fabricCanvas;
    const selectedElementId = stores.editorStore!.store.selectedElementId;

    const selectedSubtitleId = stores.editorStore!.store.selectedSubtitleId;

    // 获取最大/最小 像素范围
    const leftLimit = parserTimeToPixel(minStart || 0, {
      startLeft,
      scale,
      scaleWidth,
    });
    const rightLimit = Math.min(
      maxScaleCount * scaleWidth + startLeft, // 根据maxScaleCount限制移动范围
      parserTimeToPixel(maxEnd || Number.MAX_VALUE, {
        startLeft,
        scale,
        scaleWidth,
      })
    );

    // 初始化动作坐标数据
    const [transform, setTransform] = useState(() => {
      return parserTimeToTransform(
        { start, end },
        { startLeft, scale, scaleWidth }
      );
    });

    useLayoutEffect(() => {
      setTransform(
        parserTimeToTransform({ start, end }, { startLeft, scale, scaleWidth })
      );
    }, [end, start, startLeft, scaleWidth, scale]);

    // 配置拖拽网格对其属性
    const gridSize = scaleWidth / scaleSplitCount;

    // 动作的名称
    const classNames = ["action"];
    if (movable) classNames.push("action-movable");
    if (selected) classNames.push("action-selected");
    if (flexible) classNames.push("action-flexible");
    if (effects[effectId]) classNames.push(`action-effect-${effectId}`);

    /** 计算scale count */
    const handleScaleCount = (left: number, width: number) => {
      const curScaleCount = getScaleCountByPixel(left + width, {
        startLeft,
        scaleCount,
        scaleWidth,
      });
      if (curScaleCount !== scaleCount) setScaleCount(curScaleCount);
    };

    //#region [rgba(100,120,156,0.08)] 回调
    const handleDragStart: RndDragStartCallback = () => {
      onActionMoveStart && onActionMoveStart({ action, row });
    };
    const handleDrag: RndDragCallback = ({ left, width }) => {
      isDragWhenClick.current = true;

      if (onActionMoving) {
        const { start, end } = parserTransformToTime(
          { left, width },
          { scaleWidth, scale, startLeft }
        );
        const result = onActionMoving({ action, row, start, end });
        if (result === false) return false;
      }
      setTransform({ left, width });
      handleScaleCount(left, width);
    };

    const handleDragEnd: RndDragEndCallback = ({ left, width }) => {
      // 计算时间
      const { start, end } = parserTransformToTime(
        { left, width },
        { scaleWidth, scale, startLeft }
      );

      // 设置数据
      const rowItem = editorData.find((item) => item.id === row.id);
      const action = rowItem.actions.find((item) => item.id === id);
      action.start = start;
      action.end = end;
      setEditorData(editorData);

      // 执行回调
      if (onActionMoveEnd) onActionMoveEnd({ action, row, start, end });
    };

    const handleResizeStart: RndResizeStartCallback = (dir) => {
      onActionResizeStart && onActionResizeStart({ action, row, dir });
    };

    const handleResizing: RndResizeCallback = (dir, { left, width }) => {
      isDragWhenClick.current = true;
      if (onActionResizing) {
        const { start, end } = parserTransformToTime(
          { left, width },
          { scaleWidth, scale, startLeft }
        );
        const result = onActionResizing({ action, row, start, end, dir });
        if (result === false) return false;
      }
      setTransform({ left, width });
      handleScaleCount(left, width);
    };

    const handleResizeEnd: RndResizeEndCallback = (dir, { left, width }) => {
      // 计算时间
      const { start, end } = parserTransformToTime(
        { left, width },
        { scaleWidth, scale, startLeft }
      );

      // 设置数据
      const rowItem = editorData.find((item) => item.id === row.id);
      const action = rowItem.actions.find((item) => item.id === id);
      action.start = start;
      action.end = end;
      setEditorData(editorData);

      // 触发回调
      if (onActionResizeEnd)
        onActionResizeEnd({ action, row, start, end, dir });
    };
    //#endregion

    const nowAction = {
      ...action,
      ...parserTransformToTime(
        { left: transform.left, width: transform.width },
        { startLeft, scaleWidth, scale }
      ),
    };

    const nowRow: TimelineRow = {
      ...row,
      actions: [...row.actions],
    };
    if (row.actions.includes(action)) {
      nowRow.actions[row.actions.indexOf(action)] = nowAction;
    }
    // console.log('action now', action, nowAction, nowRow);

    const handleMakeActive = (
      e: React.MouseEvent<HTMLDivElement, MouseEvent>,
      action: TimelineAction,
      row?: TimelineRow
    ) => {
      e.stopPropagation();
      const id = row?.id || action.id;
      if (action.effectId === "audio") {
        stores.editorStore!.setSelectedElementId(action.id);
        fabricCanvas?.discardActiveObject();
        return;
      }
      const object = fabricCanvas
        ?.getObjects()
        .find((o) => (o as CustomFabricObject).id === id);

      if (object) {
        if (object.visible === false) return;
        stores.editorStore!.setSelectedElementId(id);
        if (row?.type === "subtitle")
          stores.editorStore!.store.selectedSubtitleId = action.id;
        fabricCanvas?.setActiveObject(object);
      }
    };

    function RenderVolumeLine({
      action,
      height = 30,
    }: {
      action: TimelineAction;
      height: number;
    }) {
      return (
        <Draggable
          axis="y"
          bounds={{ top: 0, bottom: height }}
          position={{ x: 0, y: (1 - action.volume!) * height }}
          onDrag={(e, data) => {
            console.log("data", data, "e", e);
          }}
          onStop={(e, data) => {
            const volume = (height - data.y) / height;
            stores.editorStore!.adjustVolume(action.id, volume);
          }}
        >
          <div
            className="absolute w-full h-1 bg-blue-500 cursor-ns-resize"
            style={{
              top: 0,
            }}
          ></div>
        </Draggable>
      );
    }

    const renderParentVideo = (action: TimelineAction) => (
      <div
        className={`flex flex-col relative rounded`}
        onClick={(e) => handleMakeActive(e, action)}
      >
        <div
          className="parent_video bg-[url('/media/andreas.jpg')] bg-repeat h-[30px] w-full"
          style={{ backgroundSize: "auto 100%" }}
        >
          <div className="">{/* Waveform container */}</div>
          <Draggable
            axis="y"
            bounds={{ top: 0, bottom: 30 }}
            position={{ x: 0, y: (1 - action.volume!) * 30 }}
            onDrag={(e, data) => {
              console.log("data", data, "e", e);
            }}
            onStop={(e, data) => {
              const volume = (30 - data.y) / 30;
              stores.editorStore!.adjustVolume(action.id, volume);
            }}
          >
            <div
              className="absolute w-full h-[2px] bg-blue-500 cursor-ns-resize z-50"
              style={{
                top: 0,
              }}
            ></div>
          </Draggable>
        </div>
        <WaveformView
          audioUrl={action.audio!}
          audioContentType="audio/mp3"
          // audioContext={new AudioContext()}
          waveformDataUrl={action.dat}
        />
      </div>
    );

    // const renderVideo = (action: TimelineAction) => (
    //   <div
    //     className={`flex flex-col relative rounded`}
    //     onClick={e => handleMakeActive(e, action)}
    //   >
    //     <div
    //       className="video bg-[url('/media/banana-muffins.webp')] bg-repeat h-[30px] w-full"
    //       style={{ backgroundSize: 'auto 100%' }}
    //     >
    //       <div className="">{/* Waveform container */}</div>
    //     </div>
    //     {/* <WaveformView
    //       audioUrl={action.audio!}
    //       audioContentType="audio/mp3"
    //       // audioContext={new AudioContext()}
    //       waveformDataUrl={action.dat}
    //     /> */}
    //   </div>
    // );

    const renderVideo = (action: TimelineAction) => (
      <div
        className={`flex flex-col relative rounded`}
        onClick={(e) => handleMakeActive(e, action)}
      >
        <div
          className="video bg-[url('/media/banana-muffins.webp')] bg-repeat h-[30px] w-full"
          style={{ backgroundSize: "auto 100%" }}
        >
          <div className="">
            {/* Waveform container */} {}
          </div>
          <Draggable
            axis="y"
            bounds={{ top: 0, bottom: 30 }}
            position={{ x: 0, y: (1 - action.volume!) * 30 }}
            onDrag={(e, data) => {
              console.log("data", data, "e", e);
            }}
            onStop={(e, data) => {
              const volume = (30 - data.y) / 30;
              stores.editorStore!.adjustVolume(action.id, volume);
            }}
            defaultClassName="!bg-red-500"
          >
            <div
              className="absolute w-full h-[2px] bg-blue-500 cursor-ns-resize"
              style={{
                top: 0,
              }}
            ></div>
          </Draggable>
        </div>
      </div>
    );

    const renderAudio = (action: TimelineAction) => (
      <div
        className="flex flex-col relative rounded border border-gray-300 bg-gray-800"
        onClick={(e) => handleMakeActive(e, action)}
      >
        <div className="flex  h-[12px] w-full relative bg-gradient-to-r from-gray-100 to-gray-400 rounded">
          {/* Animated bars to mimic an audio equalizer effect */}

          <div className="text-[10px]">
            {action.title} - {action.volume}
          </div>
          {/* <div>
            <p className="text-white text-lg">{action.start}</p>
            <p className="text-white text-lg">{action.end}</p>
          </div> */}
          <Draggable
            axis="y"
            bounds={{ top: 0, bottom: 30 }}
            position={{ x: 0, y: (1 - (action.volume! || 0)) * 30 }}
            onDrag={(e, data) => {
              console.log("data", data, "e", e);
            }}
            onStop={(e, data) => {
              const volume = (30 - data.y) / 30;
              stores.editorStore!.adjustVolume(action.id, volume);
            }}
          >
            <div
              className="absolute w-full h-[2px] bg-blue-500 cursor-ns-resize z-50"
              style={{
                top: 0,
              }}
            ></div>
          </Draggable>
        </div>

        {/* Waveform */}
        <WaveformView
          audioUrl={action.src!}
          audioContentType="audio/mp3"
          waveformDataUrl={action.dat}
          height="h-[18px]"
        />
      </div>
    );

    const renderText = (action: TimelineAction) => {
      return (
        <div
          className={`text overflow-hidden`}
          onClick={(e) => handleMakeActive(e, action)}
        >
          <div className="text-text text-white overflow-hidden">
            {action.text}
          </div>
        </div>
      );
    };

    const renderImage = (action: TimelineAction) => {
      return (
        <div
          className="img bg-[url('/media/banana-muffins.webp')] bg-repeat-x h-10 w-full rounded-lg"
          style={{
            backgroundSize: "auto 100%",
          }}
          onClick={(e) => handleMakeActive(e, action)}
        ></div>
      );
    };

    const renderSubtitle = (action: TimelineAction, row: TimelineRow) => {
      return (
        <div
          className="subtitle overflow-hidden border border-gray-600 h-[35px] rounded flex items-center justify-center"
          onClick={(e) => handleMakeActive(e, action, row)}
        >
          <div className="subtitle-text text-white overflow-hidden  line-clamp-1">
            <p>{action.text}</p>
          </div>
        </div>
      );
    };

    return (
      <RowDnd
        ref={rowRnd}
        parentRef={areaRef}
        start={startLeft}
        left={transform.left}
        width={transform.width}
        grid={(gridSnap && gridSize) || DEFAULT_MOVE_GRID}
        adsorptionDistance={
          gridSnap
            ? Math.max(
                (gridSize || DEFAULT_MOVE_GRID) / 2,
                DEFAULT_ADSORPTION_DISTANCE
              )
            : DEFAULT_ADSORPTION_DISTANCE
        }
        adsorptionPositions={dragLineData.assistPositions}
        bounds={{
          left: leftLimit,
          right: rightLimit,
        }}
        edges={{
          left: !disableDrag && flexible && `.${prefix("action-left-stretch")}`,
          right:
            !disableDrag && flexible && `.${prefix("action-right-stretch")}`,
        }}
        enableDragging={!disableDrag && movable}
        enableResizing={!disableDrag && flexible}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onResizeStart={handleResizeStart}
        onResize={handleResizing}
        onResizeEnd={handleResizeEnd}
        deltaScrollLeft={deltaScrollLeft}
      >
        <div
          onMouseDown={() => {
            isDragWhenClick.current = false;
          }}
          onClick={(e) => {
            let time: number;
            if (onClickAction) {
              time = handleTime(e);
              onClickAction(e, { row, action, time: time });
            }
            if (!isDragWhenClick.current && onClickActionOnly) {
              if (!time) time = handleTime(e);
              onClickActionOnly(e, { row, action, time: time });
            }
          }}
          onDoubleClick={(e) => {
            if (onDoubleClickAction) {
              const time = handleTime(e);
              onDoubleClickAction(e, { row, action, time: time });
            }
          }}
          onContextMenu={(e) => {
            if (onContextMenuAction) {
              const time = handleTime(e);
              onContextMenuAction(e, { row, action, time: time });
            }
          }}
          className={prefix((classNames || []).join(" "))}
          style={{
            height: rowHeight,
            border:
              (action.effectId !== "subtitle" &&
                selectedElementId == action.id) ||
              (action.effectId === "subtitle" &&
                selectedSubtitleId === action.id)
                ? "1px solid green"
                : "",
          }}
        >
          {(() => {
            switch (action.effectId) {
              case "parent_video":
                return renderParentVideo(action);
              case "video":
                return renderVideo(action);
              case "text":
                return renderText(action);
              case "image":
                return renderImage(action);
              case "audio":
                return renderAudio(action);
              case "subtitle":
                return renderSubtitle(action, row);
              default:
                return null;
            }
          })()}

          {flexible && <div className={prefix("action-left-stretch")} />}
          {flexible && <div className={prefix("action-right-stretch")} />}
        </div>
      </RowDnd>
    );
  }
);
