import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero.jpg";

// Typing Effect Component
const TypingEffect = ({ text, baseSpeed = 100, loopInterval = 5000 }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  // Generate human-like typing speed with slight randomization
  const getTypingSpeed = (char) => {
    const base = baseSpeed;
    const variation = Math.random() * 60 - 30; // ±30ms variation
    const charMultiplier = char === " " ? 1.5 : 1; // Slightly slower on spaces
    return Math.max(50, (base + variation) * charMultiplier);
  };

  useEffect(() => {
    let timeout;

    if (currentIndex < text.length) {
      // Still typing
      const currentChar = text[currentIndex];
      const speed = getTypingSpeed(currentChar);

      timeout = setTimeout(() => {
        setDisplayText((prev) => prev + currentChar);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
    } else {
      // Finished typing, wait for loop interval then restart
      timeout = setTimeout(() => {
        setDisplayText("");
        setCurrentIndex(0);
      }, loopInterval);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [currentIndex, text, baseSpeed, loopInterval]);

  // Handle cursor blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <span className="inline-block">
      <span className="transition-all duration-75 ease-out">{displayText}</span>
      <span
        className={`inline-block w-1 h-8 sm:h-10 lg:h-12 xl:h-14 bg-white ml-1 transition-all duration-200 ease-in-out ${
          showCursor ? "opacity-100" : "opacity-0"
        }`}
      ></span>
    </span>
  );
};

export default function Home() {
  const testimonialsRef = useRef(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (testimonialsRef.current) {
      const container = testimonialsRef.current;
      const cards = container.children;
      if (cards.length > 0) {
        const cardWidth = cards[0].offsetWidth + 16; // 16px for mr-4 margin
        container.scrollTo({
          left: currentTestimonial * cardWidth,
          behavior: "smooth",
        });
      }
    }
  }, [currentTestimonial]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-left md:bg-center transform scale-105 transition-transform duration-1000 hover:scale-110"
            style={{ backgroundImage: `url(${heroImage})` }}
          ></div>
          {/* Multiple gradient layers for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/75 to-purple-900/70"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/60 via-transparent to-cyan-900/50"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10"></div>
          {/* Animated overlay for dynamic effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/15 to-indigo-600/20 animate-pulse"></div>

          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: "60px 60px",
              }}
            ></div>
          </div>

          {/* Floating Elements */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center animate-fade-in-up">
              {/* Logo/Brand */}
              <div className="mb-6 sm:mb-8 animate-bounce-in">
                <div className="relative inline-block">
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-3 sm:mb-4 drop-shadow-2xl hover:scale-105 transition-transform duration-300">
                    <TypingEffect
                      text="SkillBridge"
                      baseSpeed={100}
                      loopInterval={5000}
                    />
                  </h1>
                </div>
                <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 mx-auto rounded-full shadow-lg animate-glow animation-delay-400"></div>
              </div>

              {/* Main Heading */}
              <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-semibold text-white mb-4 sm:mb-6 max-w-4xl mx-auto leading-tight px-2 drop-shadow-lg animate-slide-up animation-delay-200 hover:scale-105 transition-transform duration-300">
                Empowering Students Through Knowledge Sharing
              </h2>

              {/* Description */}
              <p className="text-base sm:text-lg lg:text-xl text-gray-100 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-2 drop-shadow-md animate-slide-up animation-delay-400 hover:text-gray-50 transition-colors duration-300">
                A peer-driven, faculty-validated platform where students
                connect, propose, and attend transformative knowledge-sharing
                sessions.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 lg:gap-6 mb-12 sm:mb-16 px-4 animate-slide-up animation-delay-400">
                <Link
                  to="/signup"
                  className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white font-semibold rounded-lg hover:from-blue-500 hover:via-blue-600 hover:to-purple-600 transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 text-sm sm:text-base overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <span className="relative z-10">Get Started</span>
                  <svg
                    className="w-4 sm:w-5 h-4 sm:h-5 ml-2 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300 relative z-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                </Link>

                <Link
                  to="/sessions"
                  className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white/80 text-white font-semibold rounded-lg hover:bg-white/90 hover:text-blue-600 transition-all duration-500 backdrop-blur-sm bg-white/10 text-sm sm:text-base transform hover:scale-110 hover:shadow-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">Browse Sessions</span>
                  <svg
                    className="w-4 sm:w-5 h-4 sm:h-5 ml-2 group-hover:translate-x-2 group-hover:rotate-12 transition-all duration-300 relative z-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <div className="absolute inset-0 rounded-lg border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose SkillBridge Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Why Choose SkillBridge?
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Discover the unique advantages that make SkillBridge the premier
                platform for student-led knowledge sharing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
              {/* Feature 1: Peer Learning */}
              <div className="group text-center bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100/50">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  Peer-to-Peer Learning
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Connect with fellow students who share your passion for
                  learning. Exchange knowledge and grow together in a supportive
                  community.
                </p>
              </div>

              {/* Feature 2: Faculty Validation */}
              <div className="group text-center bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-green-100/50">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  Faculty-Validated Content
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  All sessions are reviewed and approved by experienced faculty
                  members, ensuring quality and academic integrity.
                </p>
              </div>

              {/* Feature 3: Interactive Sessions */}
              <div className="group text-center bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-purple-100/50">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  Interactive Learning
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Engage in dynamic Q&A sessions, live discussions, and
                  collaborative problem-solving with speakers and attendees.
                </p>
              </div>

              {/* Feature 4: Diverse Topics */}
              <div className="group text-center bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-orange-100/50">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  Diverse Knowledge Areas
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Explore topics ranging from cutting-edge technology to
                  creative arts, business strategies to scientific research.
                </p>
              </div>

              {/* Feature 5: Skill Development */}
              <div className="group text-center bg-gradient-to-br from-teal-50 to-cyan-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-teal-100/50">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  Accelerated Skill Growth
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Fast-track your learning journey with practical insights from
                  peers who've mastered the subjects you're studying.
                </p>
              </div>

              {/* Feature 6: Suggest a Topic */}
              <div className="group text-center bg-gradient-to-br from-yellow-50 to-amber-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-yellow-100/50">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  Suggest a Topic
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Have a burning question or want to share your expertise?
                  Propose topics that interest you and help shape our learning
                  community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-purple-100/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Join Our Growing Community
              </h2>
              <p className="text-base sm:text-lg text-gray-600">
                Be part of a thriving educational ecosystem
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
              <div className="group text-center bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/50">
                <div className="relative">
                  <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    4000+
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full"></div>
                </div>
                <div className="text-base sm:text-lg font-medium text-gray-700 mb-2">
                  Active Students
                </div>
                <div className="text-sm text-gray-500">Learning together</div>
              </div>

              <div className="group text-center bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/50">
                <div className="relative">
                  <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    100+
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-base sm:text-lg font-medium text-gray-700 mb-2">
                  Expert Faculty
                </div>
                <div className="text-sm text-gray-500">Guiding excellence</div>
              </div>

              <div className="group text-center bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/50">
                <div className="relative">
                  <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    50+
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-500 rounded-full animate-ping"></div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-500 rounded-full"></div>
                </div>
                <div className="text-base sm:text-lg font-medium text-gray-700 mb-2">
                  Authorized Speakers
                </div>
                <div className="text-sm text-gray-500">
                  Faculty-approved expertise
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                What Our Community Says
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Hear from students and faculty who have transformed their
                learning experience
              </p>
            </div>

            <div
              ref={testimonialsRef}
              className="flex overflow-x-auto snap-x snap-mandatory pb-4 px-2 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 lg:gap-8 md:overflow-visible md:snap-none md:pb-0"
            >
              {/* Testimonial 1 */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200/50 flex-shrink-0 w-72 mr-4 md:mr-0 md:w-auto transform hover:scale-105 hover:-translate-y-2 backdrop-blur-sm">
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    G
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900 text-lg">Ganesh</h4>
                    <p className="text-sm text-blue-600 font-medium">
                      Computer Science Student
                    </p>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-4 space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 italic leading-relaxed text-base">
                  "SkillBridge helped me connect with amazing mentors and learn
                  skills that aren't taught in classrooms. The sessions are
                  incredibly valuable!"
                </p>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200/50 flex-shrink-0 w-72 mr-4 md:mr-0 md:w-auto transform hover:scale-105 hover:-translate-y-2 backdrop-blur-sm">
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    S
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900 text-lg">
                      Mr. Subba Rao
                    </h4>
                    <p className="text-sm text-green-600 font-medium">
                      Faculty
                    </p>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-4 space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 italic leading-relaxed text-base">
                  "As faculty, I appreciate how SkillBridge maintains quality
                  through our validation process. Students are gaining
                  real-world skills."
                </p>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200/50 flex-shrink-0 w-72 mr-4 md:mr-0 md:w-auto transform hover:scale-105 hover:-translate-y-2 backdrop-blur-sm">
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    H
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900 text-lg">Harsha</h4>
                    <p className="text-sm text-purple-600 font-medium">
                      Speaker
                    </p>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-4 space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 italic leading-relaxed text-base">
                  "Being a speaker on SkillBridge has been incredibly rewarding.
                  The students are engaged and eager to learn from diverse
                  perspectives and experiences."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-white/10 rounded-full animate-bounce animation-delay-1000"></div>
            <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-bounce animation-delay-500"></div>
          </div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 animate-fade-in-up">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 sm:mb-10 leading-relaxed px-2 animate-fade-in-up animation-delay-200">
              Join thousands of students already transforming their education
              through SkillBridge.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 lg:gap-6 animate-fade-in-up animation-delay-400">
              <Link
                to="/signup"
                className="group relative inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-white to-gray-100 text-blue-600 font-bold rounded-xl hover:from-gray-100 hover:to-white transition-all duration-300 shadow-2xl hover:shadow-white/25 transform hover:-translate-y-1 text-sm sm:text-base overflow-hidden"
              >
                <span className="relative z-10">Get Started Today</span>
                <svg
                  className="w-5 sm:w-6 h-5 sm:h-6 ml-3 group-hover:translate-x-1 transition-transform duration-200 relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>

              <Link
                to="/about"
                className="group inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 border-2 border-white/80 text-white font-bold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300 backdrop-blur-sm bg-white/10 text-sm sm:text-base transform hover:scale-105"
              >
                Learn More
                <svg
                  className="w-5 sm:w-6 h-5 sm:h-6 ml-3 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
            {/* Brand Section */}
            <div className="lg:col-span-1 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                Skill<span className="text-blue-400">Bridge</span>
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4 sm:mb-6">
                Empowering students through peer-driven knowledge sharing and
                faculty-validated learning experiences.
              </p>
              <div className="flex justify-center md:justify-start space-x-3 sm:space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                >
                  <svg
                    className="w-4 sm:w-5 h-4 sm:h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                >
                  <svg
                    className="w-4 sm:w-5 h-4 sm:h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                >
                  <svg
                    className="w-4 sm:w-5 h-4 sm:h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="text-center md:text-left">
              <h4 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">
                Quick Links
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <Link
                    to="/sessions"
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm"
                  >
                    Browse Sessions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm"
                  >
                    Join as Student
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm"
                  >
                    Join as Speaker
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm"
                  >
                    My Profile
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="text-center md:text-left">
              <h4 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">
                Support
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="text-center md:text-left">
              <h4 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">
                Contact Info
              </h4>
              <div className="space-y-4 sm:space-y-5">
                {/* Address */}
                <div className="flex flex-col items-center md:items-start space-y-2">
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-5 sm:w-6 h-5 sm:h-6 text-blue-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-white font-medium text-sm sm:text-base">
                      Address
                    </span>
                  </div>
                  <div className="text-gray-300 text-xs sm:text-sm text-center md:text-left ml-8">
                    <div className="font-medium">
                      Vishnu Institute of Technology
                    </div>
                    <div>Bhimavaram, Andhra Pradesh</div>
                    <div>India - 534202</div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col items-center md:items-start space-y-2">
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-5 sm:w-6 h-5 sm:h-6 text-blue-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-white font-medium text-sm sm:text-base">
                      Email
                    </span>
                  </div>
                  <a
                    href="mailto:skillbridge.portal@gmail.com"
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-xs sm:text-sm ml-8 hover:underline"
                  >
                    skillbridge.portal@gmail.com
                  </a>
                </div>

                {/* Phone */}
                <div className="flex flex-col items-center md:items-start space-y-2">
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-5 sm:w-6 h-5 sm:h-6 text-blue-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="text-white font-medium text-sm sm:text-base">
                      Phone
                    </span>
                  </div>
                  <span className="text-gray-300 text-xs sm:text-sm ml-8">
                    +91 98765 43210
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-xs sm:text-sm">
                © 2025 SkillBridge. All rights reserved.
              </p>
              <div className="flex space-x-4 sm:space-x-6 mt-3 sm:mt-4 md:mt-0">
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-xs sm:text-sm"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-xs sm:text-sm"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-xs sm:text-sm"
                >
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
