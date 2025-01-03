import React from "react";
import { motion } from "framer-motion";
import { FaVideo, FaCrop, FaFileAudio, FaCalendarCheck } from "react-icons/fa";

const features = [
  {
    title: "Identify Key Moments",
    description:
      "Automatically detect the highlights in your content for easy repurposing.",
    icon: <FaVideo size={32} />,
  },
  {
    title: "Auto-Resize for Platforms",
    description:
      "Instantly resize videos for Instagram, YouTube, TikTok, and more.",
    icon: <FaCrop size={32} />,
  },
  {
    title: "Subtitle & Text Overlay",
    description:
      "Add captions, custom text, and brand elements for every video.",
    icon: <FaFileAudio size={32} />,
  },
  {
    title: "Social Media Scheduling",
    description:
      "Schedule content directly to your social accounts, ready to engage.",
    icon: <FaCalendarCheck size={32} />,
  },
];

const KeyFeatures: React.FC = () => {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-6 lg:px-12 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-8">
          Services We Provide
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="p-6 bg-gray-100 rounded-lg shadow-md text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
            >
              <div className="text-primary mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-700">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyFeatures;
