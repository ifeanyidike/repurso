import React, { useState } from "react";
import FontDropdown from "./FontsDropdown";
import StyledInput from "./StyledInput";
import ValueSelector from "./ValueSelector";
import ColorSelector from "./ColorSelector";
import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { stores } from "../store/Stores";
import { ImageElement, SubtitleElement, TextElement } from "../types/editor";
import { Image } from "antd";
import { twoDigitFormatter } from "../utils";

const Properties = observer(() => {
  const elements = stores.editorStore!.store.elements;
  const selectedElementId = stores.editorStore!.store.selectedElementId;
  const selectedElement = stores.editorStore!.store.selectedElement;
  const videoDuration = stores.editorStore!.videoDuration;
  const canvasSize = stores.editorStore!.store.canvasSize;

  const height = (selectedElement as ImageElement)?.size?.height;
  const width = (selectedElement as ImageElement)?.size?.width;

  const [tempState, setTempState] = useState<{
    key: string;
    value: any;
  } | null>();

  if (!selectedElement)
    return (
      <div className="flex items-center justify-center mt-60">
        Please select an element to see its properties.
      </div>
    );
  const domElement = document.getElementById(`_${selectedElement.id}`);
  const elementHeight = domElement?.offsetHeight;
  const elementWidth = domElement?.offsetWidth;

  const renderImageElementsProps = () => {
    return (
      <>
        <div className="flex flex-col">
          <div className="mb-5 flex justify-center rounded">
            <Image
              src={(selectedElement as ImageElement)?.src}
              className="!rounded"
              alt="element"
              width={150}
              height={150}
            />
          </div>
          <label className="flex italic text-sm">Time</label>
          <div className="flex flex-wrap border-t border-gray-200 py-2 my-2 text-sm">
            <StyledInput
              elementId={selectedElementId!}
              title="Start Time"
              value={twoDigitFormatter.format(selectedElement?.time)}
              propertyName="time"
            />

            <StyledInput
              elementId={selectedElementId!}
              title="End Time"
              value={twoDigitFormatter.format(
                selectedElement.time + selectedElement.duration
              )}
              callback={(e) => {
                const value = parseFloat(e);

                const time = selectedElement.time;
                if (value < time) return;
                stores.editorStore!.updateElement(selectedElementId!, {
                  duration: value - time,
                } as any);
              }}
            />

            <StyledInput
              elementId={selectedElementId!}
              title="Duration"
              value={twoDigitFormatter.format(selectedElement?.duration)}
              propertyName="duration"
            />
          </div>
          <div className="flex gap-2 items-center text-sm">
            <input
              className="justify-start w-4 h-4"
              type="checkbox"
              checked={
                selectedElement.time === 0 &&
                selectedElement.duration + selectedElement.time ===
                  videoDuration
              }
              onChange={(e) => {
                runInAction(() => {
                  stores.editorStore!.updateElement(selectedElementId!, {
                    time: 0,
                    duration: e.target.checked ? videoDuration : 8,
                  } as any);
                  stores.editorStore!.changeCount++;
                });
              }}
            />
            Span across video
          </div>
          <div className="flex gap-2 items-center text-sm">
            <input
              className="justify-start w-4 h-4"
              type="checkbox"
              checked={
                selectedElement.scaleX === canvasSize.width / width &&
                selectedElement.scaleY === canvasSize.height / height &&
                (selectedElement as ImageElement).pos.x === 0 &&
                (selectedElement as ImageElement).pos.y === 0
              }
              onChange={(e) => {
                const x =
                  stores.editorStore!.store.canvasSize.width / 2 - width / 2;
                const y =
                  stores.editorStore!.store.canvasSize.height / 2 - height / 2;

                stores.editorStore!.updateElement(selectedElementId!, {
                  scaleX: e.target.checked ? canvasSize.width / width : 1,
                  scaleY: e.target.checked ? canvasSize.height / height : 1,
                  pos: e.target.checked ? { x: 0, y: 0 } : { x, y },
                } as any);
                runInAction(() => stores.editorStore!.changeCount++);
              }}
            />
            Scale to video width
          </div>
        </div>
      </>
    );
  };

  const renderTextOrSubtitleElementsProps = () => {
    const el = selectedElement as TextElement | SubtitleElement;
    return (
      <div className="text-sm">
        <label className="italic">Font</label>
        <div className="mt-2 pt-4 border-t border-gray-200">
          <ValueSelector
            value={el.fontSize}
            elementId={selectedElementId!}
            propertyName="fontSize"
            title="Font Size"
          />

          <div className=" flex  flex-col gap-2 mt-4 ">
            <p className="font-bold">Font Family</p>
            <FontDropdown
              font={el.fontFamily}
              cb={(fontFamily) => {
                stores.editorStore!.updateElement(selectedElementId!, {
                  fontFamily,
                } as any);
              }}
            />
          </div>

          <div className=" flex  flex-col gap-2 mt-4 ">
            <p className="font-bold">Font Color</p>
            <ColorSelector
              value={el.fillColor}
              onChange={(color) => {
                console.log("color", color);
                stores.editorStore!.updateElement(selectedElementId!, {
                  fillColor: color,
                });
              }}
            />
          </div>

          <div className=" flex  flex-col gap-2 mt-4 ">
            <p className="font-bold">Background Color</p>
            <ColorSelector
              value={
                (selectedElement as TextElement | SubtitleElement)
                  .backgroundColor
              }
              onChange={(color) => {
                stores.editorStore!.updateElement(selectedElementId!, {
                  backgroundColor: color,
                });
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderTextElementsProps = () => {
    return <>{renderTextOrSubtitleElementsProps()}</>;
  };

  const renderSubtitleElementsProps = () => {
    return <>{renderTextOrSubtitleElementsProps()}</>;
  };

  const renderNotSubtitleProps = () => {
    return (
      <div className="mt-8 flex flex-col text-sm">
        <label className="italic">Position</label>
        <div className="flex flex-wrap border-t border-gray-200 py-4 my-4 text-sm">
          <StyledInput
            elementId={selectedElementId!}
            title="X position"
            propertyName="x"
            value={`${twoDigitFormatter.format(
              ((selectedElement as ImageElement | TextElement).pos.x /
                canvasSize.width) *
                100
            )}%`}
            callback={(e) => {
              let value = (parseFloat(e) * canvasSize.width) / 100;
              // const offset = (elementWidth! * 100) / canvasSize.width;
              // const max = 100 - offset;

              // let xPos = Math.max(0, (value / 100) * canvasSize.width);

              // if (value > max) {
              //   xPos = (max / 100) * canvasSize.width;
              //   value = max;
              // }

              stores.editorStore!.updateElement(selectedElementId!, {
                pos: {
                  x: value,
                  y: (selectedElement as ImageElement | TextElement).pos.y,
                },
              });
              return value;
            }}
          />

          <StyledInput
            elementId={selectedElementId!}
            title="Y position"
            propertyName="y"
            value={`${twoDigitFormatter.format(
              ((selectedElement as ImageElement | TextElement).pos.y /
                canvasSize.height) *
                100
            )}%`}
            callback={(e) => {
              let value = (parseFloat(e) * canvasSize.height) / 100;
              // if (isNaN(value)) return setTempState({ key: 'y', value: '' });

              // const offset = (elementHeight! * 100) / canvasSize.height;
              // const max = 100 - offset;

              // let yPos = Math.max(0, (value / 100) * canvasSize.height);
              // if (value > max) {
              //   yPos = (max / 100) * canvasSize.height;
              //   value = max;
              // }

              stores.editorStore!.updateElement(selectedElementId!, {
                pos: {
                  x: (selectedElement as ImageElement | TextElement).pos.x,
                  y: value,
                },
              });
              setTempState(null);
              return value;
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className=" flex flex-col pt-10 max-h-screen overflow-auto">
      {selectedElement?.type === "image"
        ? renderImageElementsProps()
        : selectedElement?.type === "text"
        ? renderTextElementsProps()
        : null}

      {selectedElement.type === "audio"
        ? null
        : selectedElement.type !== "subtitle"
        ? renderNotSubtitleProps()
        : renderSubtitleElementsProps()}
      {/* {selectedElement.type === 'subtitle' && renderSubtitleElementsProps()} */}
    </div>
  );
});

export default Properties;
