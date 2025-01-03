import { cloneDeep } from "lodash";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import { stores } from "../store/Stores";
import { saveEditorStoresToDB } from "../utils";

const PageUtility = observer(() => {
  const videoPlayer = stores.editorStore!.videoPlayer;
  const playerTime = videoPlayer?.currentTime;
  const pageRef = useRef<boolean>(false);

  useEffect(() => {
    if (pageRef.current) return;
    (async () => {
      await stores.initPromise;
    })();
    return () => {
      pageRef.current = true;
    };
  }, []);

  useEffect(() => {
    if (!stores.isSaving) return;
    let timer = setTimeout(() => {
      stores.isSaving = false;
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [stores.isSaving]);

  useEffect(() => {
    const autosaveInterval = setInterval(async () => {
      await saveEditorStoresToDB(cloneDeep(stores.editorStores));
    }, 600000);

    return () => clearInterval(autosaveInterval);
  }, []);

  useEffect(() => {
    const handleTouchMove = (e: any) => {
      if (e.scale !== 1) {
        e.preventDefault(); // Prevent pinch-zoom
      }
    };
    const handleWheel = (e: any) => {
      if (e.ctrlKey) {
        // Pinch zoom gestures usually trigger with ctrl key on desktop
        e.preventDefault(); // Prevent page zoom
      }
    };

    const handlePlayPause = (e: any) => {
      if (e.key === " " || e.keyCode === 32) {
        e.preventDefault();

        stores.editorStore!.handlePlayPause();

        console.log("Space key pressed, play button triggered.");
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      handlePlayPause(e);
      // handleForwardBackwards(e);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      // clearInterval(autosaveInterval);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);
  return <></>;
});

export default PageUtility;
