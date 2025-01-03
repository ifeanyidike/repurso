// db.ts
import Dexie, { EntityTable, Table } from "dexie";
import { Store } from "../types/editor";

interface SerializedEditorStore {
  storeID: string;
  originalVideoUrl: string | null;
  datUrl: string | null;
  videoAudioUrl: string | null;
  originalVideoTitle: string | null;
  srt: string | null;
  title: string;
  store: Store;
  originalVideoAudioBlob?: Blob;
  originalVideoBlob?: Blob;
}

interface EditorStoreData {
  id: string;
  stores: SerializedEditorStore[];
}

interface StringifiedEditorStoreData {
  id: string;
  stores: string;
}

// Initialize the database
const db = new Dexie("EditorStoreDatabase") as Dexie & {
  stores: EntityTable<
    StringifiedEditorStoreData,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  stores: "++id, store", // primary key "id" (for the runtime!)
});

export { db };
export type {
  EditorStoreData,
  SerializedEditorStore,
  StringifiedEditorStoreData,
};
