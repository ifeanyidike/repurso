import React, { useEffect, useState } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";
import { stores } from "../store/Stores";

type Props = {
  value: number;
  propertyName: string;
  elementId: string;
  title: string;
};
const ValueSelector: React.FC<Props> = (props) => {
  const [size, setSize] = useState<number | "">(props.value);

  useEffect(() => {
    setSize(props.value);
  }, [props.value]);

  const handleIncrease = () => {
    const newSize = (size || 0) + 1;
    stores.editorStore!.updateElement(props.elementId!, {
      [props.propertyName]: newSize,
    });
    setSize(newSize);
  };

  const handleDecrease = () => {
    const newSize = Math.max((size || 0) - 1, 10);
    stores.editorStore!.updateElement(props.elementId!, {
      [props.propertyName]: newSize,
    });
    setSize(newSize);
  };

  return (
    <div className="mr-8 text-sm flex flex-col">
      <p className="font-bold mb-1">{props.title}</p>
      <div className="flex items-center justify-center bg-white rounded-full shadow-md w-fit p-2 space-x-2">
        {/* Decrease Button */}
        <button
          onClick={handleDecrease}
          className="
          bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400
          transition-transform transform hover:scale-110
          text-gray-800 font-bold p-2 rounded-full shadow-lg 
          focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400
          flex items-center justify-center
        "
          aria-label="Decrease font size"
        >
          <FiMinus className="w-3 h-3" />
        </button>

        <input
          className="
          text-sm font-semibold text-gray-700 px-8 py-1
          border border-gray-300 rounded-full shadow-inner
          bg-gradient-to-br from-gray-50 to-gray-100
          w-24 text-center tracking-wide
        "
          value={size}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (isNaN(val)) return setSize("");
            setSize(parseInt(e.target.value));
          }}
        ></input>

        {/* Increase Button */}
        <button
          onClick={handleIncrease}
          className="
          bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400
          transition-transform transform hover:scale-110
          text-gray-800 font-bold p-2 rounded-full shadow-lg
          focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400
          flex items-center justify-center
        "
          aria-label="Increase font size"
        >
          <FiPlus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default ValueSelector;
