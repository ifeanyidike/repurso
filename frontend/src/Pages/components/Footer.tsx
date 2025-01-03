import React from 'react';
import { FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi';

const Footer = () => (
  <footer className="bg-gray-900 py-12 px-8 lg:px-20 text-gray-300">
    <div className="grid gap-10 lg:grid-cols-3">
      <div>
        <h3 className="text-2xl font-semibold text-white">Heal App</h3>
        <p className="mt-2 text-gray-500">
          Doctors, medicine, and lab tests in one app.
        </p>
      </div>
      <div>
        <h4 className="text-xl font-semibold text-white">Menu</h4>
        <ul className="mt-2 space-y-2">
          <li>Services</li>
          <li>How it Works</li>
          <li>Testimonials</li>
        </ul>
      </div>
      <div>
        <h4 className="text-xl font-semibold text-white">Connect</h4>
        <div className="flex space-x-4 mt-4">
          <FiFacebook className="text-2xl" />
          <FiTwitter className="text-2xl" />
          <FiInstagram className="text-2xl" />
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
