import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import VideoEditor from "./VideoEditor";
import { Tabs } from "antd";
import { runInAction } from "mobx";
import TimelineContainer from "./TimelineContainer";
import { stores } from "../store/Stores";
import { ffmpeg_util } from "../service/FFmpeg";

const VideoEditorContainer = observer(() => {
  const onChange = (storeID: string) => {
    runInAction(() => (stores.activeStoreID = storeID));
  };
  useEffect(() => {
    // Load FFmpeg
    ffmpeg_util.load();
  }, []);
  return (
    <>
      <Tabs
        onChange={onChange}
        type="card"
        items={stores.editorStores.map((editorStore) => ({
          label: <p className="text-blue-500 font-bold">{editorStore.title}</p>,
          key: editorStore.storeID,
          children: (
            <>
              <div className="!mx-auto flex flex-col items-center">
                <VideoEditor editorStore={editorStore} />
              </div>
              <TimelineContainer
                key={editorStore.storeID}
                store={editorStore}
              />
            </>
          ),
        }))}
      />
    </>
  );
});

export default VideoEditorContainer;
