import React from "react";
import { Link } from "react-router-dom";
import { Mic, MessageSquare, ArrowRight, Users, Lightbulb } from "lucide-react";

export default function RequestLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl mx-auto sm:max-w-6xl">
        {/* Mobile Full-Screen Container */}
        <div className="fixed inset-0 sm:relative sm:inset-auto bg-gradient-to-br from-gray-50 to-blue-50 sm:bg-transparent rounded-none sm:rounded-none shadow-none sm:shadow-none border-none sm:border-none overflow-auto sm:overflow-visible z-40 sm:z-auto top-16 sm:top-0 pt-16 sm:pt-0">
          <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              {/* Header Section */}
              <div className="text-center mb-20">
                <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
                  Get <span className="text-blue-600">Involved</span>
                </h1>

                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
                  Join our vibrant community and help shape the future of
                  knowledge sharing
                </p>

                {/* Feature highlights */}
                <div className="flex flex-wrap justify-center gap-4 mb-16">
                  <span className="bg-blue-100 text-blue-800 px-6 py-3 rounded-full font-medium shadow-sm">
                    Community Driven
                  </span>
                  <span className="bg-green-100 text-green-800 px-6 py-3 rounded-full font-medium shadow-sm">
                    Knowledge Sharing
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-6 py-3 rounded-full font-medium shadow-sm">
                    Expert Speakers
                  </span>
                </div>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Become a Speaker Card */}
                <Link
                  to="/request/become-speaker"
                  className="block bg-white border border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-300"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Mic className="w-7 h-7 text-blue-600" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Become a Speaker
                  </h2>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Share your expertise and inspire others. Join our community
                    of speakers and help shape the future of knowledge sharing
                    at SkillBridge.
                  </p>

                  <div className="flex items-center gap-3 text-sm">
                    <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium">
                      Apply Now
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">Faculty Review</span>
                  </div>
                </Link>

                {/* Request a Topic Card */}
                <Link
                  to="/request/topic"
                  className="block bg-white border border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-green-300"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-7 h-7 text-green-600" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Request a Topic
                  </h2>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Have an idea for an amazing session? Submit your topic
                    suggestion and our expert speakers will review and bring it
                    to life.
                  </p>

                  <div className="flex items-center gap-3 text-sm">
                    <span className="bg-green-50 text-green-700 px-4 py-2 rounded-lg font-medium">
                      Suggest Topic
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">Speaker Review</span>
                  </div>
                </Link>
              </div>

              {/* Additional Info Section */}
              <div className="mt-20 text-center">
                <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 max-w-5xl mx-auto">
                  <h3 className="text-3xl font-bold text-gray-900 mb-12">
                    Why Join SkillBridge?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center group">
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                        <Users className="w-8 h-8 text-blue-600" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-3">
                        Connect & Network
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        Build meaningful connections with like-minded
                        individuals and industry experts.
                      </p>
                    </div>
                    <div className="text-center group">
                      <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors duration-300">
                        <Lightbulb className="w-8 h-8 text-purple-600" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-3">
                        Learn & Grow
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        Expand your knowledge and skills through diverse topics
                        and expert insights.
                      </p>
                    </div>
                    <div className="text-center group">
                      <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-pink-200 transition-colors duration-300">
                        <Mic className="w-8 h-8 text-pink-600" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-3">
                        Share & Inspire
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        Make a difference by sharing your knowledge and
                        inspiring the next generation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
