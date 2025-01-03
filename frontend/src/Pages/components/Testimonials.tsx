import React from "react";
import { Carousel } from "antd";
import { motion } from "framer-motion";

const TestimonialsSection = () => (
  <section className="py-24 bg-gradient-to-r from-indigo-100 to-blue-50">
    <h2 className="text-5xl font-extrabold text-center text-gray-800 mb-16 tracking-tight">
      What Our Users Say
    </h2>
    <motion.div
      className="flex space-x-8 overflow-hidden px-6 lg:px-20"
      initial={{ x: "100%" }}
      animate={{ x: "0%" }}
      transition={{ duration: 20, repeat: Infinity }}
    >
      {/* Repeat this block for each testimonial */}
      <motion.div className="min-w-[300px] bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300">
        <p className="text-gray-600">
          “This app has transformed my health journey. Highly recommended!”
        </p>
        <p className="mt-4 font-semibold text-indigo-600">- Jane Doe</p>
      </motion.div>

      <motion.div className="min-w-[300px] bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300">
        <p className="text-gray-600">
          “This app has transformed my health journey. Highly recommended!”
        </p>
        <p className="mt-4 font-semibold text-indigo-600">- Jane Doe</p>
      </motion.div>

      <motion.div className="min-w-[300px] bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300">
        <p className="text-gray-600">
          “This app has transformed my health journey. Highly recommended!”
        </p>
        <p className="mt-4 font-semibold text-indigo-600">- Jane Doe</p>
      </motion.div>
    </motion.div>
  </section>
);

export default TestimonialsSection;
