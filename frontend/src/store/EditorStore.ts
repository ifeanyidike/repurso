"use client";

import { makeAutoObservable, runInAction } from "mobx";
import {
  Element,
  TextElement,
  ImageElement,
  SubtitleItem,
  SubtitleElement,
  Store,
  AnimationKeys,
  Video,
  Audio,
  AnimationController,
} from "../types/editor";
import { property } from "./PropertyStore";
import {
  RightTab,
  ElementTypes,
  type SubtitleState,
  CustomFabricObject,
} from "../types/properties";
import undoredo from "./UndoRedo";
import * as fabric from "fabric";
import { Direction } from "re-resizable/lib/resizer";
import { NumberSize } from "re-resizable";
import cloneDeep from "lodash/cloneDeep";
import { Textbox } from "../customFabricElements/Textbox";
import { IText } from "../customFabricElements/IText";
import { FabricVideo } from "../customFabricElements/video";
import { FabricImage } from "../customFabricElements/image";
import TimelineStore from "./TimelineStore";
import { utility } from "../service/Utility";
import { Howl } from "howler";
import { TimelineState } from "../components/Timeline";

export class EditorStore {
  public storeID: string = crypto.randomUUID();
  public DEFAULT_HEIGHT = 630;
  public videoTime = 0;
  public prevTime = 0;
  public videoDuration = 0;
  public videoPlayer: HTMLVideoElement | null = null;
  public videoCanvas: HTMLCanvasElement | null = null;
  public fabricCanvas: fabric.Canvas | null = null;
  public elementPopupAction: HTMLDivElement | null = null;
  public timelineState: TimelineState | null = null;
  public container: HTMLDivElement | null = null;
  public originalSubtitleElements: SubtitleItem[] = [];
  public undoRedo: undoredo;
  public timelineStore: TimelineStore;
  public isLoading: boolean = true;
  public isResizingEditor: boolean = false;
  public animationCtrl: AnimationController = new Map();
  public changeCount = 0;
  public originalVideoUrl: string | null = null;
  public originalVideoBlob?: Blob = undefined;
  public originalVideoAudioBlob?: Blob = undefined;
  public datUrl: string | null = null;
  public videoAudioUrl: string | null = null;
  public originalVideoTitle: string | null = null;
  public title: string = "";
  public srt: string | null = null;
  public initialElements: Element[] = [];
  public isPlaying: boolean = false;

  public initialState = {
    isPlaying: false as Store["isPlaying"],
    isMuted: false as Store["isMuted"],
    elements: [] as Store["elements"],
    canvasSize: {
      width: (this.DEFAULT_HEIGHT * 16) / 9,
      height: this.DEFAULT_HEIGHT,
    },
    selectedElementId: null as string | null,
    selectedElement: null as Element | null,
    selectedSubtitleId: null as string | null,
    subtitleActions: {
      commasHidden: false,
      periodsHidden: false,
      fillersHidden: false,
      uppercaseTransform: false,
      lowercaseTransform: false,
      capitalizeTransform: false,
    } as SubtitleState,
    canvasState: null as Store["canvasState"],
  };

  public store = this.initialState;
  public canvasSizeBeforeResize = this.store.canvasSize;
  public loadMainVideo(
    src: string,
    // src: string,
    // datUrl: string | undefined,
    // title: string,
    // audio: string,
    video: HTMLVideoElement,
    videoTime = 0,
    pos = { x: 0, y: 0 },
    scale = { x: 1, y: 1 }
  ) {
    const id = crypto.randomUUID();
    // const video = this.getVideoElement(src, height, width)
    video.id = id;
    if (this.videoPlayer) this.videoPlayer.id = id;

    const fabricVideo = new FabricVideo(video, {
      id,
      left: 0,
      top: 0,
      scaleX: 1,
      scaleY: 1,
      absolutePositioned: true,
      preserveObjectStacking: true,
      width: this.store.canvasSize.width,
      height: this.store.canvasSize.height,
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      objectCaching: true,
      visible: true,
      elementType: ElementTypes.primaryVideo,
    });
    console.log("Load triggered");
    console.log("fabric video", fabricVideo, video, video.duration);
    const track = this.getElementTypeTrack(ElementTypes.primaryVideo);
    // const videoTime = this.getPrevVideoTimeAndDuration().length + 0.1
    const vidIdx = this.store.elements.findIndex(
      (e) => e.type === ElementTypes.primaryVideo
    );
    if (vidIdx <= -1) {
      const audio = this.originalVideoAudioBlob
        ? URL.createObjectURL(this.originalVideoAudioBlob)
        : this.videoAudioUrl!;

      this.store.elements.push({
        id,
        type: ElementTypes.primaryVideo,
        src,
        datUrl: this.datUrl!,
        audio,
        time: videoTime,
        track,
        duration: video.duration,
        volume: video.volume,
        pos,
        size: {
          width: this.store.canvasSize.width,
          height: this.store.canvasSize.height,
        },
        title: this.originalVideoTitle!,
        videoBlob: this.originalVideoBlob!,
        audioBlob: this.originalVideoAudioBlob!,
        fabricObject: fabricVideo,
        locked: true,
        hidden: false,
        scaleX: scale.x,
        scaleY: scale.y,
      });
    }
    // else {
    //   this.store.elements[vidIdx] = {
    //     ...this.store.elements[vidIdx],
    //     src,
    //     time: 0,
    //     duration: video.duration,
    //     audio,
    //     title,
    //     fabricObject: fabricVideo,
    //   };
    // }

    this.fabricCanvas!.add(fabricVideo);

    fabricVideo.on("selected", (o) => {
      this.setSelectedElementId((o.target as CustomFabricObject).id);
      o.e?.preventDefault();
    });
    this.saveCanvasState();

    if (this.initialElements.length) {
      this.store.elements.push(...this.initialElements);
      this.saveCanvasState();
    }

    this.timelineStore.engine.current?.listener.on("play", () => {
      runInAction(() => (this.isPlaying = true));
      console.log("timeline state, play");
      video?.play();
    });
    this.timelineStore.engine.current?.listener.on("paused", () => {
      runInAction(() => {
        this.isPlaying = false;
        video?.pause();
        const audioElements = this.store.elements
          .filter((e) => e.type === ElementTypes.audio && (e as Audio).audio)
          .map((e) => (e as Audio).audio) as Howl[];
        audioElements.forEach((e) => {
          if (e.playing()) e!.pause();
        });
      });
      console.log("timeline state, paused");
    });
    this.timelineStore.engine.current?.listener.on(
      "afterSetTime",
      ({ time }) => {
        runInAction(() => {
          console.log("currentStore video player");

          video.currentTime = time;
        });
      }
    );
  }

  private getPrevVideoTimeAndDuration() {
    const primaryVideos = this.store.elements
      .filter((el) => el.type === ElementTypes.primaryVideo)
      .sort((el1, el2) => el1.time - el2.time);
    if (!primaryVideos.length) return { time: 0, length: 0 };
    const lastVideo = primaryVideos[primaryVideos.length - 1];
    return {
      time: lastVideo.time,
      length: lastVideo.time + lastVideo.duration,
    };
  }

  private getLastTrack() {
    return this.store.elements.reduce((maxTrack, el) => {
      if (el.track === "last") return maxTrack;
      return Math.max(maxTrack, el.track);
    }, 0);
  }

