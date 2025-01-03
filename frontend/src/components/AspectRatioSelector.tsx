import React, { useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { observer } from "mobx-react-lite";
import { stores } from "../store/Stores";
import { cn } from "../utils";
import { themeStore } from "../store/ThemeStore";

const AspectRatios = [
  { name: "16:9", description: "Widescreen" },
  { name: "9:16", description: "Portrait" },
  { name: "1:1", description: "Square" },
  { name: "4:5", description: "Vertical" },
  { name: "21:9", description: "Ultra-Wide" },
  { name: "4:3", description: "Slight Horizontal" },
];

const AspectRatioSelector: React.FC = observer(() => {
  const canvasSize = stores.editorStore!.store.canvasSize;
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string | null>(
    null
  );
  const [tempSize, setTempSize] = useState<string | null>(null);
  const [val, setVal] = useState<number>(canvasSize.width);

  useEffect(() => {
    setVal(canvasSize.width);
  }, [canvasSize.width]);

  function getRatioDim(ratio: string) {
    const [width, height] = ratio.split(":").map(Number);
    const aspectRatio = width / height;
    const canvasHeight = canvasSize.height;
    const scaledWidth = aspectRatio * canvasHeight;
    return {
      width: parseInt(scaledWidth.toFixed(2)),
      height: canvasHeight,
    };
  }

  const getSizeValue = () => {
    if (tempSize !== null) return tempSize;
    return val;
  };

  return (
    <div className="flex flex-col">
      <div className=" py-12 mx-auto">
        <div className="flex text-xl gap-3  w-fit items-center">
          <input
            className="w-12 border-b border-gray-900 outline-0 font-bold bg-transparent"
            type="text"
            value={getSizeValue()}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (isNaN(val) || val < 200 || val > 1440) {
                setTempSize(isNaN(val) ? "" : val.toString());
              } else {
                setTempSize(null);
                setVal(val);
              }
            }}
            onBlur={(e) => {
              const val = parseInt(e.target.value);
              if (isNaN(val) || val < 200 || val > 1120) {
                setTempSize(isNaN(val) ? "" : val.toString());
                return;
              }

              // editor.undoRedo.updateUndoRedoStack();
              const aspectRatio = `${val}:${canvasSize.height}`;
              console.log("aspectRatio", aspectRatio);
              stores.editorStore!.switchAspectRatio(aspectRatio);
              setSelectedAspectRatio(aspectRatio);
              setTempSize(null);
            }}
          />
          <p>:</p>
          <div className="w-fit">630</div>
        </div>
        <small className="text-xs">Max: 1120. Min: 200</small>
      </div>

      <div className="bg-gradient-to-b  flex justify-center items-center ">
        <div className="grid grid-cols-2 gap-8 w-full max-w-5xl px-8">
          {AspectRatios.map((ratio) => {
            const { width, height } = getRatioDim(ratio.name);
            return (
              <div
                key={ratio.name}
                onClick={() => {
                  stores.editorStore!.switchAspectRatio(ratio.name);
                  setSelectedAspectRatio(ratio.name);
                  // editor.undoRedo.updateUndoRedoStack();
                }}
                className={cn(
                  "flex relative  rounded-2xl shadow-xl transition-all cursor-pointer hover:scale-105 items-center",
                  selectedAspectRatio === ratio.name
                    ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-none"
                    : "bg-white border border-gray-200 hover:shadow-2xl",
                  themeStore.isDarkTheme
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-black"
                )}
              >
                <div className="flex p-6 flex-col justify-between items-center ">
                  <h3 className="text-xl font-bold tracking-wide">
                    {ratio.name}
                  </h3>
                  <small className="text-[10px] mt-auto">{`${width}x${height}`}</small>
                </div>

                {selectedAspectRatio === ratio.name && (
                  <div className="absolute top-3 right-3">
                    <FaCheckCircle className="text-2xl text-green-400" />
                  </div>
                )}

                {/* <div
            className={`absolute inset-x-0 bottom-0 p-4 text-center font-semibold tracking-wider 
            ${
              selectedAspectRatio === ratio.name
                ? 'text-white'
                : 'text-indigo-600'
            }`}
          ></div> */}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default AspectRatioSelector;
