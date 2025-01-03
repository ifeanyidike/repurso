import React, { FC } from "react";
import { TimelineRow } from "../../interface/action";
import { CommonProp } from "../../interface/common_prop";
import { prefix } from "../../utils/deal_class_prefix";
import { parserPixelToTime } from "../../utils/deal_data";
import { DragLineData } from "./drag_lines";
import { EditAction } from "./edit_action";
import WaveformView from "../WaveformData";
import { observer } from "mobx-react-lite";
import { cn } from "../../../../utils";

export type EditRowProps = CommonProp & {
  areaRef: React.MutableRefObject<HTMLDivElement>;
  rowData?: TimelineRow;
  style?: React.CSSProperties;
  dragLineData: DragLineData;
  setEditorData: (params: TimelineRow[]) => void;
  scrollLeft: number;
  deltaScrollLeft: (scrollLeft: number) => void;
};

export const EditRow: FC<EditRowProps> = observer((props) => {
  const {
    rowData,
    style = {},
    onClickRow,
    onDoubleClickRow,
    onContextMenuRow,
    areaRef,
    scrollLeft,
    startLeft,
    scale,
    scaleWidth,
  } = props;

  const classNames = ["edit-row"];
  if (rowData?.selected) classNames.push("edit-row-selected");

  const handleTime = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!areaRef.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    const position = e.clientX - rect.x;
    const left = position + scrollLeft;
    const time = parserPixelToTime(left, { startLeft, scale, scaleWidth });
    return time;
  };

  return (
    <div
      className={cn(
        `${prefix(...classNames)} ${(rowData?.classNames || []).join(" ")}`
      )}
      style={style}
      onClick={(e) => {
        if (rowData && onClickRow) {
          const time = handleTime(e);
          onClickRow(e, { row: rowData, time: time });
        }
      }}
      onDoubleClick={(e) => {
        if (rowData && onDoubleClickRow) {
          const time = handleTime(e);
          onDoubleClickRow(e, { row: rowData, time: time });
        }
      }}
      onContextMenu={(e) => {
        if (rowData && onContextMenuRow) {
          const time = handleTime(e);
          onContextMenuRow(e, { row: rowData, time: time });
        }
      }}
    >
      {(rowData?.actions || []).map((action) => (
        <>
          <EditAction
            key={action.id}
            {...props}
            handleTime={handleTime}
            row={rowData}
            action={action}
          />
        </>
      ))}
    </div>
  );
});