  private getElementTypeTrack(type: ElementTypes) {
    const existingElementType = this.store.elements.find(
      (e) => e.type === type
    );
    if (existingElementType) return existingElementType.track;
    return this.getLastTrackOfType(type) + 1;
  }

  private getLastTrackOfType(type: ElementTypes) {
    return this.store.elements.reduce((maxTrack, el) => {
      if (
        el.type === type &&
        el.track !== "last" &&
        Math.max(maxTrack, el.track) === el.track
      )
        return el.track;
      return maxTrack;
    }, 0);
  }

  private getFreeTrack(
    elements: Element[],
    time: number,
    duration: number
  ): number | null {
    const newEnd = time + duration;

    const elementsByTrack = elements
      .filter((e) => e.track !== "last")
      .reduce((acc, el) => {
        if (!acc[el.track as number]) acc[el.track as number] = [];
        acc[el.track as number].push(el);
        return acc;
      }, {} as Record<number, Element[]>);

    for (const [track, trackElements] of Object.entries(elementsByTrack)) {
      const hasOverlap = trackElements.some((el) => {
        const elEnd = el.time + el.duration;
        return !(elEnd <= time || el.time >= newEnd);
      });

      if (!hasOverlap && track !== "last") {
        return parseInt(track, 10);
      }
    }

    // If no free track found, return null
    return null;
  }

  private selectTrackForElement(
    type: ElementTypes,
    time: number,
    duration: number
  ): number {
    const relatedEls = this.store.elements.filter((e) => e.type === type);

    if (!relatedEls.length) return this.getLastTrack() + 1;

    console.log("Related elements:", relatedEls);
    const freeTrack = this.getFreeTrack(relatedEls, time, duration);

    console.log("Selected free track:", freeTrack);

    return freeTrack !== null ? freeTrack : this.getLastTrack() + 1;
  }

  saveCanvasState() {
    if (!this.fabricCanvas) return;
    let canvasState = cloneDeep(this.fabricCanvas.toJSON());
    // canvasState.objects = canvasState.objects.map((o: CustomFabricObject) => {
    //   if (o?.src?.endsWith('.mp4')) return { ...o, data: { isVideo: true } };
    //   return o;
    // });

    this.store.canvasState = canvasState;
  }

  private loadSubtitles() {
    if (!this.srt) return;
    const subtitleElements = utility.convertSrtToArray(this.srt!);
    this.originalSubtitleElements = subtitleElements;
    const subtitleIdx = this.store.elements.findIndex(
      (p) => p.type === ElementTypes.subtitle
    );
    const data = {
      id: crypto.randomUUID(),
      type: ElementTypes.subtitle,
      fillColor: "#000000",
      backgroundColor: "#FFFFFF",
      textBackgroundColor: null,
      fontFamily: "Arial",

      elements: subtitleElements,
      size: {
        width: this.store.canvasSize.width * 0.8,
        height: "fit-content" as "fit-content",
      },
      fontSize: 24,
      locked: false,
      hidden: false,
      scaleX: 1,
      scaleY: 1,
      pos: {
        x: this.store.canvasSize.width * 0.1,
        y: this.store.canvasSize.height - 100,
      },
      track: "last" as const,
      time: 0,
      duration: this.videoDuration,
    };
    if (subtitleIdx > -1) {
      this.store.elements[subtitleIdx] = data;
    } else {
      this.store.elements.push(data);
    }
  }

  constructor(
    originalVideoUrl: string,
    datUrl: string | null,
    originalVideoTitle: string,
    videoAudioUrl: string,
    title: string,
    srt: string | null,
    videoBlob?: Blob,
    audioBlob?: Blob
  ) {
    makeAutoObservable(this);
    console.log("Initializing...");
    this.originalVideoUrl = originalVideoUrl;
    this.datUrl = datUrl;
    this.videoAudioUrl = videoAudioUrl;
    this.originalVideoTitle = originalVideoTitle;
    this.title = title;
    this.srt = srt;
    this.originalVideoBlob = videoBlob;
    this.originalVideoAudioBlob = audioBlob;

    this.loadSubtitles();
    //this.undoRedo = new undoredo(this.store);
    this.undoRedo = new undoredo(this);
    this.timelineStore = new TimelineStore(this);
  }

  private addVideoToDom(url: string, width: number, height: number) {
    const video = document.createElement("video");
    video.width = width;
    video.height = height;
    video.src = url;
    video.crossOrigin = "anonymous";
    video.preload = "auto";

    // const source = document.createElement('source');
    // source.src = url;
    // source.type = 'video/mp4';
    // video.appendChild(source);
    video.addEventListener(
      "loadeddata",
      () => {
        video.pause(); // Pause if it autoplays on load
      },
      { once: true }
    );
    video.load();
    return video;
  }

  getVideoElement(time: number, url: string, height: number, width: number) {
    const video = this.addVideoToDom(url, width, height);

    // video.play()
    // video.muted = true;

    // Wait for the 'loadedmetadata' event before accessing the duration
    video.addEventListener("loadedmetadata", () => {
      runInAction(() => {
        if (!this.videoDuration) {
          this.videoDuration = video.duration;
        }

        this.videoPlayer = video;
        video.currentTime = time;
        this.isPlaying = false;
        this.store.isMuted = true;
      });
      video.play();
    });

    video.ontimeupdate = (event) => this.onTimeUpdate(event);

    return video;
  }

  public addVideoElement(src: string = "/media/vid1.mp4") {
    const width = this.store.canvasSize.width * 0.7;
    const height = this.store.canvasSize.height * 0.7;

    const video = this.addVideoToDom(src, width, height);

    video.play();
    const x = this.store.canvasSize.width / 2 - width / 2;
    const y = this.store.canvasSize.height / 2 - height / 2;
    video.addEventListener(
      "loadeddata",
      () => {
        const id = crypto.randomUUID();
        const fabricVideo = new FabricVideo(video, {
          id,
          left: x,
          top: y,
          scaleX: 1,
          scaleY: 1,
          absolutePositioned: true,
          preserveObjectStacking: true,
          width,
          height,
          objectCaching: true,
          visible: true,
          elementType: ElementTypes.video,
        });
        const track = this.selectTrackForElement(
          ElementTypes.video,
          this.videoTime,
          video.duration
        );
        // video.currentTime = time;
        console.log("x y", x, y);
        this.store.elements.push({
          id,
          type: ElementTypes.video,
          src,
          time: this.videoTime,
          track,
          duration: video.duration,
          volume: video.volume,
          pos: { x, y },
          size: { width, height },
          title: "Broll Video",
          fabricObject: fabricVideo,
          locked: false,
          hidden: false,
          scaleX: 1,
          scaleY: 1,
          isPlaying: false,
          video,
        });

        this.fabricCanvas!.add(fabricVideo);

        fabricVideo.on("selected", (o) => {
          this.setSelectedElementId((o.target as CustomFabricObject).id);
          o.e?.preventDefault();
        });
        this.saveCanvasState();
        video.pause();
      },
      { once: true }
    );
  }

