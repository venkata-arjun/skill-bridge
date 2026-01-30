import React, { useState, useEffect, useRef } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import {
  Pencil,
  X,
  Plus,
  Camera,
  GraduationCap,
  Mic,
  UserCheck,
  Link,
} from "lucide-react";
import AlertModal from "../components/AlertModal";

export default function Profile() {
  const { currentUser, profile, reloadProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    headline: "",
    bio: "",
    skills: [],
    linkedin: "",
    github: "",
    email: "",
    phone: "",
    resume: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || "",
        headline: profile.headline || "",
        bio: profile.bio || "",
        skills: profile.skills || [],
        linkedin: profile.linkedin || "",
        github: profile.github || "",
        email: profile.email || currentUser.email || "",
        phone: profile.phone || "",
        resume: profile.resume || "",
      });
    }
  }, [profile]);

  // Listen for scheduled interviews for this user
  const [scheduledProposals, setScheduledProposals] = useState([]);
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "speakerProposals"),
      where("studentId", "==", currentUser.uid),
      where("status", "==", "scheduled")
    );
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Filter out interviews that have already passed
      const now = new Date();
      const activeScheduled = arr.filter((proposal) => {
        if (!proposal.interviewDate || !proposal.interviewTime) return true; // Keep if no date/time set

        // Use interviewTimestamp if available, otherwise parse the string
        let interviewDateTime;
        if (proposal.interviewTimestamp && proposal.interviewTimestamp.toDate) {
          interviewDateTime = proposal.interviewTimestamp.toDate();
        } else {
          try {
            interviewDateTime = new Date(
              `${proposal.interviewDate} ${proposal.interviewTime}`
            );
          } catch (error) {
            console.warn("Error parsing interview date/time:", error);
            return true; // Keep if date parsing fails
          }
        }
        return interviewDateTime > now; // Only show future interviews
      });
      setScheduledProposals(activeScheduled);
    });
    return () => unsub && unsub();
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !formData.skills.includes(s)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, s] }));
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.displayName.trim()) {
      setMessage({ type: "error", text: "Display name is required." });
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        headline: formData.headline,
        bio: formData.bio,
        skills: formData.skills,
        linkedin: formData.linkedin,
        github: formData.github,
        phone: formData.phone,
        resume: formData.resume,
      });

      await reloadProfile();
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3200);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin mx-auto"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-800">
              Loading your profile...
            </h3>
            <p className="text-gray-600">
              Please wait while we fetch your information
            </p>
          </div>
        </div>
      </div>
    );
  }

  const initials = (profile.displayName || currentUser.email || "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const messageStyles = {
    success: "bg-green-50 text-green-800 border-green-200",
    error: "bg-red-50 text-red-800 border-red-200",
  };

  const roleTags = (
    <div className="mt-2 flex items-center justify-center gap-3">
      {/* Always show student tag if the user was a student or is a speaker (speakers should still be identifiable as students) */}
      {(profile.role === "student" || profile.role === "speaker") && (
        <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-lg border border-blue-200">
          <GraduationCap className="w-4 h-4 mr-2" />
          Student
        </span>
      )}
      {profile.role === "speaker" && (
        <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-lg border border-green-200">
          <Mic className="w-4 h-4 mr-2" />
          Speaker
        </span>
      )}
      {profile.facultyTag === "faculty" && (
        <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-lg border border-purple-200">
          <UserCheck className="w-4 h-4 mr-2" />
          Faculty
        </span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen py-4 sm:py-6 md:py-12 lg:py-16 px-0 sm:px-6 lg:px-8">
      <div className="w-full">
        <header className="mb-8 sm:mb-10 relative">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-2">
                  Profile
                </h1>
                <p className="text-xs sm:text-lg text-gray-600 font-medium">
                  Manage your professional profile
                </p>
              </div>
              <div className="flex-shrink-0 ml-4">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 border border-blue-600/20"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transform hover:scale-105 transition-all duration-200 shadow-md"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100/50 backdrop-blur-sm">
          <div className="grid grid-cols-1 xl:grid-cols-5 min-h-[500px]">
            <div className="xl:col-span-3 p-8 sm:p-10 md:p-12 lg:p-14 xl:p-16">
              <div className="flex flex-col lg:flex-row xl:flex-col items-start gap-8 sm:gap-10 lg:gap-12 xl:gap-8">
                <div className="relative mx-auto lg:mx-0 xl:mx-auto group">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-44 xl:h-44 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-4xl font-bold text-white shadow-2xl border-4 border-white ring-4 ring-blue-100/50 transform group-hover:scale-105 transition-all duration-300">
                    {initials}
                  </div>

                  {isEditing && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Upload profile picture"
                      className="absolute -bottom-4 -right-4 inline-flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl hover:from-blue-700 hover:to-blue-800 border-4 border-white transform hover:scale-110 transition-all duration-200"
                    >
                      <Camera className="h-6 w-6" />
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                      />
                    </button>
                  )}
                </div>

                <div className="flex-1 w-full text-center lg:text-left xl:text-center space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-3xl font-bold text-gray-900 leading-tight">
                      {profile.displayName || "No Name"}
                    </h3>
                    <div className="flex justify-center">{roleTags}</div>
                    {profile.headline && (
                      <p className="text-lg sm:text-xl xl:text-lg text-blue-600 font-semibold leading-relaxed">
                        {profile.headline}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <p className="text-base sm:text-lg xl:text-base text-gray-700 leading-relaxed max-w-2xl">
                      {profile.bio ||
                        "Tell people about your background, interests, and what you're working on. Share your professional journey and expertise."}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Skills & Expertise
                    </h4>
                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start xl:justify-center">
                      {profile.skills && profile.skills.length > 0 ? (
                        profile.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-200"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm italic">
                          No skills added yet
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Scheduled Interview Card(s) */}
                  {scheduledProposals && scheduledProposals.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-1 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></span>
                        Upcoming Interviews
                      </h4>
                      <div className="space-y-4">
                        {scheduledProposals.map((p) => (
                          <div
                            key={p.id}
                            className="p-6 border rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-amber-200/50 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="flex-1 space-y-3">
                                <div className="text-lg font-bold text-gray-900">
                                  Interview for: {p.title || p.name}
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <svg
                                      className="w-4 h-4 text-amber-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                    {p.interviewDate || "Date not set"} at{" "}
                                    {p.interviewTime || "Time not set"}
                                  </div>
                                  {p.interviewVenue && (
                                    <div className="flex items-center gap-2">
                                      <svg
                                        className="w-4 h-4 text-amber-600"
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
                                      Venue: {p.interviewVenue}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex justify-center sm:justify-end">
                                <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 text-xs font-bold text-white shadow-lg">
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Scheduled
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isEditing && (
                    <form
                      onSubmit={handleSubmit}
                      className="mt-10 space-y-8 bg-gradient-to-br from-gray-50 to-blue-50/30 p-8 rounded-2xl border border-gray-100/50 shadow-inner"
                    >
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          Edit Your Profile
                        </h3>
                        <p className="text-gray-600">
                          Update your information to keep your profile current
                        </p>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                            Display Name *
                          </label>
                          <input
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleInputChange}
                            className="block w-full rounded-xl border-2 border-gray-200 shadow-sm p-4 text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-200 bg-white hover:border-gray-300"
                            placeholder="Your full name"
                            required
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                            Professional Headline
                          </label>
                          <input
                            name="headline"
                            value={formData.headline}
                            onChange={handleInputChange}
                            placeholder="e.g. Full-stack Developer, Data Scientist"
                            className="block w-full rounded-xl border-2 border-gray-200 shadow-sm p-4 text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-200 bg-white hover:border-gray-300"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
                          <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                          About Me
                        </label>
                        <textarea
                          name="bio"
                          rows={5}
                          value={formData.bio}
                          onChange={handleInputChange}
                          placeholder="Tell others about your background, interests, and what you're working on. Share your professional journey and expertise..."
                          className="block w-full rounded-xl border-2 border-gray-200 shadow-sm p-4 text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-200 bg-white hover:border-gray-300 resize-vertical"
                        />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-gray-600"
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
                            Email Address
                          </label>
                          <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="your.email@example.com"
                            className="block w-full rounded-xl border-2 border-gray-200 shadow-sm p-4 text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-200 bg-white hover:border-gray-300"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-gray-600"
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
                            Phone Number
                          </label>
                          <input
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+1 (555) 123-4567"
                            className="block w-full rounded-xl border-2 border-gray-200 shadow-sm p-4 text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-200 bg-white hover:border-gray-300"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-blue-600"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                            LinkedIn Profile
                          </label>
                          <input
                            name="linkedin"
                            type="url"
                            value={formData.linkedin}
                            onChange={handleInputChange}
                            placeholder="https://linkedin.com/in/yourprofile"
                            className="block w-full rounded-xl border-2 border-gray-200 shadow-sm p-4 text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-200 bg-white hover:border-gray-300"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-gray-800"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            GitHub Profile
                          </label>
                          <input
                            name="github"
                            type="url"
                            value={formData.github}
                            onChange={handleInputChange}
                            placeholder="https://github.com/yourusername"
                            className="block w-full rounded-xl border-2 border-gray-200 shadow-sm p-4 text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-200 bg-white hover:border-gray-300"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-gray-800"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          Resume Link
                        </label>
                        <input
                          name="resume"
                          type="url"
                          value={formData.resume}
                          onChange={handleInputChange}
                          placeholder="https://drive.google.com/file/d/... or other link"
                          className="block w-full rounded-xl border-2 border-gray-200 shadow-sm p-4 text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-200 bg-white hover:border-gray-300"
                        />
                      </div>

                      <div className="space-y-6">
                        <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
                          <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                          Skills & Technologies
                        </label>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <input
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === "Enter" &&
                              (e.preventDefault(), addSkill())
                            }
                            placeholder="Add a skill (e.g. React, Python, Machine Learning)"
                            className="flex-1 rounded-xl border-2 border-gray-200 shadow-sm p-4 text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-200 bg-white hover:border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={addSkill}
                            className="inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-sm font-semibold text-white shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 border border-blue-600/20"
                          >
                            <Plus className="h-5 w-5" />
                            Add Skill
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {formData.skills.map((s, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3 text-sm font-semibold text-blue-700 border border-blue-200/50 shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                            >
                              {s}
                              <button
                                type="button"
                                onClick={() => removeSkill(s)}
                                className="rounded-full p-2 text-blue-600 hover:bg-red-100 hover:text-red-600 transition-all duration-200"
                                title="Remove skill"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-8 py-4 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transform hover:scale-105 transition-all duration-200 font-semibold shadow-sm"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-8 py-4 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg border border-green-600/20"
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <svg
                                className="animate-spin h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Saving Changes...
                            </span>
                          ) : (
                            "Save Profile"
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {!isEditing && (
              <div className="xl:col-span-2 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8 md:p-10 lg:p-12 xl:p-6 text-white flex flex-col items-center justify-center gap-6 relative overflow-hidden">
                {/* Enhanced background decorations */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-purple-700/30"></div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16 blur-2xl"></div>
                <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl"></div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-2">
                  <div className="space-y-2">
                    <div className="text-sm md:text-base xl:text-sm tracking-wider uppercase text-blue-200/80 font-medium mb-4">
                      Profile
                    </div>
                    <div className="text-2xl md:text-3xl lg:text-4xl xl:text-2xl font-bold leading-tight">
                      {profile.displayName || "Your Name"}
                    </div>
                    {profile.headline && (
                      <p className="text-base md:text-lg xl:text-base text-blue-100 font-medium mb-2 max-w-sm leading-relaxed">
                        {profile.headline}
                      </p>
                    )}
                  </div>

                  {/* Resume Section - Only show if resume link exists */}
                  {profile.resume && (
                    <div className="w-full max-w-sm">
                      <a
                        href={profile.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex items-center justify-center gap-2 p-4 pl-6 backdrop-blur-lg rounded-xl text-white transition-all duration-300"
                      >
                        <Link className="w-4 h-4 text-blue-300" />
                        <div className="text-center">
                          <div className="text-sm font-medium text-blue-200">
                            Resume
                          </div>
                          <div className="text-xs text-blue-300/80">
                            View my resume
                          </div>
                        </div>
                      </a>
                    </div>
                  )}

                  <div className="w-full text-center mb-4">
                    <h3 className="text-lg font-semibold text-blue-100">
                      Contact me
                    </h3>
                  </div>

                  <div className="flex flex-nowrap gap-4 md:flex-wrap md:gap-7 xl:gap-5 justify-center w-full max-w-md">
                    {profile.email && (
                      <a
                        href={`mailto:${profile.email}`}
                        className="group relative p-3 md:p-4 xl:p-5 rounded-full bg-white/10 backdrop-blur-lg text-white transition-all duration-300 hover:bg-white/20 hover:scale-110 shadow-xl hover:shadow-blue-500/25"
                        title="Send Email"
                        aria-label={`Send email to ${profile.email}`}
                      >
                        <svg
                          className="w-4 h-4 md:w-5 md:h-5 xl:w-6 xl:h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </a>
                    )}
                    {profile.phone && (
                      <button
                        onClick={() => setShowPhoneModal(true)}
                        className="group relative p-3 md:p-4 xl:p-5 rounded-full bg-white/10 backdrop-blur-lg text-white transition-all duration-300 hover:bg-white/20 hover:scale-110 shadow-xl hover:shadow-green-500/25"
                        title="Call"
                        aria-label="View phone number"
                      >
                        <svg
                          className="w-4 h-4 md:w-5 md:h-5 xl:w-6 xl:h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    )}
                    {profile.linkedin && (
                      <a
                        href={profile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative p-3 md:p-4 xl:p-5 rounded-full bg-white/10 backdrop-blur-lg text-white transition-all duration-300 hover:bg-white/20 hover:scale-110 shadow-xl hover:shadow-blue-600/25"
                        title="LinkedIn Profile"
                        aria-label="Visit LinkedIn profile"
                      >
                        <svg
                          className="w-4 h-4 md:w-5 md:h-5 xl:w-6 xl:h-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </a>
                    )}
                    {profile.github && (
                      <a
                        href={profile.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative p-3 md:p-4 xl:p-5 rounded-full bg-white/10 backdrop-blur-lg text-white transition-all duration-300 hover:bg-white/20 hover:scale-110 shadow-xl hover:shadow-gray-600/25"
                        title="GitHub Profile"
                        aria-label="Visit GitHub profile"
                      >
                        <svg
                          className="w-4 h-4 md:w-5 md:h-5 xl:w-6 xl:h-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-500/20 to-gray-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {message && (
          <div
            className={`mt-6 sm:mt-8 rounded-2xl border-2 p-6 text-sm shadow-lg backdrop-blur-sm ${
              message.type === "success"
                ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200"
                : "bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-red-200"
            }`}
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  message.type === "success" ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {message.type === "success" ? (
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1 font-medium">{message.text}</div>
              <button
                onClick={() => setMessage("")}
                className={`flex-shrink-0 rounded-full p-1 transition-colors duration-200 ${
                  message.type === "success"
                    ? "text-green-600 hover:bg-green-100 hover:text-green-800"
                    : "text-red-600 hover:bg-red-100 hover:text-red-800"
                }`}
                aria-label="Dismiss message"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Phone Modal */}
      <AlertModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        message={`Phone: ${profile?.phone || "No phone number available"}`}
        type="info"
      />
    </div>
  );
}
