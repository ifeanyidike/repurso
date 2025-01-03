import { motion } from "framer-motion";
import {
  FiEdit3,
  FiScissors,
  FiShare2,
  FiVideo,
  FiLayers,
  FiSettings,
  FiSave,
  FiClock,
} from "react-icons/fi";

const services = [
  {
    title: "Smart Editing Tools",
    description:
      "Precision tools to tailor your content to perfection for every platform.",
    icon: FiEdit3,
    color: "bg-blue-100",
  },
  {
    title: "Automated Clipping",
    description:
      "Auto-create engaging snippets and clips that captivate audiences.",
    icon: FiScissors,
    color: "bg-green-100",
  },
  {
    title: "Multi-Platform Publishing",
    description:
      "Effortlessly publish across all your social media and web platforms.",
    icon: FiShare2,
    color: "bg-yellow-100",
  },
  {
    title: "Dynamic Video Resizing",
    description: "Auto-resize videos to fit perfectly on various platforms.",
    icon: FiVideo,
    color: "bg-pink-100",
  },
  {
    title: "Content Templates",
    description:
      "Access ready-to-use templates for different content types and platforms.",
    icon: FiLayers,
    color: "bg-indigo-100",
  },
  {
    title: "AI-Powered Suggestions",
    description:
      "Get AI-driven insights to enhance content engagement and reach.",
    icon: FiSettings,
    color: "bg-red-100",
  },
  {
    title: "Auto-Save Drafts",
    description:
      "Your work is saved automatically, so you never lose progress.",
    icon: FiSave,
    color: "bg-violet-100",
  },
  {
    title: "Scheduling & Availability",
    description:
      "Schedule your content to go live at optimal times across platforms.",
    icon: FiClock,
    color: "bg-teal-100",
  },
];

const ServicesSection = () => (
  <section className="py-16 bg-gradient-to-b  relative overflow-hidden max-w-screen-2xl mx-auto">
    <motion.h2
      className="text-5xl font-extrabold text-center text-gray-800 mb-16 tracking-tight"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      Core Features
    </motion.h2>

    {/* Light animated gradient background */}
    <div className="absolute inset-0 opacity-20 pointer-events-none">
      <motion.div
        className="w-full h-full bg-gradient-to-tr from-indigo-100 to-purple-100 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, repeatType: "mirror" }}
      />
    </div>

    <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 px-8 lg:px-20 relative z-10">
      {services.map((service, idx) => (
        <motion.div
          key={idx}
          className={`relative p-10 rounded-3xl shadow-lg transform transition-transform duration-500 hover:scale-105 ${service.color} backdrop-blur-md border border-gray-300`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 * idx, duration: 0.8 }}
        >
          <motion.div
            className="absolute -top-10 -right-10 w-28 h-28 bg-white bg-opacity-20 rounded-full blur-3xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          ></motion.div>

          <motion.div
            className="text-5xl w-fit mx-auto mb-6 flex justify-center items-center bg-white p-3 rounded-full shadow-sm transition-transform transform hover:rotate-6"
            animate={{ y: [0, -5, 0], rotate: [0, 360] }}
            transition={{
              repeat: Infinity,
              duration: 4,
              delay: 1 * idx,
              ease: "easeInOut",
            }}
          >
            <service.icon className="text-gray-700 text-5xl" />
          </motion.div>

          <h3 className="text-2xl font-semibold text-gray-800 text-center mb-4">
            {service.title}
          </h3>
          <p className="text-center text-lg text-gray-600 leading-relaxed">
            {service.description}
          </p>
        </motion.div>
      ))}
    </div>
  </section>
);

export default ServicesSection;