  private setProperties(o: any) {
    return {
      width: o.width,
      height: o.height,
      absolutePositioned: o.absolutePositioned,
      angle: o.angle,
      ...(o.borderRadius && { borderRadius: o.borderRadius }),
      ...(o.borderColor && { borderColor: o.borderColor }),
      ...(o.borderScaleFactor && { borderScaleFactor: o.borderScaleFactor }),
      ...(o.cornerColor && { cornerColor: o.cornerColor }),
      ...(o.cornerSize && { cornerSize: o.cornerSize }),
      ...(o.cornerStrokeColor && { cornerStrokeColor: o.cornerStrokeColor }),
      ...(o.cornerStyle && { cornerStyle: o.cornerStyle }),
      ...(o.direction && { direction: o.direction }),
      ...(o.editable && { editable: o.editable }),
      ...(o.editingBorderColor && { editingBorderColor: o.editingBorderColor }),
      ...(o.fill && { fill: o.fill }),
      ...(o.flipX && { flipX: o.flipX }),
      ...(o.flipY && { flipY: o.flipY }),
      ...(o.fontFamily && { fontFamily: o.fontFamily }),
      ...(o.fontSize && { fontSize: o.fontSize }),
      ...(o.fontStyle && { fontStyle: o.fontStyle }),
      ...(o.fontWeight && { fontWeight: o.fontWeight }),
      ...(o.hasBorders && { hasBorders: o.hasBorders }),
      ...(o.hasControls && { hasControls: o.hasControls }),
      ...(o.left && { left: o.left }),
      ...(o.lineHeight && { lineHeight: o.lineHeight }),
      ...(o.linethrough && { linethrough: o.linethrough }),
      ...(o.lockMovementX && { lockMovementX: o.lockMovementX }),
      ...(o.lockMovementY && { lockMovementY: o.lockMovementY }),
      ...(o.lockRotation && { lockRotation: o.lockRotation }),
      ...(o.lockScalingFlip && { lockScalingFlip: o.lockScalingFlip }),
      ...(o.lockScalingX && { lockScalingX: o.lockScalingX }),
      ...(o.lockScalingY && { lockScalingY: o.lockScalingY }),
      ...(o.lockSkewingX && { lockSkewingX: o.lockSkewingX }),
      ...(o.lockSkewingY && { lockSkewingY: o.lockSkewingY }),
      ...(o.opacity && { opacity: o.opacity }),
      ...(o.originX && { originX: o.originX }),
      ...(o.originY && { originY: o.originY }),
      ...(o.preserveObjectStacking && {
        preserveObjectStacking: o.preserveObjectStacking,
      }),
      ...(o.scaleX && { scaleX: o.scaleX }),
      ...(o.scaleY && { scaleY: o.scaleY }),
      ...(o.selectionColor && { selectionColor: o.selectionColor }),
      ...(o.selectionEnd && { selectionEnd: o.selectionEnd }),
      ...(o.selectionStart && { selectionStart: o.selectionStart }),
      ...(o.skewX && { skewX: o.skewX }),
      ...(o.strokeColor && { strokeColor: o.strokeColor }),
      ...(o.subscript && { subscript: o.subscript }),
      ...(o.superscript && { superscript: o.superscript }),
      ...(o.text && { text: o.text }),
      ...(o.textAlign && { textAlign: o.textAlign }),
      ...(o.textLines && { textLines: o.textLines }),
      ...(o.top && { top: o.top }),
      ...(o.touchCornerSize && { touchCornerSize: o.touchCornerSize }),
      ...(o.transparentCorners && { transparentCorners: o.transparentCorners }),
      ...(o.underline && { underline: o.underline }),
      ...(o.visible && { visible: o.visible }),
      ...(o.padding && { padding: o.padding }),
      ...(o.srcFromAttribute && { srcFromAttribute: o.srcFromAttribute }),
      ...(o.transparentCorners && { transparentCorners: o.transparentCorners }),
      ...(o.cropX && { cropX: o.cropX }),
      ...(o.cropY && { cropY: o.cropY }),
      ...(o.crossOrigin && { crossOrigin: o.crossOrigin }),
      ...(o.src && { src: o.src }),
    };
  }

  async canvasLoaded(canvasJson: any) {
    if (!this.fabricCanvas) return;
    // const fabricCanvas = this.fabricCanvas;
    const objs = canvasJson.objects as fabric.FabricObject[];

    const existingObjects = this.fabricCanvas.getObjects();

    for (let i = 0; i < objs.length; i++) {
      let o = objs[i];
      //Find object in canvasJson
      const existingO = existingObjects.find(
        (e) => (e as CustomFabricObject).id === (o as CustomFabricObject).id
      );
      if (existingO) {
        console.log("object is existing", existingO);
        existingO.set(utility.setFabricProperties(o));
      } else {
        console.log("not existing", o, o.type);
        let newObject;
        if (o.type === "textbox" || o.type === "Textbox") {
          newObject = new Textbox((o as Textbox).text, {
            ...utility.setFabricProperties(o),
            id: (o as CustomFabricObject).id,
          });
          this.fabricCanvas.bringObjectToFront(newObject);
        } else if (o.type === "fabricimage" || o.type === "FabricImage") {
          const element = document.createElement("img");
          element.src = (o as CustomFabricObject).src!;
          newObject = new FabricImage(element, {
            ...utility.setFabricProperties(o),
            id: (o as CustomFabricObject).id,
          });
        } else if (o.type === "fabricvideo" || o.type === "FabricVideo") {
          const isPrimaryVideo =
            (o as CustomFabricObject).id === this.videoPlayer?.id;
          console.log("is video", isPrimaryVideo, this.videoPlayer?.id);

          if (!isPrimaryVideo) {
            const newVid = this.addVideoToDom(
              (o as CustomFabricObject).src!,
              o.width,
              o.height
            );
            newObject = new FabricVideo(newVid, {
              ...utility.setFabricProperties(o),
              id: (o as CustomFabricObject).id,
            });
          } else {
            console.log("is primary video");
            const newVid = this.getVideoElement(
              0,
              (o as CustomFabricObject).src!,
              o.height,
              o.width
            );
            const fabricVideo = new FabricVideo(newVid, {
              ...utility.setFabricProperties(o),
              id: (o as CustomFabricObject).id,
            });
            this.fabricCanvas!.add(fabricVideo);

            fabricVideo.on("selected", (o) => {
              this.setSelectedElementId((o.target as CustomFabricObject).id);
              o.e?.preventDefault();
            });
            this.saveCanvasState();
          }
        } else if (o.type === "itext" || o.type === "IText") {
          newObject = new IText((o as IText).text, {
            ...utility.setFabricProperties(o),
            id: (o as CustomFabricObject).id,
          });
        }

        if (newObject) {
          // const isTextbox = o.type === 'textbox' || o.type === 'Textbox'
          // newObject.set({
          //   ...utility.setFabricProperties(o), id:
          //     (o as CustomFabricObject).id
          // });
          runInAction(() => this.saveCanvasState());
          // img.applyFilters();
          this.updateObjectStates(newObject, i, this.fabricCanvas);
        }
      }
    }

    for (let existingO of existingObjects) {
      //Find object in canvasJson
      const o = objs.find(
        (e) =>
          (e as CustomFabricObject).id === (existingO as CustomFabricObject).id
      );

      if (!o) {
        this.fabricCanvas.remove(existingO);
      }
    }
  }

