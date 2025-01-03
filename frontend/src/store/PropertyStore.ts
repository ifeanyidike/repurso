import {
  ElementTypes,
  RightTab,
  type SubtitleState,
} from "../types/properties";
import { SubtitleElement, SubtitleItem } from "../types/editor";
import { fillerWords } from "../utils";
import { action, makeObservable, observable } from "mobx";
import { stores } from "./Stores";
import { utility } from "../service/Utility";

class Properties {
  activeRightTab: RightTab = RightTab.editor;

  constructor() {
    makeObservable(this, {
      activeRightTab: observable,
      editSubtitleElement: action,
      editAllSubtitleElements: action,
    });
  }

  public editSubtitleElement(
    id: string,
    data: { text?: string; start?: number; end?: number }
  ) {
    stores.editorStore!.undoRedo.updateUndoRedoStack();

    const subtitleIdx = stores.editorStore!.store.elements.findIndex(
      (p) => p.type === ElementTypes.subtitle
    );
    if (subtitleIdx > -1) {
      const subtitleElement = stores.editorStore!.store.elements[
        subtitleIdx
      ] as unknown as SubtitleElement;
      const idx = subtitleElement.elements.findIndex((s) => s.id === id);
      const updatedElements = [...subtitleElement.elements];

      updatedElements[idx] = {
        ...subtitleElement.elements[idx],
        ...(data.text && { text: data.text }),
        ...(data.start && {
          start: utility.convertToSrtTimeFormat(data.start),
        }),
        ...(data.end && { end: utility.convertToSrtTimeFormat(data.end) }),
      };

      //@ts-ignore
      stores.editorStore!.store.elements[subtitleIdx] = {
        ...subtitleElement,
        elements: updatedElements,
      } as unknown as Element;
    }

    stores.editorStore!.updateSubtitleText(stores.editorStore!.videoTime);
    stores.editorStore!.changeCount++;
  }

  public editAllSubtitleElements(
    command:
      | "hide-commas"
      | "show-commas"
      | "hide-periods"
      | "show-periods"
      | "hide-fillers"
      | "show-fillers"
      | "capitalize"
      | "uppercase"
      | "lowercase"
      | "reset-transform"
      | "resetAll"
  ) {
    function getBareText(originalText: string) {
      for (let f of fillerWords) {
        originalText = originalText
          .replaceAll(f, "")
          .replaceAll(f.toLowerCase(), "")
          .replaceAll(f.toUpperCase(), "");
      }
      return originalText.replaceAll(",", "").replaceAll(".", "").toLowerCase();
    }

    stores.editorStore!.undoRedo.updateUndoRedoStack();
    const subtitleIdx = stores.editorStore!.store.elements.findIndex(
      (p) => p.type === ElementTypes.subtitle
    );

    if (subtitleIdx > -1) {
      const subtitleElement = stores.editorStore!.store.elements[
        subtitleIdx
      ] as unknown as SubtitleElement;

      let subElements = [...subtitleElement.elements] as SubtitleItem[];
      switch (command) {
        case "hide-commas":
          subElements = subElements.map((s) => ({
            ...s,
            text: s.text.replaceAll(",", ""),
          }));
          stores.editorStore!.store.subtitleActions = {
            ...stores.editorStore!.store.subtitleActions,
            commasHidden: true,
          };
          break;
        case "hide-periods":
          subElements = subElements.map((s) => ({
            ...s,
            text: s.text.replaceAll(".", ""),
          }));
          stores.editorStore!.store.subtitleActions = {
            ...stores.editorStore!.store.subtitleActions,
            periodsHidden: true,
          };
          break;
        case "hide-fillers":
          subElements = subElements.map((s) => {
            let newText = s.text;

            fillerWords.forEach((f) => {
              const regex = new RegExp(`\\b${f}\\b`, "gi");
              newText = newText.replace(regex, "");
            });

            newText = newText.replace(/\s+/g, " ").trim();
            return { ...s, text: newText };
          });
          stores.editorStore!.store.subtitleActions = {
            ...stores.editorStore!.store.subtitleActions,
            fillersHidden: true,
          };
          break;
        case "capitalize":
          subElements = subElements.map((s) => ({
            ...s,
            text: s.text
              .split(" ")
              .map((s) => `${s[0].toUpperCase()}${s.slice(1).toLowerCase()}`)
              .join(" "),
          }));
          stores.editorStore!.store.subtitleActions = {
            ...stores.editorStore!.store.subtitleActions,
            capitalizeTransform: true,
            uppercaseTransform: false,
            lowercaseTransform: false,
          };
          break;
        case "lowercase":
          subElements = subElements.map((s) => ({
            ...s,
            text: s.text.toLowerCase(),
          }));
          stores.editorStore!.store.subtitleActions = {
            ...stores.editorStore!.store.subtitleActions,
            lowercaseTransform: true,
            uppercaseTransform: false,
            capitalizeTransform: false,
          };
          break;
        case "uppercase":
          subElements = subElements.map((s) => ({
            ...s,
            text: s.text.toUpperCase(),
          }));
          stores.editorStore!.store.subtitleActions = {
            ...stores.editorStore!.store.subtitleActions,
            capitalizeTransform: false,
            lowercaseTransform: false,
            uppercaseTransform: true,
          };
          break;

        case "resetAll":
          subElements = [...stores.editorStore!.originalSubtitleElements];
          stores.editorStore!.store.subtitleActions = {
            commasHidden: false,
            periodsHidden: false,
            fillersHidden: false,
            capitalizeTransform: false,
            lowercaseTransform: false,
            uppercaseTransform: false,
          };
          break;
        case "show-commas":
        case "show-fillers":
        case "show-periods":
        case "reset-transform":
          subElements = subElements.map((s) => {
            const matchingOriginal =
              stores.editorStore!.originalSubtitleElements.find(
                (o) => o.id === s.id
              );
            if (!matchingOriginal) return s;
            if (getBareText(matchingOriginal.text) === getBareText(s.text))
              return matchingOriginal;
            return s;
          });

          break;
      }
      if (command === "show-periods")
        stores.editorStore!.store.subtitleActions = {
          ...stores.editorStore!.store.subtitleActions,
          periodsHidden: false,
        };
      if (command === "show-commas")
        stores.editorStore!.store.subtitleActions = {
          ...stores.editorStore!.store.subtitleActions,
          commasHidden: false,
        };
      if (command === "show-fillers")
        stores.editorStore!.store.subtitleActions = {
          ...stores.editorStore!.store.subtitleActions,
          fillersHidden: false,
        };
      if (command === "reset-transform") {
        stores.editorStore!.store.subtitleActions = {
          ...stores.editorStore!.store.subtitleActions,
          uppercaseTransform: false,
          lowercaseTransform: false,
          capitalizeTransform: false,
        };
      }

      //@ts-ignore
      stores.editorStore!.store.elements[subtitleIdx] = {
        ...subtitleElement,
        elements: subElements,
      } as unknown as Element;
    }
    stores.editorStore!.updateSubtitleText(stores.editorStore!.videoTime);

    stores.editorStore!.changeCount++;
  }
}

export const property = new Properties();
