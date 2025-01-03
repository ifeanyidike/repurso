import React from "react";
import { motion } from "framer-motion";

const ParticleEffect: React.FC = () => {
  const particles = Array.from({ length: 10 });

  return (
    <div className="particle-effect absolute inset-0 flex flex-wrap">
      {particles.map((_, index) => (
        <motion.div
          key={index}
          className="w-2 h-2 bg-white rounded-full absolute"
          animate={{
            x: Math.random() * 200 - 100,
            y: Math.random() * 200 - 100,
            opacity: 0,
          }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      ))}
    </div>
  );
};

export default ParticleEffect;
