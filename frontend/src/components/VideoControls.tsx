import React, { forwardRef } from "react";
import { GoMute, GoUnmute } from "react-icons/go";
import {
  FaBackwardStep,
  FaForwardStep,
  FaPlay,
  FaPause,
} from "react-icons/fa6";
import { observer } from "mobx-react-lite";
import { runInAction } from "mobx";
import { stores } from "../store/Stores";
import { themeStore } from "../store/ThemeStore";
import { cn } from "../utils";

type Props = {};

const VideoControls = observer(
  forwardRef<HTMLVideoElement, Props>((props, ref) => {
    const canvasSize = stores.editorStore!.store.canvasSize;
    const isMuted = stores.editorStore!.store.isMuted;
    const isPlaying = stores.editorStore!.isPlaying;
    const videoTime = stores.editorStore!.videoTime;
    const videoDuration = stores.editorStore!.videoDuration;
    const videoRef = ref as React.RefObject<HTMLVideoElement>;

    const handleMute = () =>
      runInAction(() => {
        if (stores.editorStore!.videoPlayer) {
          stores.editorStore!.videoPlayer!.muted = !isMuted;
          stores.editorStore!.store.isMuted = !isMuted;
        }
      });
    return (
      <div
        className={`flex w-full justify-between py-5 mx-auto px-10 ${
          canvasSize.width > 1120 ? `w[${canvasSize.width}px]` : "w-[1120px]"
        }`}
      >
        <div
          className={cn(
            themeStore.isDarkTheme ? "text-[#fafafa]" : "text-[#333]",
            "flex text-lg"
          )}
        >
          <p className="font-bold">
            {stores.editorStore!.formatTime(videoTime)}
          </p>{" "}
          /{" "}
          <p
            className={cn(
              themeStore.isDarkTheme ? "text-[#fafafa]" : "text-[#333]",
              "flex text-lg"
            )}
            // className="text-gray-600"
          >
            {stores.editorStore!.formatTime(videoDuration)}
          </p>
        </div>

        <div className="flex gap-5">
          <button
            onClick={() => {
              if (videoRef.current) {
                const prevTime = videoTime;
                videoRef.current.currentTime = 0;
                stores.editorStore!.videoPlayer!.currentTime = 0;
                stores.editorStore!.videoTime = 0;
                stores.editorStore!.prevTime = prevTime;
              }
            }}
          >
            <FaBackwardStep
              size={22}
              color={themeStore.isDarkTheme ? "#fafafa" : "#333"}
            />
          </button>
          <button onClick={() => stores.editorStore!.handlePlayPause()}>
            {isPlaying ? (
              <FaPause
                size={22}
                color={themeStore.isDarkTheme ? "#fafafa" : "#333"}
              />
            ) : (
              <FaPlay
                size={22}
                color={themeStore.isDarkTheme ? "#fafafa" : "#333"}
              />
            )}
          </button>
          <button
            onClick={() =>
              runInAction(() => {
                if (videoRef.current) {
                  const prevTime = videoTime;
                  videoRef.current.currentTime = videoDuration;
                  stores.editorStore!.isPlaying = false;

                  stores.editorStore!.videoPlayer!.currentTime = videoDuration;
                  stores.editorStore!.videoTime = videoDuration;
                  stores.editorStore!.prevTime = prevTime;
                }
              })
            }
          >
            <FaForwardStep
              size={22}
              color={themeStore.isDarkTheme ? "#fafafa" : "#333"}
            />
          </button>
        </div>
        <button onClick={handleMute}>
          {isMuted ? (
            <GoMute
              color={themeStore.isDarkTheme ? "#fafafa" : "#333"}
              size={20}
            />
          ) : (
            <GoUnmute
              color={themeStore.isDarkTheme ? "#fafafa" : "#333"}
              size={20}
            />
          )}
        </button>
      </div>
    );
  })
);

export default VideoControls;
