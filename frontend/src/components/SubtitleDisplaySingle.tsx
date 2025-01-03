import React, { useEffect, useRef, useState } from "react";
import { TrashIcon } from "@heroicons/react/20/solid";
import { FiClock, FiEdit } from "react-icons/fi";
import { observer } from "mobx-react-lite";
import { SubtitleItem } from "../types/editor";
import { stores } from "../store/Stores";
import { useClickOutside } from "../hooks/useClickOutside";
import { property } from "../store/PropertyStore";
import { Tooltip } from "antd";
import { utility } from "../service/Utility";

type Props = {
  subtitle: SubtitleItem;
};
const SubtitleDisplaySingle = observer(({ subtitle }: Props) => {
  const [isContentEditable, setContentEditable] = useState(false);
  const editableRef = useRef<HTMLDivElement>(null);
  const [subtitleText, setSubtitleText] = useState(subtitle.text);
  const [editingState, setEditingState] = useState<
    "none" | "inprogress" | "completed" | "saved"
  >("none");
  const currentTime = stores.editorStore!.videoTime;

  useClickOutside(editableRef, () => {
    setContentEditable(false);
    setEditingState((prev) => (prev === "inprogress" ? "completed" : prev));
  });

  useEffect(() => {
    if (editingState === "completed") {
      property.editSubtitleElement(subtitle.id, {
        text: subtitleText,
      });
      setEditingState("saved");
    }
  }, [editingState]);

  return (
    <div
      ref={editableRef}
      key={subtitle.id}
      //
      className="relative p-2 min-h-24 gap bg-white shadow-md rounded-md transition-all duration-300 hover:shadow-lg group"
    >
      <p
        className={`text-gray-600 text-[15px] font-medium mb-4 leading-relaxed w-[90%] mr-auto ${
          isContentEditable && "border border-gray-500 rounded p-2"
        }`}
        onBlur={() => {
          setContentEditable(false);
        }}
        contentEditable={isContentEditable}
        suppressContentEditableWarning
        onDoubleClick={() => setContentEditable(true)}
        onInput={(e) => {
          const content = e.currentTarget.innerText;
          setSubtitleText(content);
          setEditingState("inprogress");
        }}
      >
        {subtitle.text}
      </p>
      <div className="absolute top-2 right-2 group-hover:flex hidden items-center flex-col gap-3">
        <div>
          <Tooltip
            placement="top"
            title={
              <>
                <p>{`Start: ${stores.editorStore!.formatTime(
                  utility.getTimeFromSrtObject(subtitle.start)
                )}`}</p>
                <p>{`End: ${stores.editorStore!.formatTime(
                  utility.getTimeFromSrtObject(subtitle.end)
                )}`}</p>
              </>
            }
          >
            <FiClock
              data-tooltip-id={`tooltip-${subtitle.id}`}
              className="text-gray-500 hover:text-gray-800 cursor-pointer"
              size={15}
            />
          </Tooltip>
        </div>
        <button onClick={() => setContentEditable(!isContentEditable)}>
          <FiEdit
            data-tooltip-id={`edit-tooltip-${subtitle.id}`}
            className="text-gray-500 hover:text-gray-800 cursor-pointer"
            size={15}
          />
        </button>
        <button
          onClick={() => {
            stores.editorStore!.removeSingleSubtitle(subtitle.id);
            stores.editorStore!.updateSubtitleText(currentTime);
          }}
          className=" p-1 rounded-full bg-red-200 text-white hover:bg-red-600 focus:outline-none transition-colors"
          aria-label="Delete subtitle"
        >
          <TrashIcon className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
});

export default SubtitleDisplaySingle;
