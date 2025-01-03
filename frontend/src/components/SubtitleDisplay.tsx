import React from "react";
import SubtitleDisplaySingle from "./SubtitleDisplaySingle";
import SubtitleDisplayToolbar from "./SubtitleDisplayToolbar";
import { observer } from "mobx-react-lite";
import { stores } from "../store/Stores";
import { ElementTypes } from "../types/properties";
import { SubtitleElement } from "../types/editor";

const SubtitleDisplay = observer(() => {
  const elements = stores.editorStore!.store.elements;
  const subtitles = stores.editorStore!.store.elements.find(
    (e) => e.type === ElementTypes.subtitle
  );

  if (!subtitles) return <div>You have no subtitles to display</div>;

  return (
    <div
      className="overflow-auto"
      style={{
        maxHeight: "calc(100vh)",
      }}
    >
      <SubtitleDisplayToolbar />
      <div className="grid grid-cols-1 p-2 gap-4">
        {(subtitles as SubtitleElement).elements.map((subtitle) => (
          <SubtitleDisplaySingle key={subtitle.id} subtitle={subtitle} />
        ))}
      </div>
    </div>
  );
});

export default SubtitleDisplay;
