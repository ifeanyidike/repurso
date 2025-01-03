import React from "react";
import { observer } from "mobx-react-lite";
import { motion } from "framer-motion";
import { stores } from "../store/Stores";
import { themeStore } from "../store/ThemeStore";
import { cn } from "../utils";
import PageUtility from "../components/PageUtility";
import TopBar from "../components/TopBar";
import LeftBar from "../components/LeftBar";
import VideoEditorContainer from "../components/VideoEditorContainer";
import RightBar from "../components/RightBar";

const Home: React.FC = observer(() => {
  if (!stores.editorStore) return;
  return (
    <motion.div
      className={cn(
        "flex min-h-screen p-0 gap-8 font-geist-sans flex-col",
        themeStore.isDarkTheme
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-black"
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      onWheel={(e) => e.preventDefault()}
    >
      <PageUtility />
      <TopBar />
      <motion.div
        className="flex justify-between gap-4"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <LeftBar />
        <motion.div className="flex flex-col w-full" layout>
          <VideoEditorContainer />
        </motion.div>
        <RightBar />
      </motion.div>
    </motion.div>
  );
});

export default Home;
