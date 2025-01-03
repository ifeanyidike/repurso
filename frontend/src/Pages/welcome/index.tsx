import React from "react";
import Header from "../components/Header";
import ServiceSection from "../components/Services";
import HowItWorksSection from "../components/HowItWorks";
import TestimonialsSection from "../components/Testimonials";
import ContactSection from "../components/Contact";

const Welcome: React.FC = () => (
  <div className="overflow-hidden">
    <Header />
    <ServiceSection />
    <HowItWorksSection />
    <TestimonialsSection />
    <ContactSection />
  </div>
);

export default Welcome;
