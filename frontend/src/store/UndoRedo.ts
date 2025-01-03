import { Store } from "../types/editor";
import { cloneDeep } from "lodash";
import { action, makeObservable, observable } from "mobx";
import { EditorStore } from "./EditorStore";

export default class UndoRedo {
  public pastStore: Store[] = [];
  public futureStore: Store[] = [];
  public currentEditor: EditorStore;

  constructor(editor: EditorStore) {
    makeObservable(this, {
      pastStore: observable,
      futureStore: observable,
      updateUndoRedoStack: action,
      undo: action,
      redo: action,
    });
    this.currentEditor = editor;
  }

  public undo() {
    if (this.pastStore.length === 0) return;
    const present = cloneDeep(this.currentEditor.store);
    const newPresentStore = this.pastStore.pop();

    if (newPresentStore) {
      this.currentEditor.store = cloneDeep(newPresentStore);
      this.futureStore = [present, ...this.futureStore];

      this.adjustVideoAndElements(present.canvasSize.width);
    }
  }

  private adjustVideoAndElements(prevWidth: number) {
    if (prevWidth !== this.currentEditor.store.canvasSize.width) {
      const widthChange = this.currentEditor.store.canvasSize.width - prevWidth;
      this.currentEditor.handleResizeElements(
        this.currentEditor.store.canvasSize.width,
        widthChange
      );
    }

    if (
      this.currentEditor.fabricCanvas &&
      this.currentEditor.store.canvasState
    ) {
      this.currentEditor.fabricCanvas
        .loadFromJSON(this.currentEditor.store.canvasState!, () => {
          this.currentEditor.canvasLoaded(
            this.currentEditor.store.canvasState!
          );
        })
        .then((val) => console.log("value", val))
        .catch((error) => console.log("error", error));

      this.currentEditor.fabricCanvas.requestRenderAll();
      // console.log("after", this.currentEditor.fabricCanvas, this.currentEditor.store.canvasState)
    }
  }

  public redo() {
    if (this.futureStore.length === 0) return;
    const present = cloneDeep(this.currentEditor.store);

    const newPresentStore = this.futureStore.shift();
    if (newPresentStore) {
      this.currentEditor.store = cloneDeep(newPresentStore);
      this.pastStore.push(present);
      this.adjustVideoAndElements(present.canvasSize.width);
    }
    // this.futureStore[0].set(none);
  }

  public updateUndoRedoStack() {
    // this.pastStore[this.pastStore.length].set(cloneDeep(state.value));
    // this.futureStore.set([]);
    this.currentEditor.saveCanvasState();
    this.pastStore.push(cloneDeep(this.currentEditor.store));
    this.futureStore = [];

    console.trace("past", this.pastStore);
  }
}
