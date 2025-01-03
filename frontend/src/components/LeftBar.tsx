import { motion } from "framer-motion";
import { MdOutlineTextFields } from "react-icons/md";
import { FaRegImage, FaVideo } from "react-icons/fa";
import { FaRegFileAudio } from "react-icons/fa6";
import React from "react";
import { stores } from "../store/Stores";
import { ElementTypes } from "../types/properties";
import { observer } from "mobx-react-lite";
import { themeStore } from "../store/ThemeStore";
import { cn } from "../utils";

const LeftBar: React.FC = observer(() => {
  const isDarkTheme = themeStore.isDarkTheme;
  const addElement = (type: ElementTypes) => {
    stores.editorStore!.addElement(type);
  };

  // Filter out 'primary-video' and 'subtitle' from the ElementTypes
  const visibleElementTypes = Object.values(ElementTypes).filter(
    (type) =>
      type !== ElementTypes.primaryVideo && type !== ElementTypes.subtitle
  );

  return (
    <div
      className={cn(
        "flex flex-col ml-1 my-6 gap-12 rounded-lg border",
        isDarkTheme
          ? "bg-gray-800 border-gray-600"
          : "bg-gray-100 border-gray-300"
      )}
    >
      {visibleElementTypes.map((type) => (
        <motion.button
          key={type}
          tabIndex={-1}
          className={cn(
            "flex flex-col items-center transition-all p-4",
            isDarkTheme
              ? "text-gray-300 hover:bg-gray-700 active:bg-gray-600"
              : "text-gray-800 hover:bg-gray-200 active:bg-gray-300"
          )}
          whileHover={{ scale: 1.1, y: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => addElement(type)}
        >
          <IconForType type={type} isDarkTheme={isDarkTheme} />
          <p className="text-xs mt-1">{capitalize(type)}</p>
        </motion.button>
      ))}
    </div>
  );
});

const IconForType: React.FC<{ type: ElementTypes; isDarkTheme: boolean }> = ({
  type,
  isDarkTheme,
}) => {
  const icons: Partial<Record<ElementTypes, JSX.Element>> = {
    [ElementTypes.text]: <MdOutlineTextFields size={25} />,
    [ElementTypes.image]: <FaRegImage size={25} />,
    [ElementTypes.video]: <FaVideo size={25} />,
    [ElementTypes.audio]: <FaRegFileAudio size={25} />,
  };

  // Icon colors depending on the theme
  const iconColor = isDarkTheme ? "text-yellow-400" : "text-gray-600";

  return <div className={`${iconColor}`}>{icons[type]}</div>;
};

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default LeftBar;
