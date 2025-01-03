import React, { useEffect } from "react";
import { stores } from "../store/Stores";

const useUndoRedo = () => {
  useEffect(() => {
    const handleUndoRedo = (event: KeyboardEvent) => {
      event.stopImmediatePropagation();
      if (
        event.key.toLowerCase() === "z" &&
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey
      ) {
        //undo action
        stores.editorStore!.undoRedo.redo();
      } else if (
        event.key.toLowerCase() === "z" &&
        (event.ctrlKey || event.metaKey)
      ) {
        //redo action
        stores.editorStore!.undoRedo.undo();
      }
    };
    window.addEventListener("keydown", handleUndoRedo);
    return () => {
      window.removeEventListener("keydown", handleUndoRedo);
    };
  }, []);
};

export default useUndoRedo;
