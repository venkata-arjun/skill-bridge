import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";
import ForgotPassword from "./pages/ForgotPassword";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import FacultyDashboard from "./pages/dashboards/FacultyDashboard";
import SpeakerDashboard from "./pages/dashboards/SpeakerDashboard";
import Sessions from "./pages/Sessions";
import SessionDetails from "./pages/SessionDetails";
import StudentDashboard from "./pages/dashboards/StudentDashboard";
import Profile from "./pages/Profile";
import RequestLanding from "./pages/RequestLanding";
import BecomeSpeaker from "./pages/BecomeSpeaker";
import RequestTopic from "./pages/RequestTopic";
import Topics from "./pages/Topics";
import SuggestedTopics from "./pages/SuggestedTopics";
import StudentRequests from "./pages/StudentRequests";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/sessions"
            element={
              <main className="container mx-auto px-4 sm:px-6 lg:px-8">
                <ProtectedRoute>
                  <Sessions />
                </ProtectedRoute>
              </main>
            }
          />
          <Route
            path="/topics"
            element={
              <main className="container mx-auto px-4 sm:px-6 lg:px-8">
                <ProtectedRoute>
                  <Topics />
                </ProtectedRoute>
              </main>
            }
          />
          <Route
            path="/suggested-topics"
            element={
              <main className="container mx-auto px-4 sm:px-6 lg:px-8">
                <ProtectedRoute>
                  <SuggestedTopics />
                </ProtectedRoute>
              </main>
            }
          />
          <Route
            path="/student-requests"
            element={
              <main className="container mx-auto px-4 sm:px-6 lg:px-8">
                <ProtectedRoute>
                  <StudentRequests />
                </ProtectedRoute>
              </main>
            }
          />
          <Route
            path="/sessions/:id"
            element={
              <main className="container mx-auto px-4 sm:px-6 lg:px-8">
                <ProtectedRoute>
                  <SessionDetails />
                </ProtectedRoute>
              </main>
            }
          />
          <Route
            path="/profile"
            element={
              <main className="container mx-auto px-4 sm:px-6 lg:px-8">
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              </main>
            }
          />
          <Route
            path="/dashboard/student"
            element={
              <main className="container mx-auto px-4 sm:px-6 lg:px-8">
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              </main>
            }
          />
          <Route
            path="/dashboard/faculty"
            element={
              <main className="container mx-auto px-4 sm:px-6 lg:px-8">
                <ProtectedRoute requiredRole="faculty">
                  <FacultyDashboard />
                </ProtectedRoute>
              </main>
            }
          />
          <Route
            path="/dashboard/speaker"
            element={
              <main className="container mx-auto px-4 sm:px-6 lg:px-8">
                <ProtectedRoute requiredRole="speaker">
                  <SpeakerDashboard />
                </ProtectedRoute>
              </main>
            }
          />
          <Route
            path="/request"
            element={
              <main className="container mx-auto px-4 sm:px-6 lg:px-8">
                <ProtectedRoute>
                  <RequestLanding />
                </ProtectedRoute>
              </main>
            }
          />
          <Route
            path="/request/become-speaker"
            element={
              <main className="container mx-auto px-4 sm:px-6 lg:px-8">
                <ProtectedRoute>
                  <BecomeSpeaker />
                </ProtectedRoute>
              </main>
            }
          />
          <Route
            path="/request/topic"
            element={
              <main className="container mx-auto px-4 sm:px-6 lg:px-8">
                <ProtectedRoute requiredRole="student">
                  <RequestTopic />
                </ProtectedRoute>
              </main>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
