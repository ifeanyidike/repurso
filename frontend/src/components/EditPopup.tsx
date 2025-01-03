import React from "react";
import { MdDelete } from "react-icons/md";
import { IoDuplicate } from "react-icons/io5";
import { MdAutoDelete } from "react-icons/md";
import { Tooltip } from "antd";
import { CustomFabricObject } from "../types/properties";
import { observer } from "mobx-react-lite";
import { runInAction } from "mobx";
import { stores } from "../store/Stores";

type Props = {
  cannotDuplicate?: boolean;
  hasDeleteAll?: boolean;
};
const EditPopup = observer((props: Props) => {
  const elements = stores.editorStore!.store.elements;
  const fabricCanvas = stores.editorStore!.fabricCanvas;
  const selectedElementId = stores.editorStore!.store.selectedElementId;
  const subtitleElement = elements.find((e) => e.type === "subtitle");
  const isSubtitleActive = selectedElementId === subtitleElement?.id;

  const isVisible = (fabricCanvas?.getActiveObject() as CustomFabricObject)
    ?.visible;

  if (!isVisible) return null;

  return (
    <div className="absolute -top-12 left-0">
      <div className="relative bg-white rounded-lg shadow-md p-2">
        <div className="flex justify-between gap-3">
          {!isSubtitleActive && (
            <Tooltip placement="top" title="Duplicate">
              <button onClick={() => stores.editorStore!.duplicateElement()}>
                <IoDuplicate size={22} color="#333" />
              </button>
            </Tooltip>
          )}

          {isSubtitleActive && (
            <Tooltip placement="top" title="Remove All">
              <button
                onClick={() => {
                  runInAction(() => {
                    runInAction(() => stores.editorStore!.removeElement());
                  });
                }}
              >
                <MdAutoDelete size={22} color="#333" />
              </button>
            </Tooltip>
          )}
          <Tooltip placement="top" title="Remove">
            <button
              onClick={() =>
                runInAction(() => stores.editorStore!.removeSingleElement())
              }
            >
              <MdDelete size={22} color="#333" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
});

export default EditPopup;