  public addTextElement(): void {
    const placeholderText = "Edit Me!";
    const textElements = this.fabricCanvas
      ?.getObjects()
      .filter((o) => o.type === "i-text");
    const track = this.selectTrackForElement(
      ElementTypes.text,
      this.videoTime,
      8
    );

    const canvasSize = this.store.canvasSize;
    let newPos = {
      x: Math.floor(canvasSize.width / 10),
      y: Math.floor(canvasSize.height / 2),
    };

    if (textElements?.length) {
      let maxY = 0;
      let x = newPos.x;
      let height = 0;
      textElements.forEach((item) => {
        if (item.top > maxY) {
          maxY = item.top;
          x = item.left;
          height = item.height;
        }
      });
      newPos.y = maxY + height + 3;
    }
    const id = crypto.randomUUID();
    const el = {
      id,
      text: placeholderText,
      pos: newPos,
      fontSize: 24,
      fillColor: "#000000",
      backgroundColor: "#FFFFFF",
      fontFamily: "Arial",
      type: ElementTypes.text,
      time: this.videoTime,
      duration: 8,
      locked: false,
      hidden: false,
      scaleX: 1,
      scaleY: 1,
      track,
    };
    this.store.elements.push(el);
    this.triggerElementVisibilityOnPause(el);
  }

  public switchAspectRatio(aspectRatio: string) {
    this.undoRedo.updateUndoRedoStack();
    console.log("canvas width", this.store.canvasSize.width);
    const wasPlaying = this.isPlaying;
    const [w, h] = aspectRatio.split(":");
    const height = this.DEFAULT_HEIGHT;
    const width = (height * parseInt(w)) / parseInt(h);
    // this.resizeElements(width, height);
    const defaultWidth = (height * 16) / 9;
    console.log("width", width);

    const widthChange = width - this.store.canvasSize.width;
    console.log("widthChange", widthChange);
    this.handleResizeElements(width, widthChange);

    if (wasPlaying) {
      this.isPlaying = wasPlaying;
      if (this.videoPlayer) this.videoPlayer.play();
    }

    return wasPlaying;
  }

  public addImageElement(src = "/media/banana-muffins.webp") {
    const id = crypto.randomUUID();
    const width = this.store.canvasSize.width * 0.7;
    const height = this.store.canvasSize.height * 0.7;
    const x = this.store.canvasSize.width / 2 - width / 2;
    const y = this.store.canvasSize.height / 2 - height / 2;
    const track = this.selectTrackForElement(
      ElementTypes.image,
      this.videoTime,
      8
    );

    const el = {
      id,
      src,
      title: "Image 1",
      type: ElementTypes.image,
      time: this.videoTime,
      duration: 10,
      pos: { x, y },
      size: {
        width,
        height,
      },
      locked: false,
      hidden: false,
      scaleX: 1,
      scaleY: 1,
      track,
      animation: {
        enter: { key: AnimationKeys.fadeIn, duration: 2000 },
        exit: { key: AnimationKeys.fadeOut, duration: 2000 },
        element: { key: AnimationKeys.zoomOut, duration: 4000 },
      },
      //pos: { x: Math.floor(canvasSize.width/2), y: Math.floor(canvasSize.height/2) }
    };

    this.store.elements.push(el);
    this.triggerElementVisibilityOnPause(el);
  }

  private getAudioFormat(audioSrc: string) {
    return audioSrc.split(".").pop() || "mp3";
  }

  public addAudioElement(src = "/media/borrtex-smell-of-summer.wav") {
    const id = crypto.randomUUID();

    const audio = new Howl({
      src: [src],
      loop: false,
      autoplay: false,
      onplay: () => {
        console.log("howler audio playing");
      },
      onpause: () => {
        console.log("howler audio paused");
      },
    });

    const audioCount =
      this.store.elements.filter((e) => e.type === ElementTypes.audio).length +
      1;
    audio.once("load", () => {
      runInAction(() => {
        const duration = audio.duration() || 8;
        const track = this.selectTrackForElement(
          ElementTypes.audio,
          this.videoTime,
          duration
        );
        audio.pause();
        const el = {
          id,
          src,
          title: `Audio ${audioCount}`,
          type: ElementTypes.audio,
          time: this.videoTime,
          duration,
          volume: audio.volume() || 1,
          locked: false,
          hidden: false,
          format: this.getAudioFormat(src),
          track,
          audio,
          //pos: { x: Math.floor(canvasSize.width/2), y: Math.floor(canvasSize.height/2) }
        } as Element;
        this.store.elements.push(el);
      });
    });
    audio.load();

    // console.log("howl item", item);
    // item.play()
    // const audioElement = document.createElement('audio');
    // audioElement.src = src;
    // audioElement.load();
    // audioElement.tim

    // audioElement.pause()

    // audioElement.addEventListener('loadedmetadata', (e) => {
    //   const audioEl = (e.currentTarget as HTMLAudioElement)
    //   const idx = this.store.elements.findIndex(el => el.id === id)
    //   if (idx === -1) return;
    //   this.store.elements[idx] = {
    //     ...this.store.elements[idx],
    //     duration: audioEl.duration,
    //     volume: audioEl.volume
    //   }
    //   audio.pause()
    //   this.changeCount++
    // });
  }

  public addElement(type: ElementTypes) {
    this.undoRedo.updateUndoRedoStack();
    if (type === ElementTypes.text) {
      this.addTextElement();
    } else if (type === ElementTypes.image) {
      this.addImageElement();
    } else if (type === ElementTypes.audio) {
      this.addAudioElement();
    } else if (type === ElementTypes.video) {
      this.addVideoElement();
    }
  }

  public seekVideoAndAudios(time: number) {
    this.store.elements.forEach((el) => {
      if (
        (el.type === ElementTypes.audio || el.type === ElementTypes.video) &&
        time >= el.time &&
        time <= el.time + el.duration
      ) {
        if (el.type === ElementTypes.audio) {
          const audio = (el as Audio).audio;
          const seekTime = audio?.seek(time - el.time);
        } else {
          const video = (el as Video).video;
          if (video) video.currentTime = time - el.time;
        }
      }
    });
  }

  public updateElement(id: string, state: Partial<Element>) {
    this.undoRedo.updateUndoRedoStack();
    this.updateElementNoUndoStack(id, state);
  }

  public updateElementNoUndoStack(id: string, state: any) {
    const idx = this.store.elements.findIndex((e) => e.id === id);
    console.log("in updateElementNoUndoStack", idx, state);
    //@ts-ignore
    this.store.elements[idx] = { ...this.store.elements[idx], ...state };
    if (this.store.selectedElement) {
      this.store.selectedElement = { ...this.store.selectedElement, ...state };
    }

    const stateClone = cloneDeep(state) as any;
    delete stateClone.time;
    delete stateClone.duration;
    if (!Object.keys(stateClone)) return;

    const object = this.fabricCanvas
      ?.getObjects()
      .find((o) => (o as CustomFabricObject).id === id);
    if (object) {
      const curr = state as any;
      let stateClone = {
        ...state,
        ...(curr?.pos?.x !== undefined && { left: curr.pos.x }),
        ...(curr?.pos?.y !== undefined && { top: curr.pos.y }),
        ...(curr?.size?.width !== undefined && { width: curr.size.width }),
        ...(curr?.size?.height !== undefined && { height: curr.size.height }),
        ...(curr?.fillColor && { fill: curr.fillColor }),
      };
      delete stateClone.pos;
      delete stateClone.size;
      object.set({ ...stateClone });
      this.saveCanvasState();
    }
  }

  public removeElement() {
    // prev.filter(p => p.id !== this.store.selectedElementId.value)
    this.undoRedo.updateUndoRedoStack();
    if (this.store.selectedElement?.type === ElementTypes.audio) {
      (this.store.selectedElement as Audio).audio?.unload();
      this.store.elements = this.store.elements.filter(
        (p) => p.id !== this.store.selectedElementId
      );
      this.unsetSelectedElement();
      this.changeCount++;
      return;
    }

    const activeObject = this.fabricCanvas?.getActiveObject();
    if (activeObject) {
      const id = (activeObject as CustomFabricObject).id;
      this.store.elements = this.store.elements.filter((p) => p.id !== id);
      this.fabricCanvas?.remove(activeObject);
      this.saveCanvasState();
    }

    this.unsetSelectedElement();
  }

