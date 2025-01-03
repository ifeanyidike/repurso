import { MoonIcon, SunIcon } from "@heroicons/react/20/solid";
import { motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import { FaRedo, FaUndo } from "react-icons/fa";
import useUndoRedo from "../hooks/useUndoRedo";
import { themeStore } from "../store/ThemeStore";
import { cn } from "../utils";
import { stores } from "../store/Stores";

const TopBar = observer(() => {
  useUndoRedo();
  return (
    <motion.div
      className={cn(
        "flex justify-between items-center gap-4 p-4 bg-gray-800 border-b border-gray-700 shadow-sm",
        themeStore.isDarkTheme
          ? "bg-gray-800 border-gray-600"
          : "bg-gray-200 border-gray-300"
      )}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className={cn(
          "flex space-x-4 items-center p-4", // Flex container with space between the buttons
          themeStore.isDarkTheme
            ? "bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 active:bg-gray-600" // Dark theme colors
            : "bg-gray-200 border-gray-300 text-gray-800 hover:bg-gray-300 active:bg-gray-400" // Light theme colors
        )}
      >
        {/* Undo Button */}
        <motion.button
          whileHover={{ scale: 1.1, opacity: 0.9 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => stores.editorStore!.undoRedo.undo()}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all"
        >
          <FaUndo className="h-5 w-5" /> {/* Undo Icon */}
          <span>Undo</span>
        </motion.button>

        {/* Redo Button */}
        <motion.button
          whileHover={{ scale: 1.1, opacity: 0.9 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => stores.editorStore!.undoRedo.redo()}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all"
        >
          <FaRedo className="h-5 w-5" /> {/* Redo Icon */}
          <span>Redo</span>
        </motion.button>
      </div>

      <div className="flex gap-2 items-center">
        <p className={themeStore.isDarkTheme ? "text-white" : "text-black"}>
          {stores.isSaving && "Saving changes..."}
        </p>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => themeStore.toggleTheme()}
          className={cn(
            "self-end px-4 py-2 m-4 rounded-lg flex items-center space-x-2 transition-all",
            themeStore.isDarkTheme
              ? "bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-500" // Dark mode button styles
              : "bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400" // Light mode button styles
          )}
        >
          {/* Display appropriate icon and text based on theme */}
          {themeStore.isDarkTheme ? (
            <>
              <SunIcon className="h-5 w-5 text-yellow-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <MoonIcon className="h-5 w-5 text-gray-500" />
              <span>Dark Mode</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
});

export default TopBar;
