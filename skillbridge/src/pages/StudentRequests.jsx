import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { BookOpen, Calendar, Users } from "lucide-react";

export default function StudentRequests() {
  const { currentUser } = useAuth();
  const [studentRequests, setStudentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch student requests
  useEffect(() => {
    const q = query(
      collection(db, "studentRequests"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setStudentRequests(arr);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching student requests:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading student requests...</p>
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
            All Student Requests
          </h1>
          <p className="text-gray-600">
            Browse all student topic requests, sorted by most recent
          </p>
        </div>

        {studentRequests.length === 0 ? (
          <div className="text-gray-500 p-8 bg-white rounded-xl shadow-sm text-center">
            No student requests yet.
          </div>
        ) : (
          <div className="space-y-4">
            {studentRequests.map((request, index) => (
              <div
                key={request.id}
                className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0">
                      <span className="text-blue-600 font-bold text-lg">
                        {index + 1}.
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <BookOpen className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-2">
                            {request.topic}
                          </h3>
                          {request.description && (
                            <p className="text-gray-700 text-sm leading-relaxed mb-3">
                              {request.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {request.preferredDate && (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>Preferred: {request.preferredDate}</span>
                              </div>
                            )}
                            {request.mergedCount && request.mergedCount > 1 && (
                              <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4" />
                                <span>
                                  {request.mergedCount} similar requests
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
