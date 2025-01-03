import { ElementTypes, SubtitleState } from "./properties";
import { FabricObject } from "fabric";
import { Howl } from "howler";

export type AudioFormats = "mp3" | "wav" | "ogg";
export type Video = {
  src: string;
  title: string;
  datUrl?: string;
  audio: string;
  volume?: number;
  size: Record<"width" | "height", number>;
  pos: Record<"x" | "y", number>;
  video?: HTMLVideoElement;
  videoBlob?: Blob;
  audioBlob?: Blob;
  isPlaying?: boolean;
  fabricObject?: FabricObject;
};

export type Audio = {
  src: string;
  title: string;
  time: number;
  duration: number;
  datUrl?: string;
  audio?: Howl;
  format?: AudioFormats;
  volume?: number;
  blob?: Blob;
};

export type TextElement = {
  text: string;
  fontSize: number;
  fillColor: string;
  backgroundColor: string;
  fontFamily: string;
  pos: Record<"x" | "y", number>;
  fabricObject?: FabricObject;
};

export type ImageElement = {
  pos: Record<"x" | "y", number>;
  src: string;
  title: string;
  size: Record<"width" | "height", number>;
  animation: Record<"enter" | "exit" | "element", Animation>;
  fabricObject?: FabricObject;
};

export type AnimationController = Map<
  string,
  {
    pause: () => void;
    resume: () => void;
    cancel: () => void;
    reset: () => void;
    isPaused: () => boolean;
    isRunning: () => boolean;
    isFinished: () => boolean;
    getTime: () => number;
    getType: () => "enter" | "element" | "exit";
  }
>;

export type SubtitleElement = {
  pos: Record<"x" | "y", number>;
  elements: SubtitleItem[];
  size: Record<"width" | "height", number | "fit-content">;
  fontSize: number;
  fillColor: string;
  backgroundColor: string;
  textBackgroundColor: string | null;
  fontFamily: string;
  fabricObject?: FabricObject;
};

export type Element = {
  id: string;
  type: ElementTypes;
  locked: boolean;
  hidden: boolean;
  scaleX: number;
  scaleY: number;
  track: number | "last";
  time: number;
  duration: number;
} & (ImageElement | TextElement | SubtitleElement | Video | Audio);

export type CanvasSize = Record<"width" | "height", number>;

export type Subtitle = {
  [time: string]: string;
};

export type SubtitleItem = {
  id: string;
  start: string;
  end: string;
  text: string;
};

export type Store = {
  isPlaying: boolean;
  isMuted: boolean;
  elements: Element[];
  canvasSize: Record<"width" | "height", number>;
  selectedElementId: string | null;
  selectedElement: Element | null;
  selectedSubtitleId: string | null;
  subtitleActions: SubtitleState;
  canvasState: any | null;
  // canvas: fabric.Canvas | null;
  // originalVideoUrl: string | null;
  // datUrl: string | null;
  // videoAudioUrl: string | null;
  // videoTitle: string | null;
};

export enum AnimationKeys {
  "fade" = "fade",
  "fadeIn" = "fadeIn",
  "fadeOut" = "fadeOut",
  // 'slideIn' = 'slideIn',
  // 'slideOut' = 'slideOut',
  "slideLeftIn" = "slideLeftIn",
  "slideLeftOut" = "slideLeftOut",
  "slideRightIn" = "slideRightIn",
  "slideRightOut" = "slideRightOut",

  "slideUpIn" = "slideUpIn",
  "slideUpOut" = "slideUpOut",
  "slideDownIn" = "slideDownIn",
  "slideDownOut" = "slideDownOut",

  "zoomIn" = "zoomIn",
  "zoomOut" = "zoomOut",
  wipeLeft = "wipeLeft",
  wipeRight = "wipeRight",

  wipeY = "wipeY",
  wipeUp = "wipeUp",
  wipeDown = "wipeDown",
  radialWipe = "radialWipe",

  fadeBlack = "fadeBlack",
  fadeWhite = "fadeWhite",

  smoothUpIn = "smoothUpIn",
  smoothUpOut = "smoothUpOut",
  smoothDownIn = "smoothDownIn",
  smoothDownOut = "smoothDownOut",

  smoothLeftIn = "smoothLeftIn",
  smoothLeftOut = "smoothLeftOut",
  smoothRightIn = "smoothRightIn",
  smoothRightOut = "smoothRightOut",

  smoothTranslateUpIn = "smoothTranslateUpIn",
  smoothTranslateUpOut = "smoothTranslateUpOut",
  smoothTranslateDownIn = "smoothTranslateDownIn",
  smoothTranslateDownOut = "smoothTranslateDownOut",

  smoothTranslateLeftIn = "smoothTranslateLeftIn",
  smoothTranslateLeftOut = "smoothTranslateLeftOut",
  smoothTranslateRightIn = "smoothTranslateRightIn",
  smoothTranslateRightOut = "smoothTranslateRightOut",

  dissolve = "dissolve",
  verticalSlice = "verticalSlice",
  horizontalSlice = "horizontalSlice",
  diagonalTLBRIn = "diagonalTLBRIn",
  diagonalBLTRIn = "diagonalBLTRIn",
  diagonalTLBROut = "diagonalTLBROut",
  diagonalBLTROut = "diagonalBLTROut",
  rectCropOpen = "rectCropOpen",
  rectCropClose = "rectCropClose",
  // 'rotateIn' = 'rotateIn',
  // 'rotateOut' = 'rotateOut',
  // 'scaleIn' = 'scaleIn',
  // 'scaleOut' = 'scaleOut',
  // 'pulse' = 'pulse',
  // 'bounceIn' = 'bounceIn',
  // 'bounceOut' = 'bounceOut',
  // 'shake' = 'shake',
  // 'rubberBand' = 'rubberBand',
  // 'wobble' = 'wobble',
  // 'jello' = 'jello',
  "none" = "none",
}

export type Animation = {
  key: AnimationKeys;
  duration: number;
};
