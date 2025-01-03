import { makeAutoObservable } from "mobx";
import { EditorStore } from "./EditorStore";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { loadEditorStoresFromDB, SRT } from "../utils";

class Stores {
  public ffmpegRef = new FFmpeg();
  public ffmpegLoaded = false;
  public isSaving = false;
  public editorStores: EditorStore[] = [];
  public activeStoreID: string | null = null;
  public isInitialized = false;
  public initPromise: Promise<void>;

  constructor() {
    makeAutoObservable(this);
    this.initPromise = this.init();
    // Initial values if needed in the constructor
  }

  public async init() {
    await this.constructStoreFromStorage();
    this.isInitialized = true;
  }

  public async getSavedStorage() {
    const loadedData = await loadEditorStoresFromDB();
    return loadedData;
  }

  public async constructStoreFromStorage() {
    const savedStorage = await this.getSavedStorage();
    console.log("savedStorage", savedStorage);
    // if (savedStorage && Array.isArray(savedStorage)) {
    //   // console.log("In here");
    //   for (let i = 0; i < savedStorage.length; i++) {
    //     const storage = savedStorage[i];
    //     const {
    //       storeID,
    //       originalVideoUrl,
    //       datUrl,
    //       videoAudioUrl,
    //       originalVideoTitle,
    //       srt,
    //       title,
    //       store,
    //     } = storage;
    //     const newStore = new EditorStore(
    //       originalVideoUrl!,
    //       datUrl,
    //       originalVideoTitle || "",
    //       videoAudioUrl!,
    //       title,
    //       srt
    //     );
    //     newStore.storeID = storeID;
    //     newStore.store = store;
    //     this.editorStores.push(newStore);
    //   }
    // } else {
    const originalVideoUrl = "/media/vid.mp4";
    const datUrl = "/media/output.dat";
    const originalVideoTitle = "Cancer Diagnosis";
    const videoAudioUrl = "/media/output.mp3";
    const title = "My first store";
    const srt = SRT;
    const firstStore = new EditorStore(
      originalVideoUrl,
      datUrl,
      originalVideoTitle,
      videoAudioUrl,
      title,
      srt
    );

    this.editorStores = [firstStore];
    // this.editorStore = firstStore
    // }
    console.log("editor stores", this.editorStores);
    this.activeStoreID = this.editorStores[0]?.storeID || null;
  }

  public get editorStore(): EditorStore | undefined {
    if (!this.isInitialized) return undefined;
    return this.editorStores.find(
      (store) => store.storeID === this.activeStoreID
    );
  }
}

// Create an instance and initialize
export const stores = new Stores();
// stores.init();
