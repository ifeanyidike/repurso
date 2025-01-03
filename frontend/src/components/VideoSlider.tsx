import React, { forwardRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { runInAction } from "mobx";
import { stores } from "../store/Stores";

const VideoSlider = observer(
  forwardRef<HTMLVideoElement, {}>(({}, ref) => {
    const [sliderData, setSliderData] = useState<Record<
      "x" | "y" | "time",
      number
    > | null>(null);
    const videoTime = stores.editorStore!!.videoTime;
    const videoDuration = stores.editorStore!.videoDuration;
    const isPlaying = stores.editorStore!.isPlaying;
    const canvasSize = stores.editorStore!.store.canvasSize;

    const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) =>
      runInAction(() => {
        const video = stores.editorStore!.videoPlayer;
        if (video) {
          const newTime =
            (parseFloat(e.target.value) * stores.editorStore!.videoDuration) /
            100;
          stores.editorStore!.prevTime = videoTime;
          video.currentTime = newTime;
          stores.editorStore!.videoTime = newTime;
          stores.editorStore!.seekVideoAndAudios(videoTime);
          if (isPlaying) {
            video.play();
            // stores.editorStore!.isPlaying.set(false);
          }
        }
      });
    return (
      <div
        className=" w-[90%] mx-auto justify-center"
        style={{ maxWidth: canvasSize.width - 20 }}
      >
        <div className="relative w-full">
          {sliderData && (
            <div
              style={{
                left: sliderData.x,
                top: sliderData.y - 35,
              }}
              className="fixed transform -translate-x-1/2 -top-5 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              {sliderData.time} s
            </div>
          )}

          <input
            type="range"
            className="w-full video-slider-range"
            min="0"
            max="100"
            value={(videoTime / videoDuration) * 100 || 0}
            onChange={handleScrub}
            onMouseMove={(e) => {
              const slider = e.currentTarget;
              const sliderRect = slider.getBoundingClientRect();
              const mouseX = e.clientX - sliderRect.left;
              const sliderWidth = sliderRect.width;

              const percent = (mouseX / sliderWidth) * 100;

              const time = (percent / 100) * videoDuration;

              // Update tooltip position and content
              setSliderData({
                x: e.clientX,
                y: e.clientY,
                time: Math.max(parseFloat(time.toFixed(1)), 0),
              });
            }}
            onMouseOut={() => setSliderData(null)}
          />
        </div>
      </div>
    );
  })
);

export default VideoSlider;
