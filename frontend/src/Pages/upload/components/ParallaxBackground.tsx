import React from "react";
import { motion } from "framer-motion";

const ParallaxBackground: React.FC = () => (
  <motion.div
    className="absolute inset-0 w-full h-full"
    style={{ backgroundImage: 'url("/media/video-editing-bg.jpg")' }}
    initial={{ scale: 1.1 }}
    animate={{ scale: 1 }}
    transition={{ duration: 2, ease: "easeOut" }}
  />
);

export default ParallaxBackground;