  public removeSingleElement() {
    this.undoRedo.updateUndoRedoStack();
    if (this.store.selectedElement?.type !== "subtitle")
      return this.removeElement();

    this.removeSingleSubtitle(this.store.selectedSubtitleId);
  }

  public removeSingleSubtitle(subtitleItemId: string | null) {
    // const selectedElement = this.store.elements.value.find(
    //   e => e.id === this.store.selectedElementId.value
    // );

    // if (selectedElement?.type !== 'subtitle') return this.removeElement();
    this.undoRedo.updateUndoRedoStack();
    const subtitleIdx = this.store.elements.findIndex(
      (p) => p.type === "subtitle"
    );

    if (subtitleIdx > -1) {
      const subtitleElement = this.store.elements[
        subtitleIdx
      ] as SubtitleElement;

      // Filter out the specific subtitle item you want to remove
      const updatedElements = subtitleElement.elements.filter(
        (item) => item.id !== subtitleItemId
      );

      // Update the subtitle element with the new list of elements
      this.store.elements[subtitleIdx] = {
        ...subtitleElement,
        elements: updatedElements,
      } as unknown as Element;
    }

    this.store.selectedSubtitleId = null;
    this.changeCount = this.changeCount++;
  }

  public async duplicateElement() {
    const activeObject = this.fabricCanvas?.getActiveObject();
    if (!activeObject) return;
    this.undoRedo.updateUndoRedoStack();

    const element = this.store.elements.find(
      (e) => e.id === (activeObject as CustomFabricObject).id
    );

    if (element?.type === ElementTypes.audio) {
      const newElement = { ...element, id: crypto.randomUUID() };
      this.store.elements.push(newElement);
    } else if (element) {
      const el = element as Video | ImageElement | TextElement;
      const newElement = {
        ...element,
        type:
          element.type === ElementTypes.primaryVideo
            ? ElementTypes.video
            : element.type,
        id: crypto.randomUUID(),
        pos: { x: el.pos.x + 10, y: el.pos.y + 10 },
        // fabricObject: activeObject
      };
      this.store.elements.push(newElement);
      this.triggerElementVisibilityOnPause(newElement as Element);
    }
  }

  public formatTime(seconds: number): string {
    try {
      const date = new Date(0);
      if (!date) return "";
      date.setSeconds(seconds);

      const hasHours = seconds >= 3600;

      const options: Intl.DateTimeFormatOptions = hasHours
        ? { hour: "2-digit", minute: "2-digit", second: "2-digit" }
        : { minute: "2-digit", second: "2-digit" };

      return new Intl.DateTimeFormat("en-US", options).format(date);
    } catch {
      console.error("Error formatting time:", seconds);
      return "";
    }
  }

  public setSelectedElementId(elementId: string) {
    this.store.selectedElementId = elementId;
    let element = this.store.elements?.find((e) => e.id === elementId);
    if (element) this.store.selectedElement = cloneDeep(element);

    property.activeRightTab = RightTab.elements;
  }

  public unsetSelectedElement() {
    this.store.selectedElementId = null;
    this.store.selectedElement = null;
    property.activeRightTab = RightTab.editor;
  }

  public handlePlayPause() {
    if (!this.videoPlayer) return;
    // console.log("this.store.id", this.storeID)
    // console.log("is playing before", this.timelineStore.engine.current?.isPlaying, this.isPlaying)
    this.isPlaying = !this.timelineStore.engine.current?.isPlaying;
    if (this.isPlaying) {
      this.timelineStore.engine.current?.play({ autoEnd: true });
    } else {
      this.timelineStore.engine.current?.pause();
    }
    // console.log("is playing ", this.timelineStore.engine.current?.isPlaying, this.isPlaying)
    // if (this.isPlaying) {
    //   // tween.current!.pause();
    //   this.isPlaying = !this.isPlaying;
    //   this.videoPlayer.pause();
    //   // this.timelineStore.engine.current?.pause()
    //   const audioElements = this.store.elements.filter(e => e.type === ElementTypes.audio && (e as Audio).audio).map(e => (e as Audio).audio) as Howl[]

    //   audioElements.forEach(e => {
    //     if (e.playing()) e!.pause();
    //   })
    // } else {
    //   console.log('is playing');
    //   this.isPlaying = !this.isPlaying;
    //   this.videoPlayer.play();
    //   // this.timelineStore.engine.current?.play({ autoEnd: true })
    // }

    // this.timelineStore.engine.current?.setTime(this.videoTime)
    // if (!this.timelineStore.engine.current?.isPlaying) {
    //   this.timelineStore.engine.current?.play({ autoEnd: true })
    // } else {
    //   this.timelineStore.engine.current?.pause()
    // }
  }

  // public onTimeUpdate(time: number | undefined, subtitles: {
  //   [key: string]: string;
  // }) {
  //   if (time === undefined) return

  //   this.videoTime = time;
  //   // this.videoDuration.set(video.duration);

  //   const currSubtitle = this.updateSubtitleText(time);
  //   if (currSubtitle && this.store.selectedElementId === currSubtitle.elementId) {
  //     this.store.selectedSubtitleId = currSubtitle.id;
  //   }
  // };

  public onTimeUpdate(event: Event) {
    const video = event.target as HTMLVideoElement;
    const time = video.currentTime;

    if (time === undefined) return;
    this.videoTime = time;

    const currSubtitle = this.updateSubtitleText(time);
    if (
      currSubtitle &&
      this.store.selectedElementId === currSubtitle.elementId
    ) {
      this.store.selectedSubtitleId = currSubtitle.id;
    }
  }

  private adjustElementOnResize(
    width: number,
    height: number,
    obj: fabric.FabricObject
  ) {
    const prevWidth = this.store.canvasSize.width;
    const prevHeight = this.store.canvasSize.height;

    const elements = this.store.elements;
    const idx = this.store.elements.findIndex(
      (e) => e.id === (obj as CustomFabricObject).id
    );
    if (idx <= -1) return;
    const element = elements[idx];

    switch (element?.type) {
      case ElementTypes.image:
      case ElementTypes.video:
        const imgEl = element as ImageElement | Video;
        const currSize = imgEl.size;
        const img_ratio = width / height / (currSize.width / currSize.height);
        const newImgWidth = (width / height) * imgEl.size.height;
        const x = imgEl.pos.x * img_ratio;
        let pEl = this.store.elements[idx] as ImageElement;
        this.store.elements[idx] = {
          ...this.store.elements[idx],
          size: {
            ...pEl.size,
            width: newImgWidth,
          },
          pos: {
            ...pEl.pos,
            x,
          },
        };

        obj.set({ left: x, width: newImgWidth });

        break;
      case ElementTypes.text:
        const text_ratio = width / height / (prevWidth / prevHeight);
        const textEl = element as TextElement;
        const fontSize = Math.max(Math.floor(textEl.fontSize * text_ratio), 14);
        const text_x = textEl.pos.x * text_ratio;
        let tEl = this.store.elements[idx] as TextElement;
        this.store.elements[idx] = {
          ...this.store.elements[idx],
          fontSize,
          pos: {
            ...tEl.pos,
            x: text_x,
          },
        };

        obj.set({ left: text_x, fontSize });
        break;

      case ElementTypes.subtitle:
        obj.set({ left: width * 0.1, width: width * 0.8 });
        break;
    }
    this.saveCanvasState();
  }

