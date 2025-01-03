import React, { useEffect, useRef, useState } from "react";
import EditPopup from "./EditPopup";
import { Resizable } from "re-resizable";
import { FaPlay } from "react-icons/fa6";
import VideoSlider from "./VideoSlider";
import * as fabric from "fabric";
import VideoControls from "./VideoControls";
import LoadingSkeleton from "./LoadingSkeleton";
import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { EditorStore } from "../store/EditorStore";
import { stores } from "../store/Stores";
import { PauseIcon } from "../icons/editor-icons";

type Props = {
  editorStore: EditorStore;
};

const VideoEditor = observer(({ editorStore }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const canvasSize = editorStore.store.canvasSize;
  const actionRef = useRef<HTMLDivElement>(null);
  const videoTime = editorStore.videoTime;
  const isLoading = editorStore.isLoading;
  const isResizingEditor = editorStore.isResizingEditor;
  const changeCount = editorStore.changeCount;
  const renderedRef = useRef<boolean>(false);

  useEffect(() => {
    console.log("stores.editorStore.store", stores.editorStore);
  }, [stores.editorStore!.store]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Set editor references
    runInAction(() => {
      editorStore.videoCanvas = canvasRef.current;
      editorStore.elementPopupAction = actionRef.current;
    });

    // Initialize Fabric.js canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasSize.width,
      height: canvasSize.height,
      preserveObjectStacking: true,
      backgroundColor: "rgba(0, 0, 0, 0)",
      freeDrawingCursor: "pointer",
      uniformScaling: true,
      selection: true,
      hoverCursor: "pointer",
      centeredScaling: true,
      hoverCursorDelay: 100,
      renderOnAddRemove: false,
    });
    fabricCanvasRef.current = canvas;

    // Only load video if `renderedRef` has been set
    runInAction(() => {
      if (renderedRef.current) {
        // Get video element and set the source
        const url = editorStore.originalVideoBlob
          ? URL.createObjectURL(editorStore.originalVideoBlob)
          : editorStore.originalVideoUrl;
        console.log(
          "url created",
          editorStore.originalVideoBlob,
          editorStore.originalVideoBlob &&
            URL.createObjectURL(editorStore.originalVideoBlob)
        );
        const video = editorStore.getVideoElement(
          0,
          url!,
          canvasSize.height,
          canvasSize.width
        );

        // Set `onloadeddata` to run only once
        video.addEventListener(
          "loadeddata",
          function handleLoadedData(e) {
            console.log("Load triggered once", e);
            editorStore.loadMainVideo(url!, video);
          },
          { once: true }
        );
      }
    });

    // Canvas object addition listener
    fabricCanvasRef.current.on("object:added", (o) => {
      console.log("Object added to canvas", o);
    });

    // Assign Fabric.js canvas to editor
    runInAction(() => (editorStore.fabricCanvas = fabricCanvasRef.current));

    // Animation loop for continuous rendering
    fabric.util.requestAnimFrame(function render() {
      canvas.renderAll();
      fabric.util.requestAnimFrame(render);
    });

    // Set loading state to false
    runInAction(() => (editorStore.isLoading = false));

    // Cleanup on unmount
    return () => {
      canvas.dispose();
      renderedRef.current = true;
    };
  }, []);

  useEffect(() => {
    editorStore.updateObjectVisibility(videoTime);
  }, [videoTime, changeCount]);

  return (
    <>
      <div className={`${isLoading && "hidden"} relative`}>
        <Resizable
          className={`${
            isResizingEditor && "border  border-green-500 rounded-lg"
          } `}
          defaultSize={{
            width: canvasSize.width,
            height: canvasSize.height,
          }}
          size={{
            width: canvasSize.width,
            height: canvasSize.height,
          }}
          minWidth={320}
          minHeight={240}
          maxWidth={1120}
          maxHeight={630}
          enable={{
            top: false,
            right: true, // Enable resizing on the right side
            bottom: false,
            left: true, // Enable resizing on the left side
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
          }}
          onResizeStart={() =>
            runInAction(() => {
              editorStore.isResizingEditor = true;
            })
          }
          onResizeStop={(e, dir, ref, d) => {
            runInAction(() => editorStore.onResizeEnd(e, dir, ref, d));
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              overflow: "hidden",
              position: "relative",
            }}
            className="group"
          >
            <canvas
              className={`${
                !isLoading ? "rounded-lg border-4 border-black" : ""
              }`}
              ref={canvasRef}
              style={{
                position: "absolute",
                width: canvasSize.width,
                height: canvasSize.height,
              }} // Position the canvas
            ></canvas>
            {!isLoading && (
              <>
                <button
                  className="z-[999999] absolute top-1/2 left-1/2 hidden group-hover:flex rounded-full bg-black/50 p-3"
                  onClick={() => {
                    console.log("stores.editorStore");
                    stores.editorStore!.handlePlayPause();
                  }}
                >
                  {editorStore.isPlaying ? (
                    <PauseIcon />
                  ) : (
                    <FaPlay color="#fff" />
                  )}
                </button>
                <div className="z-[999999] w-full bottom-bar absolute bottom-2 flex items-end  opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <VideoSlider ref={videoRef} />
                </div>
              </>
            )}
            <div ref={actionRef} className="hidden fixed">
              <EditPopup />
            </div>
          </div>
        </Resizable>
        <VideoControls ref={videoRef} />
      </div>
      {isLoading && <LoadingSkeleton />}
    </>
  );
});

export default VideoEditor;
