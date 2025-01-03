import { stores } from "../../../store/Stores";
import { parserPixelToTime } from "./deal_data";

export function handleSetCursor(
  hideCursor: boolean | undefined,
  e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  scrollLeft: number,
  startLeft: number | undefined,
  maxScaleCount: number | undefined,
  scaleWidth: number | undefined,
  scale: number | undefined,
  onClickTimeArea:
    | ((
        time: number,
        e: React.MouseEvent<HTMLDivElement, MouseEvent>
      ) => boolean | undefined)
    | undefined,
  setCursor: (param: { left?: number; time?: number }) => void
) {
  if (hideCursor) return;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const position = e.clientX - rect.x;
  const left = Math.max(position + scrollLeft, startLeft);
  if (left > maxScaleCount * scaleWidth + startLeft - scrollLeft) return;

  const time = parserPixelToTime(left, {
    startLeft,
    scale,
    scaleWidth,
  });
  const result = onClickTimeArea && onClickTimeArea(time, e);
  if (result === false) return;
  setCursor({ time });
  stores.editorStore!.seekVideoAndAudios(time);
}