  public handleResizeElements(newWidth: number, widthChange: number) {
    const mainVid = this.store.elements.find(
      (e) => e.type === ElementTypes.primaryVideo
    );

    // Update the canvas width
    if (this.videoCanvas) {
      // const canvas = fabricCanvasRef.current;

      if (this.fabricCanvas) {
        // Set new canvas dimensions based on resize
        this.fabricCanvas.setDimensions({ width: newWidth });

        // Adjust video or objects cropping only visually
        const objects = this.fabricCanvas.getObjects();

        objects.forEach((obj) => {
          if (
            (obj as CustomFabricObject).elementType ===
            ElementTypes.primaryVideo
          ) {
            // Maintain video width to canvas width
            console.log("object", (obj as FabricVideo).getElement());
            obj.set({
              cropX: Math.max(
                (obj as CustomFabricObject).cropX! - widthChange / 2,
                0
              ), // Crop from left based on resize
            });
          } else {
            this.adjustElementOnResize(
              newWidth,
              this.store.canvasSize.height,
              obj
            );
          }
          obj.setCoords(); // Update object coordinates
        });
        runInAction(() => this.saveCanvasState());
        this.store.canvasSize.width = newWidth;

        // Rerender canvas
        this.fabricCanvas.renderAll();
      }
    }
  }

  public onResizeEnd(
    event: MouseEvent | TouchEvent,
    direction: Direction,
    elementRef: HTMLElement,
    delta: NumberSize
  ) {
    const newWidth = elementRef.offsetWidth;
    this.isResizingEditor = false;
    this.handleResizeElements(newWidth, delta.width);
    // this.saveCanvasState();
  }

  public updatePopupActionPosition(object: fabric.Object) {
    if (this.elementPopupAction) {
      const canvasRect = this.videoCanvas!.getBoundingClientRect();
      const { left, top, width, height } = object.getBoundingRect();

      // Calculate the position in viewport coordinates
      const buttonLeft = canvasRect.left + left + width / 2 - 35;
      const buttonTop = canvasRect.top + top - 35;

      // Update the button's position

      this.elementPopupAction.style.left = `${buttonLeft}px`;
      this.elementPopupAction.style.top = `${buttonTop}px`;
      this.elementPopupAction.style.display = "block";
      this.elementPopupAction.style.position = "fixed";
    }
  }

  public hideSelectedElementActions() {
    if (this.elementPopupAction) {
      this.elementPopupAction.style.display = "none";
    }
  }

  private updateObjectStates(
    object: fabric.FabricObject,
    idx: number,
    canvas: fabric.Canvas
  ) {
    object.on("selected", (el) => {
      this.setSelectedElementId((el.target as CustomFabricObject).id);
      this.updatePopupActionPosition(object);
    });
    object.on("deselected", () => {
      this.unsetSelectedElement();
      this.hideSelectedElementActions();
    });
    object.on("moving", (ele) => {
      if (idx > -1) {
        this.store.elements[idx] = {
          ...this.store.elements[idx],
          pos: ele.pointer,
        };
      }
      runInAction(() => this.saveCanvasState());
      this.updatePopupActionPosition(object);
      // this.saveCanvasState();
    });

    object.on("scaling", (el) => {
      this.store.elements[idx] = {
        ...this.store.elements[idx],
        fabricObject: el.transform.target,
      };
      runInAction(() => this.saveCanvasState());
      this.updatePopupActionPosition(object);
      // this.saveCanvasState();
    });

    object.on("rotating", (el) => {
      this.store.elements[idx] = {
        ...this.store.elements[idx],
        fabricObject: el.transform.target,
      };
      runInAction(() => this.saveCanvasState());
      this.updatePopupActionPosition(object);
      // this.saveCanvasState();
    });

    canvas?.add(object);
    canvas.sendObjectBackwards(object);
    console.log("running update object states");
    runInAction(() => this.saveCanvasState());
  }

