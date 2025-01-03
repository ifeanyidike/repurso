"use client";
import React from "react";
import Timeline from "./TimelineContent";
import { observer } from "mobx-react-lite";
import { EditorStore } from "../store/EditorStore";
import { stores } from "../store/Stores";

type Props = {
  store: EditorStore;
};
const TimelineContainer = observer((props: Props) => {
  return (
    <div>
      {Boolean(stores.editorStore!.videoDuration) && (
        <Timeline store={props.store} />
      )}
    </div>
  );
});

export default TimelineContainer;
