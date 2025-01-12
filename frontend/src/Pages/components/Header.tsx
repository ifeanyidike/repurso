import React from "react";
import { Button } from "antd";
import {
  FiArrowRightCircle,
  FiLogIn,
  FiLogOut,
  FiUserPlus,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";

const Header = () => {
  const { loginWithRedirect, user, isAuthenticated, logout } = useAuth0();
  return (
    <header className="relative bg-transparent p-8 z-10 h-fit">
      <motion.div
        className="max-w-screen-xl mx-auto flex justify-between items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Site Name (Left) */}
        <motion.div
          className="text-2xl font-bold text-white tracking-tight"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-pink-500">
            Repurposer
          </span>
        </motion.div>

        {/* Menu (Center) */}
        <motion.nav
          className="flex space-x-12 text-xl font-semibold text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
        >
          <a
            href="#features"
            className="hover:text-teal-400 transition-colors hover:border-b-2 hover:border-teal-400"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="hover:text-teal-400 transition-colors hover:border-b-2 hover:border-teal-400"
          >
            Pricing
          </a>
          <a
            href="#about"
            className="hover:text-teal-400 transition-colors hover:border-b-2 hover:border-teal-400"
          >
            About
          </a>
        </motion.nav>

        {/* Login and Sign Up (Right) */}
        <motion.div
          className="flex space-x-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          {isAuthenticated && (
            <Button
              size="large"
              className="!bg-transparent !py-5 !px-5 !border-2 cursor-pointer !border-white !text-white !rounded-full hover:!bg-white hover:!text-teal-600 transition-all"
              icon={<FiLogOut className="text-xl" />}
              onClick={() => logout()}
            >
              Logout
            </Button>
          )}
          {!isAuthenticated && (
            <>
              <Button
                size="large"
                className="!bg-transparent !py-5 !px-5 !border-2 cursor-pointer !border-white !text-white !rounded-full hover:!bg-white hover:!text-teal-600 transition-all"
                icon={<FiLogIn className="text-xl" />}
                onClick={() =>
                  loginWithRedirect({
                    authorizationParams: {
                      screen_hint: "login",
                    },
                  })
                }
              >
                Login
              </Button>
              <Button
                size="large"
                type="primary"
                className="!bg-gradient-to-r !py-5 !px-5 !from-teal-400 cursor-pointer !to-pink-500 !text-white !rounded-full hover:!scale-105 transition-all"
                icon={<FiUserPlus className="text-xl" />}
                onClick={() =>
                  loginWithRedirect({
                    authorizationParams: {
                      screen_hint: "signup",
                    },
                  })
                }
              >
                Sign Up
              </Button>
            </>
          )}
        </motion.div>
      </motion.div>
    </header>
  );
};

const HeroSection = () => (
  <main className="relative max-h-[900px] h-screen bg-gradient-to-br from-teal-700 via-gray-600 to-red-800 overflow-hidden px-8 lg:px-20 grid">
    <Header />
    <section className=" flex items-start justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center text-white space-y-16"
      >
        <motion.h1
          className="text-6xl lg:text-8xl font-extrabold leading-tight drop-shadow-lg"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.5,
            duration: 1,
            type: "spring",
            stiffness: 100,
          }}
        >
          Transform{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-500">
            Your Content
          </span>
        </motion.h1>
        <motion.p
          className="text-lg lg:text-3xl text-gray-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.8,
            duration: 1,
            type: "spring",
            stiffness: 100,
          }}
        >
          Repurpose content across platforms effortlessly. Maximize reach,
          engagement, and save hours with our all-in-one solution.
        </motion.p>
        <motion.div
          className="flex justify-center space-x-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <Button
            size="large"
            type="primary"
            className="!text-xl !font-semibold !px-8 !py-8 !bg-gradient-to-r !from-teal-500 !to-blue-500 !text-white !rounded-full !shadow-lg hover:!scale-110 !transition-transform"
          >
            Start Repurposing
          </Button>
          <Button
            size="large"
            className="!text-xl !font-semibold !px-8 !py-8 !bg-transparent !text-white !border-2 !border-white !rounded-full !shadow-lg hover:!scale-110 !transition-transform"
          >
            Learn More <FiArrowRightCircle className="ml-2 text-4xl" />
          </Button>
        </motion.div>
      </motion.div>
      <motion.div
        className="absolute inset-0 bg-[url('/media/video-editing-bg.jpg')] bg-cover bg-center opacity-5"
        style={{ backgroundPositionY: "top" }}
        animate={{ backgroundPositionY: "bottom" }}
        transition={{
          ease: "linear",
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      ></motion.div>
    </section>
  </main>
);

export default HeroSection;
