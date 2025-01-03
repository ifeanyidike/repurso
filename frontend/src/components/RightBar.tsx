import { motion } from "framer-motion";
import React from "react";
import Properties from "./Properties";
import AspectRatioSelector from "./AspectRatioSelector";
import SubtitleDisplay from "./SubtitleDisplay";
import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { property } from "../store/PropertyStore";
import { themeStore } from "../store/ThemeStore";
import { RightTab } from "../types/properties";

const RightBar: React.FC = observer(() => {
  const tab = property.activeRightTab;
  const isDarkTheme = themeStore.isDarkTheme;
  return (
    <motion.div
      className={`w-[400px] mr-1 p-4 border ${
        themeStore.isDarkTheme
          ? "bg-gray-800 border-gray-600"
          : "bg-gray-200 border-gray-300"
      } rounded-lg`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <div className="flex gap-2">
        {Object.entries(RightTab).map(([key, value]) => (
          <motion.button
            key={key}
            className={`
            flex justify-center items-center px-4 py-2 text-sm font-semibold rounded
            transition-colors duration-300 ease-in-out
            ${
              tab === value
                ? isDarkTheme
                  ? "bg-gray-700 text-white border-b-2 border-blue-500"
                  : "bg-blue-500 text-white border-b-2 border-blue-600"
                : isDarkTheme
                ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }
          `}
            onClick={() => runInAction(() => (property.activeRightTab = value))}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {value}
          </motion.button>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {tab === RightTab.elements && <Properties />}
        {tab === RightTab.editor && <AspectRatioSelector />}
        {tab === RightTab.subtitle && <SubtitleDisplay />}
      </motion.div>
    </motion.div>
  );
});

export default RightBar;
