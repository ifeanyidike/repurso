import React, {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import {
  AutoSizer,
  Grid,
  GridCellRenderer,
  OnScrollParams,
} from "react-virtualized";
import { TimelineRow } from "../../interface/action";
import { CommonProp } from "../../interface/common_prop";
import { EditData } from "../../interface/timeline";
import { prefix } from "../../utils/deal_class_prefix";
import { parserPixelToTime, parserTimeToPixel } from "../../utils/deal_data";
import { DragLines } from "./drag_lines";
import { EditRow } from "./edit_row";
import { useDragLine } from "./hooks/use_drag_line";
import { useWheel, usePinch } from "@use-gesture/react";
import { handleSetCursor } from "../../utils/cursor";
import { observer } from "mobx-react-lite";
import { stores } from "../../../../store/Stores";

export type EditAreaProps = CommonProp & {
  scrollLeft: number;
  scrollTop: number;
  onScroll: (params: OnScrollParams) => void;
  setEditorData: (params: TimelineRow[]) => void;
  deltaScrollLeft: (scrollLeft: number) => void;
  setCursor: (param: { left?: number; time?: number }) => void;
};

/** edit area ref数据 */
export interface EditAreaState {
  domRef: React.MutableRefObject<HTMLDivElement>;
}

export const EditArea = observer(
  React.forwardRef<EditAreaState, EditAreaProps>((props, ref) => {
    const {
      maxScaleCount,
      editorData,
      rowHeight,
      scaleWidth,
      scaleCount,
      startLeft,
      scrollLeft,
      scrollTop,
      scale,
      hideCursor,
      cursorTime,
      onScroll,
      dragLine,
      getAssistDragLineActionIds,
      onActionMoveEnd,
      onActionMoveStart,
      onActionMoving,
      onActionResizeEnd,
      onActionResizeStart,
      onActionResizing,
      onClickTimeArea,
      setCursor,
    } = props;
    const {
      dragLineData,
      initDragLine,
      updateDragLine,
      disposeDragLine,
      defaultGetAssistPosition,
      defaultGetMovePosition,
    } = useDragLine();
    const editAreaRef = useRef<HTMLDivElement>();
    const gridRef = useRef<Grid>();
    const heightRef = useRef(-1);
    const defaultScale = stores.editorStore!.timelineStore.defaultScale!;
    const timelineScale = stores.editorStore!.timelineStore.timelineScale!;
    const videoDuration = stores.editorStore!.videoDuration;
    const MIN_ZOOM = defaultScale * 2;
    const MAX_ZOOM = videoDuration / 200;

    // ref 数据
    useImperativeHandle(ref, () => ({
      get domRef() {
        return editAreaRef;
      },
    }));

    const handleInitDragLine: EditData["onActionMoveStart"] = (data) => {
      if (dragLine) {
        const assistActionIds =
          getAssistDragLineActionIds &&
          getAssistDragLineActionIds({
            action: data.action,
            row: data.row,
            editorData,
          });
        const cursorLeft = parserTimeToPixel(cursorTime, {
          scaleWidth,
          scale,
          startLeft,
        });
        const assistPositions = defaultGetAssistPosition({
          editorData,
          assistActionIds,
          action: data.action,
          row: data.row,
          scale,
          scaleWidth,
          startLeft,
          hideCursor,
          cursorLeft,
        });
        initDragLine({ assistPositions });
      }
    };

    const handleUpdateDragLine: EditData["onActionMoving"] = (data) => {
      if (dragLine) {
        const movePositions = defaultGetMovePosition({
          ...data,
          startLeft,
          scaleWidth,
          scale,
        });
        updateDragLine({ movePositions });
      }
    };

    /** 获取每个cell渲染内容 */
    const cellRenderer: GridCellRenderer = ({ rowIndex, key, style }) => {
      const row = editorData[rowIndex]; // 行数据
      return (
        <EditRow
          {...props}
          style={{
            ...style,
            backgroundPositionX: `0, ${startLeft}px`,
            backgroundSize: `${startLeft}px, ${scaleWidth}px`,
          }}
          areaRef={editAreaRef}
          key={key}
          rowHeight={row?.rowHeight || rowHeight}
          rowData={row}
          dragLineData={dragLineData}
          onActionMoveStart={(data) => {
            handleInitDragLine(data);
            return onActionMoveStart && onActionMoveStart(data);
          }}
          onActionResizeStart={(data) => {
            handleInitDragLine(data);

            return onActionResizeStart && onActionResizeStart(data);
          }}
          onActionMoving={(data) => {
            handleUpdateDragLine(data);
            return onActionMoving && onActionMoving(data);
          }}
          onActionResizing={(data) => {
            handleUpdateDragLine(data);
            return onActionResizing && onActionResizing(data);
          }}
          onActionResizeEnd={(data) => {
            disposeDragLine();
            return onActionResizeEnd && onActionResizeEnd(data);
          }}
          onActionMoveEnd={(data) => {
            disposeDragLine();
            return onActionMoveEnd && onActionMoveEnd(data);
          }}
        />
      );
    };

    useLayoutEffect(() => {
      gridRef.current?.scrollToPosition({ scrollTop, scrollLeft });
    }, [scrollTop, scrollLeft]);

    useEffect(() => {
      gridRef.current!.recomputeGridSize();
    }, [editorData]);

    const bindWheel = useWheel(({ event, delta }) => {
      event.preventDefault();
    });

    const bindPinch = usePinch((state) => {
      const {
        event,
        offset: [offset],
        direction: [direction],
      } = state;
      event.preventDefault();

      if (direction === 1) {
        stores.editorStore!.timelineStore.timelineScale = Math.max(
          MAX_ZOOM,
          timelineScale! - 0.3
        );
      } else {
        stores.editorStore!.timelineStore.timelineScale = Math.min(
          MIN_ZOOM,
          timelineScale! + 0.3
        );
      }
    });

    return (
      <div
        {...bindWheel()}
        {...bindPinch()}
        ref={editAreaRef}
        className={prefix("edit-area")}
        onClick={(e) =>
          handleSetCursor(
            hideCursor,
            e,
            scrollLeft,
            startLeft,
            maxScaleCount,
            scaleWidth,
            scale,
            onClickTimeArea,
            setCursor
          )
        }
      >
        <AutoSizer>
          {({ width, height }) => {
            let totalHeight = 0;
            const heights = editorData.map((row) => {
              const itemHeight = row.rowHeight || rowHeight;
              totalHeight += itemHeight! + 5;
              return itemHeight;
            });
            if (totalHeight < height) {
              heights.push(height - totalHeight);
              if (heightRef.current !== height && heightRef.current >= 0) {
                setTimeout(() =>
                  gridRef.current?.recomputeGridSize({
                    rowIndex: heights.length - 1,
                  })
                );
              }
            }
            heightRef.current = height + editorData.length * 5;
            stores.editorStore!.timelineStore.setTimelineHeight(height);
            return (
              <Grid
                columnCount={1}
                rowCount={heights.length}
                ref={gridRef}
                cellRenderer={cellRenderer}
                columnWidth={Math.max(
                  scaleCount * scaleWidth! + startLeft!,
                  width
                )}
                width={width}
                height={height}
                rowHeight={({ index }) => (heights[index] || rowHeight)! + 5}
                overscanRowCount={10}
                overscanColumnCount={0}
                onScroll={(param) => {
                  onScroll(param);
                }}
              />
            );
          }}
        </AutoSizer>
        {dragLine && <DragLines scrollLeft={scrollLeft} {...dragLineData} />}
      </div>
    );
  })
);
