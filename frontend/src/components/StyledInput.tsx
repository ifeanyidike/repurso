import React, { useEffect, useState } from "react";
import { runInAction } from "mobx";
import { stores } from "../store/Stores";
import { ImageElement, TextElement } from "../types/editor";
import { twoDigitFormatter } from "../utils";

type Props = {
  elementId: string;
  value: any;
  title: string;
  propertyName?: string;
  callback?: (value: string) => any;
  Note?: React.ReactNode;
};

const StyledInput = (props: Props) => {
  const [localValue, setLocalValue] = useState<any>(props.value); // local state for the input field
  const elements = stores.editorStore!.store.elements;
  const canvasSize = stores.editorStore!.store.canvasSize;
  const el = elements.find((el) => el.id === props.elementId);
  const [changing, setChanging] = useState(false);

  // Sync value from props to local state when props.value changes, but not when the user is typing
  useEffect(() => {
    if (props.value !== localValue) {
      setLocalValue(props.value);
    }
  }, [props.value]);

  useEffect(() => {
    if (!props.propertyName || !el || changing) return;

    if (props.propertyName === "x" || props.propertyName === "y") {
      let property = (el as TextElement | ImageElement).pos[props.propertyName];
      if (props.propertyName === "x") {
        property /= canvasSize.width;
        property *= 100;
      }
      if (props.propertyName === "y") {
        property /= canvasSize.height;
        property *= 100;
      }
      setLocalValue(`${twoDigitFormatter.format(property)}%`);
    } else {
      setLocalValue(props.value);
    }
  }, [el, props.propertyName, canvasSize, changing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChanging(false);
    const inputVal = e.target.value;
    console.log("inputVal", inputVal);
    const numericValue = parseFloat(inputVal);
    if (isNaN(numericValue)) {
      setLocalValue(inputVal);
      return;
    }

    if (props.callback) {
      props.callback(inputVal);
    } else if (props.propertyName) {
      // Update the element's property in the stores.editorStore
      stores.editorStore!.updateElement(props.elementId!, {
        [props.propertyName]: numericValue,
      });
    }

    // Update local state
    setLocalValue(numericValue);
    runInAction(() => stores.editorStore!.changeCount++);
  };

  return (
    <div className="mr-8 text-sm flex flex-col">
      <p className="font-bold mb-1">{props.title}</p>
      <input
        className="
          outline-none border border-gray-300 rounded-md w-32
          px-4 py-2 bg-white text-gray-700
          focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          transition-all duration-300 ease-in-out
          hover:border-gray-500 shadow-sm
          active:border-indigo-500 active:bg-gray-50
          placeholder-gray-400
        "
        value={localValue}
        onChange={(e) => {
          setChanging(true);
          const inputVal = parseFloat(e.target.value);

          if (isNaN(inputVal)) {
            setLocalValue(e.target.value); // Allow for non-numeric input during typing (e.g., empty string)
            return;
          }

          console.log(inputVal);
          setLocalValue(inputVal);
        }}
        onBlur={handleInputChange}
      />
      {props.Note}
    </div>
  );
};

export default StyledInput;
