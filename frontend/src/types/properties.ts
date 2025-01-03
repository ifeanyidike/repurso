import { FabricObject, FabricObjectProps, ObjectEvents, SerializedObjectProps } from "fabric";

export enum RightTab {
  editor = 'Editor',
  elements = 'Properties',
  subtitle = 'Subtitle',
}

export enum ElementTypes {
  image = 'image',
  text = 'text',
  subtitle = 'subtitle',
  video = 'video',
  primaryVideo = 'primary-video',
  audio = 'audio'
}

export type SubtitleState = Record<
  | 'fillersHidden'
  | 'commasHidden'
  | 'periodsHidden'
  | 'uppercaseTransform'
  | 'lowercaseTransform'
  | 'capitalizeTransform',
  boolean
>;

export type CustomFabricObject = FabricObject<Partial<FabricObjectProps>, SerializedObjectProps, ObjectEvents> & { id: string, borderRadius?: number, padding?: number, cropX?: number, cropY?: number, locked?: boolean, text?: string, src?: string, elementType: ElementTypes }