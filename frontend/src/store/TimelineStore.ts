import { makeAutoObservable } from "mobx";
import { Element } from "../types/editor";
import { EditorStore } from "./EditorStore";
import { TimelineState } from "../components/Timeline";

export default class TimelineStore {
  private parentVideoId = crypto.randomUUID();
  public scaleWidth = 160;
  public timelineWidth: number | null = null;
  public timelineScale: number | null = null;
  public defaultScale: number | null = null;
  public snapGrid = true;
  public videoTriggerPlaceholder = false;
  public timelineHeight: number | null = null;
  public editor: EditorStore;
  public engine: React.RefObject<TimelineState> = { current: null };

  setTimelineWidth(width: number) {
    this.timelineWidth = width;
  }

  setTimelineHeight(height: number) {
    this.timelineHeight = height;
  }

  setSnapGrid(snapGrid: boolean) {
    this.snapGrid = snapGrid;
  }

  constructor(editor: EditorStore) {
    makeAutoObservable(this);
    this.editor = editor;
  }

  public get tracks() {
    const tracks = new Map();
    for (const el of this.editor.store.elements) {
      const track = el.track;
      if (!tracks.has(track)) {
        tracks.set(track, [el]);
      } else {
        tracks.get(track).push(el);
      }
    }
    return tracks;
  }

  public get tracksArray(): Element[][] {
    const tracksArray: Element[][] = [];

    for (const [t, el] of this.tracks.entries()) {
      if (t === "last") continue;
      tracksArray.splice(t - 1, 0, el);
    }

    const last = this.tracks.get("last");
    // if (last) tracksArray.push(last)
    if (last) return [last, ...tracksArray];
    return tracksArray;
  }
}

// export const timelineStore = new TimelineStore();
