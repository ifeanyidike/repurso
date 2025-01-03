import { motion } from "framer-motion";
import { FiUpload, FiLayers, FiSend } from "react-icons/fi";

const steps = [
  {
    title: "Upload Content",
    description: "Easily upload videos, articles, or podcasts for repurposing.",
    icon: FiUpload,
  },
  {
    title: "Select Formats",
    description: "Choose the desired format for each platform effortlessly.",
    icon: FiLayers,
  },
  {
    title: "Distribute Everywhere",
    description: "Publish on multiple platforms with just a click.",
    icon: FiSend,
  },
];

const HowItWorksSection = () => (
  <section className="py-24 bg-white text-center relative">
    <h2 className="text-5xl font-extrabold text-gray-800 mb-16 tracking-tight">
      How It Works
    </h2>
    <div className="flex flex-col space-y-12 px-6 lg:px-20 max-w-4xl mx-auto relative">
      <motion.div
        className="absolute inset-0 border-l-2 border-teal-200"
        initial={{ height: 0 }}
        animate={{ height: "100%" }}
        transition={{ duration: 1, delay: 0.5 }}
      ></motion.div>
      {steps.map((step, idx) => (
        <motion.div
          key={idx}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 * idx, duration: 0.8 }}
          className="bg-teal-100 p-8 rounded-xl shadow-lg flex items-center space-x-4 hover:scale-105 transform transition-all duration-300"
        >
          <motion.div
            className="text-5xl text-teal-500"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <step.icon />
          </motion.div>
          <div className="text-left">
            <h3 className="text-2xl font-semibold text-gray-800">
              {step.title}
            </h3>
            <p className="text-gray-600 mt-2">{step.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

export default HowItWorksSection;
