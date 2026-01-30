import React, { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";

export default function ProposeForm({ user }) {
  const { currentUser } = useAuth();
  const { showAlert } = useAlert();
  // Assume 'user' prop has name, email, linkedin, phone
  const [year, setYear] = useState("");
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Dummy email behavior: simulate success via app notification, then save to Firestore
      showAlert("Submitting proposal...", "info");

      // Save to Firestore
      await setDoc(
        doc(db, "speakerProposals", `${currentUser.uid}_${Date.now()}`),
        {
          studentId: currentUser.uid,
          name: user?.displayName || "",
          email: user?.email || "",
          linkedin: user?.linkedin || "",
          phone: user?.phone || "",
          year,
          resume,
          status: "pending",
          createdAt: serverTimestamp(),
        }
      );
      showAlert(
        "Proposal submitted successfully! (email simulated)",
        "success"
      );
    } catch (error) {
      console.error("Error:", error);
      showAlert("Submission failed.", "error");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Propose a Session</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            value={user?.displayName || ""}
            readOnly
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={user?.email || ""}
            readOnly
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">LinkedIn</label>
          <input
            type="text"
            value={user?.linkedin || ""}
            readOnly
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input
            type="tel"
            value={user?.phone || ""}
            readOnly
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Current Year</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select Year</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Resume</label>
          <input
            type="url"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="https://drive.google.com/..."
            required
            className="w-full p-2 border rounded"
          />
          {resume && (
            <p className="mt-2 text-sm text-blue-600">
              <a
                href={resume}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                📄 View Resume
              </a>
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