  private addElementToFabric(el: Element, canvas = this.fabricCanvas!) {
    const fabricObjects = canvas.getObjects();
    const fabricObject = fabricObjects.find(
      (i) => (i as CustomFabricObject).id === el.id
    );

    const fabricEl = (
      el as Video | ImageElement | TextElement | SubtitleElement
    ).fabricObject;

    const idx = this.store.elements.findIndex((e) => e.id === el.id);

    if (!fabricObject) {
      // if (fabricEl) {
      //   fabricEl.clone().then(clonedEl => {
      //     canvas.discardActiveObject();
      //     clonedEl.set({
      //       id: el.id,
      //       //@ts-ignore
      //       ...(el.padding && { padding: el.padding }),
      //       //@ts-ignore
      //       ...(el.borderRadius && { borderRadius: el.borderRadius }),
      //       //@ts-ignore
      //       ...(el.fontSize && { fontSize: el.fontSize }),
      //       //@ts-ignore
      //       ...(el.fillColor && { fill: el.fillColor }),
      //       //@ts-ignore
      //       ...(el.width && { width: el.width }),
      //       //@ts-ignore
      //       ...(el.height && { height: el.height }),
      //       //@ts-ignore
      //       left: el.pos.x,
      //       //@ts-ignore
      //       top: el.pos.y,
      //     });
      //     runInAction(() => this.saveCanvasState());
      //     this.updateObjectStates(clonedEl, idx, canvas);
      //   });
      //   return;
      // }
      switch (el.type) {
        case ElementTypes.text:
          const textEl = el as TextElement;
          const fabricText = new IText(textEl.text, {
            id: el.id,
            left: textEl.pos.x,
            top: textEl.pos.y,
            fontSize: textEl.fontSize,
            fill: textEl.fillColor,
            editable: true,
            absolutePositioned: true,
            preserveObjectStacking: true,
            borderRadius: 8,
            padding: 8,
            lockMovementX: !!el.locked,
            lockMovementY: !!el.locked,
            lockScalingX: !!el.locked,
            lockScalingY: !!el.locked,

            fontFamily: textEl.fontFamily || "Arial",
            backgroundColor: textEl.backgroundColor || "#fff",
            cornerStrokeColor: "#fafafa",
            cornerSize: 5,
            objectCaching: false,
          });
          runInAction(() => this.saveCanvasState());
          this.updateObjectStates(fabricText, idx, canvas);
          this.store.elements[idx] = {
            ...this.store.elements[idx],
            fabricObject: fabricText,
          };
          break;
        case ElementTypes.image:
          const imgEl = el as ImageElement;
          const element = document.createElement("img");
          element.src = imgEl.src;
          const img = new FabricImage(element);

          img.set({
            id: el.id,
            left: imgEl.pos.x,
            top: imgEl.pos.y,
            lockMovementX: !!el.locked,
            lockMovementY: !!el.locked,
            lockScalingX: !!el.locked,
            lockScalingY: !!el.locked,
            height: imgEl.size.height,
            width: imgEl.size.width,
            centeredScaling: true,
            hasControls: true,
            absolutePositioned: true,
            preserveObjectStacking: true,
            objectCaching: false,
          });
          runInAction(() => this.saveCanvasState());
          // img.applyFilters();
          this.updateObjectStates(img, idx, canvas);
          this.store.elements[idx] = {
            ...this.store.elements[idx],
            fabricObject: img,
          };

          // let animationCtrl = this.animationCtrl.get({ noproxy: true }).get(el.id)
          // if (!animationCtrl) {
          //   // animationCtrl = FabricAnimation.zoom(img, 1.2, 3000);
          //   animationCtrl = FabricAnimation.run(img, { scaleFactor: 1.2 }, imgEl.animation.enter.duration, 'enter')[imgEl.animation.enter.key]()
          //   if (!this.store.isPlaying.get()) animationCtrl.pause();
          //   this.animationCtrl.set(animation => {
          //     animation.set(el.id, animationCtrl!)
          //     return animation
          //   })
          // }

          break;
        case ElementTypes.video:
          const videoEl = el as Video;
          let videoElement = videoEl.video;
          console.log("video element: ", videoElement, el.id);
          if (!videoElement) {
            videoElement = this.addVideoToDom(
              videoEl.src,
              videoEl.size.width,
              videoEl.size.height
            );
            // videoElement.play()
            // videoElement.addEventListener('load', () => {
            //   videoElement?.pause()
            // }, { once: true });
            // videoElement.load()
            const idx = this.store.elements.findIndex((el) => el.id === el.id);
            if (idx !== -1)
              this.store.elements[idx] = {
                ...this.store.elements[idx],
                isPlaying: false,
                video: videoElement,
              };
          }
          const videoFabric = new FabricVideo(videoElement);

          videoFabric.set({
            id: el.id,
            left: videoEl.pos.x,
            top: videoEl.pos.y,
            lockMovementX: !!el.locked,
            lockMovementY: !!el.locked,
            lockScalingX: !!el.locked,
            lockScalingY: !!el.locked,
            height: videoEl.size.height,
            width: videoEl.size.width,
            centeredScaling: true,
            hasControls: true,
            absolutePositioned: true,
            preserveObjectStacking: true,
            objectCaching: false,
          });

          console.log(" video fabric", videoFabric);
          runInAction(() => this.saveCanvasState());
          // img.applyFilters();
          this.updateObjectStates(videoFabric, idx, canvas);
          // if (this.isPlaying) {
          //   videoElement.play();
          // } else {
          //   videoElement.pause();
          // }

          // Refresh canvas to ensure video is displayed
          this.fabricCanvas?.requestRenderAll();
          this.store.elements[idx] = {
            ...this.store.elements[idx],
            fabricObject: videoFabric,
          };

          // let animationCtrl = this.animationCtrl.get({ noproxy: true }).get(el.id)
          // if (!animationCtrl) {
          //   // animationCtrl = FabricAnimation.zoom(img, 1.2, 3000);
          //   animationCtrl = FabricAnimation.run(img, { scaleFactor: 1.2 }, imgEl.animation.enter.duration, 'enter')[imgEl.animation.enter.key]()
          //   if (!this.store.isPlaying.get()) animationCtrl.pause();
          //   this.animationCtrl.set(animation => {
          //     animation.set(el.id, animationCtrl!)
          //     return animation
          //   })
          // }

          break;
      }
    }

    // if (subtitleObject) {
    //   canvas.sendObjectToBack(subtitleObject)
    //   // subtitleObject.setCoords()

    // }

    // canvas.renderAll();
  }

  private triggerElementVisibilityOnPause(el: Element) {
    if (this.isPlaying) return;
    console.log("Called triggerElementVisibilityOnPause");
    this.addElementToFabric(el as Element);
    // this.fabricCanvas.get()!.renderAll();
  }

  public updateObjectVisibility(currentTime: number) {
    const canvas = this.fabricCanvas;
    if (!canvas) return;

    for (let i = 0; i < this.store.elements.length; i++) {
      const el = this.store.elements[i];

      if (
        el.type === ElementTypes.primaryVideo ||
        el.type === ElementTypes.subtitle
      )
        continue;

      const e = el as TextElement | ImageElement | Video | Audio;
      const fabricElement = canvas
        .getObjects()
        .find((i) => (i as CustomFabricObject).id === el.id);
      if (el.hidden) continue;

      if (currentTime >= el.time && currentTime <= el.time + el.duration) {
        this.addElementToFabric(el as Element, canvas);
        if (fabricElement) {
          fabricElement.set({
            hasControls: true,
            selectable: true,
            visible: true,
          });
        }

        if (el.type === ElementTypes.audio && this.isPlaying) {
          const audioEl = (el as Audio).audio;
          if (audioEl) {
            if (!audioEl?.playing()) {
              audioEl?.play();
            }
          } else {
            const audio = new Howl({
              src: (el as Audio).src,
              loop: false,
              autoplay: false,
            });
            audio.play();
            this.store.elements[i] = { ...this.store.elements[i], audio };
          }
          continue;
        }
        if (el.type === ElementTypes.video) {
          const fabEl = (
            (fabricElement ||
              this.fabricCanvas
                ?.getObjects()
                ?.find(
                  (o) => (o as CustomFabricObject).id === el.id
                )) as FabricVideo
          )?.getElement() as HTMLVideoElement;

          const video = (el as Video).video;
          if (this.isPlaying) {
            fabEl?.play();
            // this.store.elements[i] = { ...this.store.elements[i], isPlaying: true }
          } else {
            // video?.pause()
            fabEl?.pause();
            // this.store.elements[i] = { ...this.store.elements[i], isPlaying: false }
          }
        }
      } else {
        if (fabricElement && fabricElement.visible) {
          const parentVideo = this.store.elements.find(
            (e) => e.type === ElementTypes.primaryVideo
          );

          const parentVideoObject = canvas
            .getObjects()
            .find((o) => (o as CustomFabricObject).id === parentVideo?.id);

          if (parentVideoObject) canvas.setActiveObject(parentVideoObject);

          fabricElement.set({
            hasControls: false,
            selectable: false,
            visible: false,
          });
          this.saveCanvasState();
          // canvas.remove(fabricElement)
        }
        if (el.type === ElementTypes.audio) {
          (el as Audio).audio?.pause();
          // ((this.fabricCanvas?.getObjects().find(o => (o as CustomFabricObject).id === el.id) as FabricVideo)?.getElement() as HTMLVideoElement)?.pause()
          continue;
        } else if (el.type === ElementTypes.video) {
          console.log("el", el);
          let video = (
            (fabricElement ||
              this.fabricCanvas
                ?.getObjects()
                ?.find(
                  (o) => (o as CustomFabricObject).id === el.id
                )) as FabricVideo
          )?.getElement() as HTMLVideoElement | undefined;
          // if (!video) video = (el as Video).video
          if (video) {
            video.pause();
          }
          // (el as Video).video?.pause();
          // this.store.elements[i] = { ...this.store.elements[i], isPlaying: false }
          continue;
        }
      }
    }

    canvas.renderAll();
  }

  private findKeyInRange(sub: SubtitleElement, currentTime: number) {
    // Iterate over each key in the object
    for (const el of sub.elements) {
      const start = utility.getTimeFromSrtObject(el.start);
      const end = utility.getTimeFromSrtObject(el.end);

      // Check if the given value falls within the range
      if (currentTime >= start && currentTime <= end) {
        return { id: el.id, text: el.text };
      }
      // }
    }
    return null; // Return null if no range is found
  }

