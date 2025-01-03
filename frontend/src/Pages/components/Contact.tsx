import React from "react";
import { motion } from "framer-motion";
import { Button } from "antd";

const ContactSection = () => (
  <section className="py-24 bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
    <h2 className="text-5xl font-extrabold text-center text-gray-800 mb-16">
      Get in Touch
    </h2>
    <motion.form
      className="max-w-lg mx-auto bg-white bg-opacity-80 p-10 rounded-xl shadow-xl backdrop-blur-lg space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <input
        type="text"
        placeholder="Your Name"
        className="w-full p-4 rounded-lg shadow-inner focus:outline-none focus:ring-4 focus:ring-indigo-200"
      />
      <input
        type="email"
        placeholder="Your Email"
        className="w-full p-4 rounded-lg shadow-inner focus:outline-none focus:ring-4 focus:ring-indigo-200"
      />
      <textarea
        placeholder="Message"
        className="w-full p-4 rounded-lg shadow-inner focus:outline-none focus:ring-4 focus:ring-indigo-200"
        rows={4}
      ></textarea>
      <Button
        type="primary"
        className="!w-full !bg-indigo-500 hover:!bg-indigo-600 !text-white !font-semibold !rounded-lg !py-4 !shadow-lg hover:!shadow-2xl transform hover:!scale-105 !transition-all !duration-300"
      >
        Send Message
      </Button>
    </motion.form>
  </section>
);

export default ContactSection;
