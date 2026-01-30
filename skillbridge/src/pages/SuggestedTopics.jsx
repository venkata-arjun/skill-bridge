import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  setDoc,
  doc,
  serverTimestamp,
  updateDoc,
  increment,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";
import { ThumbsUp, BookOpen, Tag } from "lucide-react";

export default function SuggestedTopics() {
  const { currentUser } = useAuth();
  const { showAlert } = useAlert();
  const [proposedTopics, setProposedTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upvotedSessions, setUpvotedSessions] = useState(new Set());

  // Fetch proposed topics
  useEffect(() => {
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
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching suggested topics:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  // Fetch user's upvoted sessions
  useEffect(() => {
    if (!currentUser) return;

    const unsub = onSnapshot(
      query(
        collection(db, "sessionUpvotes"),
        where("userId", "==", currentUser.uid)
      ),
      (snapshot) => {
        const upvoted = new Set();
        snapshot.forEach((doc) => {
          upvoted.add(doc.data().sessionId);
        });
        setUpvotedSessions(upvoted);
      },
      (err) => {
        console.error("Error fetching upvotes:", err);
      }
    );

    return () => unsub();
  }, [currentUser]);

  const toggleUpvote = async (sessionId) => {
    if (!currentUser) return;

    const upvoteRef = doc(
      db,
      "sessionUpvotes",
      `${currentUser.uid}_${sessionId}`
    );
    const sessionRef = doc(db, "sessions", sessionId);

    try {
      if (upvotedSessions.has(sessionId)) {
        // Remove upvote
        await deleteDoc(upvoteRef);
        await updateDoc(sessionRef, {
          upvotes: increment(-1),
        });
        setUpvotedSessions((prev) => {
          const newSet = new Set(prev);
          newSet.delete(sessionId);
          return newSet;
        });
      } else {
        // Add upvote
        await setDoc(upvoteRef, {
          userId: currentUser.uid,
          sessionId: sessionId,
          createdAt: serverTimestamp(),
        });
        await updateDoc(sessionRef, {
          upvotes: increment(1),
        });
        setUpvotedSessions((prev) => new Set([...prev, sessionId]));
      }
    } catch (error) {
      console.error("Error toggling upvote:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading suggested topics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            All Suggested Topics
          </h1>
          <p className="text-gray-600">
            Browse all student-suggested topics, sorted by upvotes
          </p>
        </div>

        {proposedTopics.length === 0 ? (
          <div className="text-gray-500 p-8 bg-white rounded-xl shadow-sm text-center">
            No suggested topics yet.
          </div>
        ) : (
          <div className="space-y-4">
            {proposedTopics.map((topic, index) => {
              const upvoteCount = topic.upvotes || 0;
              return (
                <div
                  key={topic.id}
                  className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                  onDoubleClick={() => {
                    if (upvotedSessions.has(topic.id)) {
                      showAlert("You have already upvoted this topic!", "info");
                    } else {
                      toggleUpvote(topic.id);
                      showAlert("Topic upvoted successfully!", "success");
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0">
                        <span className="text-gray-900 font-bold text-lg">
                          {index + 1}.
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <BookOpen className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg mb-2">
                              {topic.title}
                            </h3>
                            {topic.description && (
                              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                                {topic.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {topic.tags && topic.tags.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <Tag className="w-4 h-4" />
                                  <span>{topic.tags[0]}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1 ml-auto">
                                <button
                                  onClick={() => toggleUpvote(topic.id)}
                                  className={`p-1 rounded-full transition-colors duration-200 ${
                                    upvotedSessions.has(topic.id)
                                      ? "text-blue-600 hover:text-blue-700"
                                      : "hover:text-blue-500"
                                  }`}
                                  title={
                                    upvotedSessions.has(topic.id)
                                      ? "Remove upvote"
                                      : "Upvote this topic"
                                  }
                                >
                                  <ThumbsUp
                                    className="w-4 h-4"
                                    fill={
                                      upvotedSessions.has(topic.id)
                                        ? "currentColor"
                                        : "none"
                                    }
                                  />
                                </button>
                                <span className="font-semibold">
                                  {upvoteCount} upvotes
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