  public updateSubtitleText(currentTime: number) {
    const canvas = this.fabricCanvas;
    if (!canvas) return;

    const sub = this.store.elements.find((e) => e.type === "subtitle");
    if (!sub) return;
    const subtitle = canvas
      .getObjects()
      .find((i) => (i as CustomFabricObject).id === sub.id);

    const currSubtitle = this.findKeyInRange(
      sub as SubtitleElement,
      currentTime
    );

    if (currSubtitle) {
      if (!subtitle) {
        const textbox = new Textbox(currSubtitle.text, {
          id: sub.id,
          top: (sub as SubtitleElement).pos.y,
          fontSize: (sub as SubtitleElement).fontSize,
          fill: (sub as SubtitleElement).fillColor,
          editable: true,
          absolutePositioned: true,
          preserveObjectStacking: true,
          fontFamily: (sub as SubtitleElement).fontFamily,
          backgroundColor: (sub as SubtitleElement).backgroundColor,
          lockMovementX: !!sub.locked,
          lockMovementY: !!sub.locked,
          lockScalingX: !!sub.locked,
          lockScalingY: !!sub.locked,
          // hasControls: false,
          // fontWeight: 'bold',
          // fontStyle: 'oblique',
          // stroke: '#c3bfbf',
          // strokeWidth: 3,
          cornerSize: 8,
          touchCornerSize: 10,
          borderColor: "red",
          cornerStyle: "circle",
          left: (sub as SubtitleElement).pos.x,
          textAlign: "center",
          width: (sub as SubtitleElement).size.width as number,
          objectCaching: false,
          borderRadius: 8,
          padding: 8,
          // styles: {
          //   0: {
          //     // first line
          //     0: {
          //       // first letter
          //       fontSize: 35,
          //       fontWeight: 'bold',
          //       fontStyle: 'italic',
          //     },
          //   },
          // },

          // This will change the size and baseline of our subscript
          subscript: { size: 0.5, baseline: 0.21 },
        });
        runInAction(() => this.saveCanvasState());

        textbox.on("selected", (el) => {
          this.setSelectedElementId(sub.id);
          const correspondingEl = (sub as SubtitleElement).elements.find(
            (e) => e.text === (el.target as CustomFabricObject).text
          );

          if (correspondingEl)
            this.store.selectedSubtitleId = correspondingEl.id;
          this.updatePopupActionPosition(textbox);
        });
        textbox.on("deselected", () => {
          this.unsetSelectedElement();
          this.store.selectedSubtitleId = null;
          this.hideSelectedElementActions();
        });
        textbox.on("moving", (el) => {
          this.updatePopupActionPosition(textbox);
          runInAction(() => this.saveCanvasState());
        });

        canvas.add(textbox);
        canvas.renderAll();
        // fabric.Textbox.fromObject({
        //   id: sub.id,
        //   text: subtitleText,
        //   top: (sub as SubtitleElement).pos.y,
        //   fontSize: (sub as SubtitleElement).fontSize,
        //   fill: (sub as SubtitleElement).fillColor,
        //   editable: true,
        //   absolutePositioned: true,
        //   preserveObjectStacking: true,
        //   fontFamily: (sub as SubtitleElement).fontFamily,
        //   backgroundColor: (sub as SubtitleElement).backgroundColor,
        //   // hasControls: false,
        //   // fontWeight: 'bold',
        //   // fontStyle: 'oblique',
        //   // stroke: '#c3bfbf',
        //   // strokeWidth: 3,
        //   cornerSize: 8,
        //   touchCornerSize: 10,
        //   borderColor: 'red',
        //   cornerStyle: 'circle',
        //   left: (sub as SubtitleElement).pos.x,
        //   textAlign: 'center',
        //   width: (sub as SubtitleElement).size.width as number,
        //   objectCaching: false,
        //   // styles: {
        //   //   0: {
        //   //     // first line
        //   //     0: {
        //   //       // first letter
        //   //       fontSize: 35,
        //   //       fontWeight: 'bold',
        //   //       fontStyle: 'italic',
        //   //     },
        //   //   },
        //   // },

        //   // This will change the size and baseline of our subscript
        //   subscript: { size: 0.5, baseline: 0.21 },
        // }).then(textObj => {
        //   textObj.on('selected', el => {
        //     this.setSelectedElementId(sub.id);
        //     this.updatePopupActionPosition(textObj);
        //   });
        //   textObj.on('deselected', () => {
        //     this.hideSelectedElementActions();
        //   });
        //   textObj.on('moving', el => {
        //     this.updatePopupActionPosition(textObj);
        //   });

        //   canvas.add(textObj);
        //   canvas.renderAll();
        // });
      } else {
        subtitle.set({
          text: currSubtitle.text,
          visible: true,
          hasControls: true,
          borderColor: "red",
        });
      }
      return { ...currSubtitle, elementId: sub.id };
    } else {
      if (subtitle) {
        // this.fabricCanvas.get()?.remove(subtitle)

        subtitle.set({
          text: "",
          visible: false,
          hasControls: false,
          borderColor: "transparent",
        });
      }
    }
  }

  public lockOrUnlockTrack(elementIds: string[], locked: boolean): void {
    this.store.elements = this.store.elements.map((el) => {
      if (elementIds.includes(el.id)) return { ...el, locked: !locked };
      return el;
    });

    const objects = this.fabricCanvas
      ?.getObjects()
      .filter((o) => elementIds.includes((o as CustomFabricObject).id));
    objects?.forEach((o) => {
      o.set({
        lockMovementX: !locked,
        lockMovementY: !locked,
        lockScalingX: !locked,
        lockScalingY: !locked,
      });
    });
    this.saveCanvasState();
  }

  public toggleHidden(elementIds: string[], hidden: boolean): void {
    this.store.elements = this.store.elements.map((el) => {
      if (elementIds.includes(el.id)) return { ...el, hidden: !hidden };
      return el;
    });

    const matchingElements = this.store.elements.filter((e) =>
      elementIds.includes(e.id)
    );
    const objects = this.fabricCanvas?.getObjects();
    if (!objects?.length) return;

    for (const e of matchingElements) {
      const el = e as TextElement | Video | ImageElement;
      const object = objects.find((o) =>
        elementIds.includes((o as CustomFabricObject).id)
      );
      if (!object) continue;
      if (!e.time && !e.duration) {
        object.set({ visible: hidden });
      } else if (
        this.videoTime >= e.time &&
        this.videoTime <= e.time + e.duration
      ) {
        object.set({ visible: hidden });
      }
    }
    this.saveCanvasState();
  }

  public adjustVolume(id: string, volume: number) {
    const index = this.store.elements.findIndex((e) => e.id === id);
    if (index === -1) return;
    const element = this.store.elements[index];
    const allowedTypes = [
      ElementTypes.video,
      ElementTypes.audio,
      ElementTypes.primaryVideo,
    ];
    if (!allowedTypes.includes(element.type)) return;
    const el = element as Audio | Video;
    console.log("volume: ", volume);
    this.store.elements[index] = {
      ...this.store.elements[index],
      volume,
    };
    if (element.type === ElementTypes.primaryVideo) {
      if (this.videoPlayer) this.videoPlayer.volume = volume;
    } else if (element.type === ElementTypes.video) {
      const videoEl = (element as Video).video;
      if (videoEl) videoEl!.volume = volume;
    } else if (element.type === ElementTypes.audio) {
      const audioEl = (element as Audio).audio;
      if (audioEl) audioEl!.volume(volume);
    }
    this.changeCount++;
  }
}

// export const editor = new EditorStore();
