import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";

const ConfirmationScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50">
      <header className="flex justify-between w-full max-w-6xl p-6">
        <div className="text-xl font-semibold text-gray-900">YourAppLogo</div>
        <span className="text-gray-500">Step 3 of 3</span>
      </header>

      <main className="flex flex-col items-center text-center mt-16 px-4 max-w-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          You're All Set!
        </h2>
        <p className="text-gray-500 mb-6">
          Here&apos;s a summary of your video and selected options.
        </p>

        <div className="flex items-center gap-6 bg-white shadow-lg rounded-lg p-4">
          <div className="w-24 h-24 bg-gray-200 rounded-lg">
            {/* Replace this with the actual thumbnail */}
            <img
              src="/media/andreas.jpg"
              alt="Video Thumbnail"
              className="rounded-lg"
            />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-800">MyVideo.mp4</p>
            <p className="text-sm text-gray-600">Duration: 5 min</p>
            <p className="text-sm text-gray-600">Size: 50 MB</p>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 mt-8 w-full">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Selected Options
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-blue-500" />
              <span>Highlight Key Moments</span>
            </li>
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-blue-500" />
              <span>Split into Clips</span>
            </li>
            {/* Repeat for other selected options */}
          </ul>
        </div>

        <button className="mt-10 px-6 py-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition transform hover:scale-105">
          Start Processing
        </button>

        <button
          className="mt-4 text-gray-500 underline hover:text-gray-700"
          onClick={() => {
            /* Go back to edit options */
          }}
        >
          Edit Options
        </button>
      </main>

      <footer className="bg-gray-100 w-full py-6 mt-auto text-center text-gray-500">
        Need help?{" "}
        <a href="/contact" className="text-blue-500 hover:underline">
          Contact Us
        </a>
      </footer>
    </div>
  );
};

export default ConfirmationScreen;
