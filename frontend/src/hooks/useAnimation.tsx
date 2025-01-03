import React, { useEffect, useRef } from "react";
import * as fabric from "fabric";
import {
  AnimationKeys,
  ImageElement,
  TextElement,
  Video,
} from "../types/editor";
import FabricAnimation from "../service/FabricAnimation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import AnimationEffect from "../service/AnimationEffect";
import { animationMethods } from "../utils";
import { ElementTypes } from "../types/properties";
import { stores } from "../store/Stores";

const useAnimation = (
  canvas: fabric.Canvas | null,
  htmlCanvas: HTMLCanvasElement | null
) => {
  const elements = stores.editorStore!.store.elements;
  const videoTime = stores.editorStore!.videoTime;
  const animationCtrl = stores.editorStore!.animationCtrl;
  const isPlaying = stores.editorStore!.store.isPlaying;

  const timeline = useRef<gsap.core.Timeline>();
  const fabricObjects = canvas?.getObjects();

  const triggerAnimation = (
    key: string,
    data: {
      key: AnimationKeys;
      duration: number;
    },
    effect: AnimationEffect,
    object?: fabric.Object,
    elementAnimationDuration: number = 0
  ) => {
    if (data.key === AnimationKeys.none || data.duration === 0) {
      const speed = key === "element" ? elementAnimationDuration : 0;
      // console.log('key', key, data.key, speed);
      effect.none(speed);
    } else {
      console.log("data", data.key, data.duration, key);
      const effects = animationMethods(effect, data.duration, object!);
      //@ts-expect-error no error
      effects[data.key]();
    }
  };

  //   useGSAP(
  //     () => {
  //       timeline.current = gsap.timeline();
  //       const focusElements = elements.filter(e => e.type !== ElementTypes.audio);

  //       for (let element of elements) {
  //         console.log('element', element.type);
  //         if (
  //           element.type === ElementTypes.primaryVideo ||
  //           element.type === ElementTypes.subtitle ||
  //           element.type === ElementTypes.audio
  //         ) {
  //           continue;
  //         }

  //         const el = element as Video | ImageElement | TextElement;
  //         const object = fabricObjects?.find(e => element.id === e.id);
  //         console.log('object', object, el);

  //         const effect = new AnimationEffect(timeline.current, object!);
  //         const anim = el?.animation;
  //         const elementAnimationDuration =
  //           el.duration -
  //           (anim?.enter?.duration || 0) -
  //           (anim?.exit?.duration || 0);
  //         triggerAnimation('enter', anim?.enter, effect, object);
  //         triggerAnimation(
  //           'element',
  //           anim.element,
  //           effect,
  //           object,
  //           elementAnimationDuration
  //         );
  //         triggerAnimation('exit', anim.exit, effect, object);
  //       }
  //     },
  //     {
  //       scope: { current: htmlCanvas },
  //       dependencies: [videoTime],
  //       //dependencies: [videoTime, element, playedTime, isVisible],
  //       // revertOnUpdate: true,
  //     }
  //   );

  timeline.current = gsap.timeline();
  const focusElements = elements.filter((e) => e.type !== ElementTypes.audio);

  for (let element of elements) {
    if (
      element.type === ElementTypes.primaryVideo ||
      element.type === ElementTypes.subtitle ||
      element.type === ElementTypes.audio
    ) {
      continue;
    }
    console.log("element", element.type);
    const el = element as Video | ImageElement | TextElement;
    //@ts-expect-error to be worked on
    const object = fabricObjects?.find((e) => element.id === e.id);
    console.log("object", object, el);

    const effect = new AnimationEffect(timeline.current, object!);
    //@ts-expect-error to be worked on
    const anim = el?.animation;
    const elementAnimationDuration =
      //@ts-expect-error to be worked on
      el.duration - (anim?.enter?.duration || 0) - (anim?.exit?.duration || 0);
    triggerAnimation("enter", anim?.enter, effect, object);
    triggerAnimation(
      "element",
      anim.element,
      effect,
      object,
      elementAnimationDuration
    );
    triggerAnimation("exit", anim.exit, effect, object);
  }

  useEffect(() => {
    for (let el of elements) {
      const shouldDisplay =
        el.time <= videoTime && videoTime <= el.time + el.duration;

      if (!shouldDisplay) {
        timeline.current?.pause();
        timeline.current?.revert();
      } else {
        const playedTime = videoTime - el.time;

        if (isPlaying) {
          timeline.current?.play(playedTime);
        } else {
          timeline.current?.pause(playedTime);
        }
      }
    }
  }, [videoTime, elements, isPlaying]);
};

export default useAnimation;
