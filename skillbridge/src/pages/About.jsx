import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import emailjs from "@emailjs/browser";
import AlertModal from "../components/AlertModal";
import { useAuth } from "../contexts/AuthContext";

export default function About() {
  const { currentUser, profile } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Pre-fill form with user data when logged in
  useEffect(() => {
    if (currentUser && profile) {
      setFormData((prev) => ({
        ...prev,
        name: profile.displayName || "",
        email: currentUser.email || "",
      }));
    }
  }, [currentUser, profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Check if user is logged in
  const isLoggedIn = () => {
    return currentUser && profile;
  };

  // Validation function to check if all required fields are filled and email matches user
  const isFormValid = () => {
    if (!isLoggedIn()) return false;

    return (
      formData.name.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.message.trim() !== "" &&
      formData.email === currentUser.email && // Email must match logged-in user's email
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if user is logged in
    if (!isLoggedIn()) {
      setShowErrorModal(true);
      return;
    }

    // Check if email matches logged-in user's email
    if (formData.email !== currentUser.email) {
      setShowErrorModal(true);
      return;
    }

    // Validate form before submission
    if (!isFormValid()) {
      setShowErrorModal(true);
      return;
    }

    // EmailJS configuration from environment variables
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      to_email: "skillbridge.portal@gmail.com",
      message: formData.message,
      reply_to: formData.email,
    };

    emailjs
      .send(serviceId, templateId, templateParams, publicKey)
      .then((response) => {
        console.log("Email sent successfully!", response.status, response.text);
        setShowSuccessModal(true);
        // Reset form
        setFormData({ name: "", email: "", message: "" });
      })
      .catch((error) => {
        console.error("Failed to send email:", error);
        setShowErrorModal(true);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 font-sans relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-purple-200/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-indigo-200/20 rounded-full blur-3xl animate-pulse animation-delay-500"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-pink-200/20 rounded-full blur-3xl animate-pulse animation-delay-1500"></div>

        {/* Floating dots pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/6 w-2 h-2 bg-blue-400/40 rounded-full animate-bounce animation-delay-200"></div>
          <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-bounce animation-delay-700"></div>
          <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-indigo-400/40 rounded-full animate-bounce animation-delay-1200"></div>
          <div className="absolute bottom-1/4 right-1/6 w-1 h-1 bg-pink-400/40 rounded-full animate-bounce animation-delay-300"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="relative inline-block mb-6">
            <img
              src={logo}
              alt="SkillBridge Logo"
              className="w-56 h-56 mx-auto object-contain transition-all duration-500 hover:scale-110 hover:rotate-3 drop-shadow-2xl"
            />
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-indigo-400/20 rounded-full blur-xl animate-pulse"></div>
          </div>
          <h2 className="text-xl md:text-2xl font-medium text-blue-700 mb-4 tracking-wide animate-slide-up animation-delay-200">
            "Bridging Knowledge, Building Futures"
          </h2>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 mb-6 tracking-tight animate-slide-up animation-delay-400">
            About SkillBridge
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-slide-up animation-delay-600">
            Empowering skilled students to connect, share knowledge, and
            exchange insights for collective growth, with faculty providing
            guidance and ensuring authenticity.
          </p>
          <div className="mt-8 flex justify-center space-x-4 animate-slide-up animation-delay-800">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce animation-delay-400"></div>
          </div>
        </div>

        {/* Key Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:rotate-1 border border-gray-100 hover:border-blue-200 animate-fade-in-up">
            <div className="relative w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <div className="absolute inset-0 bg-blue-400/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 text-center group-hover:text-blue-600 transition-colors duration-300">
              Learn
            </h3>
            <p className="text-gray-600 text-base md:text-lg text-center leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
              Access cutting-edge knowledge through interactive sessions with
              industry experts and experienced faculty.
            </p>
          </div>

          <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:rotate-1 border border-gray-100 hover:border-green-200 animate-fade-in-up animation-delay-200">
            <div className="relative w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-8 h-8 text-green-600 group-hover:text-green-700 transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <div className="absolute inset-0 bg-green-400/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 text-center group-hover:text-green-600 transition-colors duration-300">
              Connect
            </h3>
            <p className="text-gray-600 text-base md:text-lg text-center leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
              Build meaningful relationships with peers, mentors, and industry
              leaders in our collaborative community.
            </p>
          </div>

          <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:rotate-1 border border-gray-100 hover:border-purple-200 animate-fade-in-up animation-delay-400">
            <div className="relative w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-8 h-8 text-purple-600 group-hover:text-purple-700 transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <div className="absolute inset-0 bg-purple-400/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 text-center group-hover:text-purple-600 transition-colors duration-300">
              Grow
            </h3>
            <p className="text-gray-600 text-base md:text-lg text-center leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
              Develop your skills through workshops, hackathons, and real-world
              projects that prepare you for success.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-white via-blue-50 to-purple-50 rounded-3xl p-10 md:p-12 shadow-lg mb-20 border border-gray-100 animate-fade-in-up animation-delay-600">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Our Impact
            </h2>
            <p className="text-gray-600">Growing together, learning together</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center">
            <div className="group p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                4000+
              </div>
              <div className="text-gray-600 text-base md:text-lg font-medium group-hover:text-blue-700 transition-colors duration-300">
                Students
              </div>
            </div>
            <div className="group p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                100+
              </div>
              <div className="text-gray-600 text-base md:text-lg font-medium group-hover:text-green-700 transition-colors duration-300">
                Faculty
              </div>
            </div>
            <div className="group p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                50+
              </div>
              <div className="text-gray-600 text-base md:text-lg font-medium group-hover:text-purple-700 transition-colors duration-300">
                Speakers
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 rounded-3xl p-10 md:p-12 shadow-lg border border-gray-100 animate-fade-in-up animation-delay-800">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 mb-4 tracking-tight">
              Get In Touch
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Ready to join our community? We'd love to hear from you and help
              you get started.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="w-24 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 rounded-full"></div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="space-y-6">
              {!isLoggedIn() && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-blue-600 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">
                        Login Required
                      </h4>
                      <p className="text-sm text-blue-700">
                        Please login with your college email to send us a
                        message. Your email will be automatically filled.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isLoggedIn() && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-600 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-green-800">
                        Welcome, {profile?.displayName}!
                      </h4>
                      <p className="text-sm text-green-700">
                        Your college email has been auto-filled. You can now
                        send us a message.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isLoggedIn()}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 placeholder-gray-400 ${
                    !isLoggedIn()
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                      : formData.name.trim() === ""
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder={
                    isLoggedIn()
                      ? "Enter your full name"
                      : "Please login to fill this form"
                  }
                  required
                  aria-required="true"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  College Email Address <span className="text-red-500">*</span>
                  {!isLoggedIn() && (
                    <span className="text-sm text-gray-500 ml-2">
                      (Login required)
                    </span>
                  )}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isLoggedIn()}
                  readOnly={isLoggedIn()} // Make it read-only when logged in to prevent changes
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 placeholder-gray-400 ${
                    !isLoggedIn()
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                      : "bg-gray-50 border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder={
                    isLoggedIn()
                      ? "Your college email (auto-filled)"
                      : "Please login to auto-fill your college email"
                  }
                  required
                  aria-required="true"
                />
                {isLoggedIn() && (
                  <p className="text-xs text-gray-500 mt-1">
                    This must match your login email address
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleInputChange}
                  disabled={!isLoggedIn()}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 resize-none placeholder-gray-400 ${
                    !isLoggedIn()
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                      : formData.message.trim() === ""
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder={
                    isLoggedIn()
                      ? "Tell us how we can help you..."
                      : "Please login to send a message"
                  }
                  required
                  aria-required="true"
                ></textarea>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!isFormValid() || !isLoggedIn()}
                className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  !isLoggedIn()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed focus:ring-gray-300"
                    : isFormValid()
                    ? "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 focus:ring-blue-500"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed focus:ring-gray-300"
                }`}
                aria-label="Send message"
              >
                {!isLoggedIn()
                  ? "Please Login to Send Message"
                  : isFormValid()
                  ? "Send Message"
                  : "Please fill all fields"}
              </button>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">
                  Contact Information
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <a
                        href="mailto:skillbridge.portal@gmail.com"
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      >
                        skillbridge.portal@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Phone</p>
                      <a
                        href="tel:+919876543210"
                        className="text-green-600 hover:text-green-800 transition-colors duration-200"
                      >
                        +91 98765 43210
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Address</p>
                      <p className="text-gray-600">
                        Vishnu Institute of Technology
                        <br />
                        Bhimavaram
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">
                  Follow Us
                </h3>
                <div className="flex justify-start gap-4">
                  <a
                    href="https://linkedin.com/company/skillbridge"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    aria-label="Connect with us on LinkedIn"
                  >
                    <svg
                      className="w-6 h-6 text-gray-700"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a
                    href="https://instagram.com/skillbridge"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    aria-label="Follow us on Instagram"
                  >
                    <svg
                      className="w-6 h-6 text-gray-700"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="https://wa.me/1234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    aria-label="Contact us on WhatsApp"
                  >
                    <svg
                      className="w-6 h-6 text-gray-700"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AlertModal
        isOpen={showSuccessModal}
        message="Email sent successfully! We'll get back to you soon."
        onClose={() => setShowSuccessModal(false)}
        type="success"
      />

      {/* Error Modal */}
      <AlertModal
        isOpen={showErrorModal}
        message={
          !isLoggedIn()
            ? "Please login to send a message. You must be logged in with your college email to use this form."
            : formData.email !== currentUser?.email
            ? "The email address must match your login email. Please use your college email address."
            : "Please fill in all required fields with valid information before sending your message."
        }
        onClose={() => setShowErrorModal(false)}
        type="error"
      />
    </div>
  );
}
