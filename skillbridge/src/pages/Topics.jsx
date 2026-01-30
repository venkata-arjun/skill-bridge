import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { ThumbsUp, BookOpen } from "lucide-react";

export default function Topics() {
  const { currentUser, profile } = useAuth();
  const [newTopic, setNewTopic] = useState({
    topic: "",
    description: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [proposedTopics, setProposedTopics] = useState([]);

  // Fetch proposed topics
  React.useEffect(() => {
    const q = query(
      collection(db, "sessions"),
      where("status", "==", "proposed"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort by upvotes first, then by createdAt
        const sorted = arr.sort((a, b) => {
          const aUpvotes = a.upvotes || 0;
          const bUpvotes = b.upvotes || 0;
          if (aUpvotes !== bUpvotes) {
            return bUpvotes - aUpvotes;
          }
          const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
          const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
          return bTime - aTime;
        });
        setProposedTopics(sorted);
      },
      (err) => {
        console.error("topics snapshot error:", err);
        setError(err.message || "Failed to load topics");
      }
    );

    return () => unsub();
  }, []);

  async function handleCreateTopic(e) {
    e.preventDefault();
    if (!currentUser) return;
    if (!newTopic.topic.trim()) {
      setError("Please provide a topic.");
      return;
    }

    setCreating(true);
    try {
      await addDoc(collection(db, "sessions"), {
        title: newTopic.topic.trim(),
        description: newTopic.description.trim() || "",
        authorId: currentUser.uid,
        authorName: profile?.displayName || currentUser.email,
        createdAt: serverTimestamp(),
        date: null,
        status: "proposed",
        attendeeCount: 0,
        maxAttendees: null,
        upvotes: 0,
      });

      // Reset form
      setNewTopic({
        topic: "",
        description: "",
      });
      setError("");
    } catch (err) {
      console.error("create topic error:", err);
      setError(err.message || "Failed to create topic");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Topics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and explore proposed topics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Create Topic Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Topic
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic Title
                </label>
                <input
                  type="text"
                  value={newTopic.topic}
                  onChange={(e) =>
                    setNewTopic({ ...newTopic, topic: e.target.value })
                  }
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
                  placeholder="Enter topic title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTopic.description}
                  onChange={(e) =>
                    setNewTopic({ ...newTopic, description: e.target.value })
                  }
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 h-24 resize-none"
                  placeholder="Describe your proposed topic"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {creating ? "Creating..." : "Create Topic"}
              </button>
            </form>
          </div>
        </div>

        {/* Topics List */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between sm:-mt-12">
              <h2 className="text-lg font-bold text-gray-900">
                Student Suggested Topics
              </h2>
            </div>

            {proposedTopics.length === 0 ? (
              <div className="text-gray-500 p-6 bg-white rounded-xl shadow-sm text-center">
                No suggested topics yet. Be the first to create one!
              </div>
            ) : (
              <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900">
                      Student Suggestions
                    </h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {proposedTopics.length}
                    </span>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {proposedTopics.map((topic) => {
                      const upvoteCount = topic.upvotes || 0;
                      return (
                        <div
                          key={topic.id}
                          className="p-4 border border-gray-100 rounded-lg bg-white"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <h5 className="font-bold text-gray-900 text-base mb-2">
                                  {topic.title}
                                </h5>
                                {topic.description && (
                                  <p className="text-gray-700 text-sm leading-relaxed">
                                    {topic.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600 sm:ml-4 self-end sm:self-auto bg-white px-2 py-1 rounded">
                              <ThumbsUp className="w-4 h-4" />
                              <span className="font-semibold">
                                {upvoteCount}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
