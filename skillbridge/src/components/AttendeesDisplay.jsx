import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export default function AttendeesDisplay({ sessionId, sessionDate }) {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Determine if session is upcoming
  const isUpcoming = sessionDate
    ? (sessionDate.toDate ? sessionDate.toDate() : new Date(sessionDate)) >=
      new Date()
    : true;

  const displayTerm = isUpcoming ? "participants" : "attendee";
  const displayTermPlural = isUpcoming ? "participants" : "attendees";

  useEffect(() => {
    const q = query(
      collection(db, "registrations"),
      where("sessionId", "==", sessionId)
    );

    const unsub = onSnapshot(
      q,
      async (snap) => {
        const registrations = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Fetch user data for each attendee
        const attendeesWithNames = await Promise.all(
          registrations.map(async (reg) => {
            try {
              // First, try to use the name stored in the registration
              if (
                reg.attendeeName &&
                reg.attendeeName !== `User ${reg.attendeeId.slice(0, 8)}`
              ) {
                return {
                  ...reg,
                  attendeeName: reg.attendeeName,
                  userData: null,
                };
              }

              // If no name in registration, try to fetch from users collection
              const userDoc = await getDoc(doc(db, "users", reg.attendeeId));
              const userData = userDoc.exists() ? userDoc.data() : null;

              return {
                ...reg,
                attendeeName:
                  userData?.displayName ||
                  userData?.email ||
                  reg.attendeeEmail ||
                  `User ${reg.attendeeId.slice(0, 8)}`,
                userData: userData,
              };
            } catch (error) {
              console.error(
                "Error fetching user data for attendee:",
                reg.attendeeId,
                error
              );
              return {
                ...reg,
                attendeeName:
                  reg.attendeeName ||
                  reg.attendeeEmail ||
                  `User ${reg.attendeeId.slice(0, 8)}`,
                userData: null,
              };
            }
          })
        );

        setAttendees(attendeesWithNames);
        setLoading(false);
      },
      (err) => {
        console.error("attendees snapshot error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="mt-6">
        <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 rounded-xl animate-pulse">
          <div className="flex items-center justify-center w-8 h-8 bg-gray-300 rounded-lg">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="h-4 bg-gray-300 rounded w-32"></div>
            <div className="h-3 bg-gray-300 rounded w-24"></div>
          </div>
          <div className="ml-auto">
            <div className="w-12 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (attendees.length === 0) {
    return (
      <div className="mt-6">
        <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-500 rounded-xl border-2 border-dashed border-gray-300">
          <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-lg">
            <svg
              className="w-4 h-4 text-gray-400"
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
          <div className="flex flex-col">
            <span className="font-medium text-sm">
              No {displayTermPlural} yet
            </span>
            <span className="text-xs text-gray-400">
              {isUpcoming
                ? "Be the first to register for this session!"
                : "No one has attended this session yet."}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Simple Attendees Button */}
      <button
        onClick={() => setShowModal(!showModal)}
        className="text-sm px-4 py-2 rounded-md font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 whitespace-nowrap"
      >
        View{" "}
        {displayTermPlural.charAt(0).toUpperCase() + displayTermPlural.slice(1)}{" "}
        ({attendees.length})
      </button>

      {/* Simple Attendees Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] shadow-xl border border-gray-200 overflow-hidden flex flex-col">
            {/* Simple Header */}
            <div className="bg-blue-500 p-4 text-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">
                  Session{" "}
                  {displayTermPlural.charAt(0).toUpperCase() +
                    displayTermPlural.slice(1)}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Simple Attendees Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {attendees.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total {isUpcoming ? "Participants" : "Attendees"}
                  </div>
                </div>
              </div>

              {/* Simple Attendees List */}
              <h4 className="text-lg font-semibold mb-4">
                {isUpcoming
                  ? "Registered Participants"
                  : "Attended Participants"}
              </h4>
              <div className="space-y-3">
                {attendees.map((attendee, index) => (
                  <div
                    key={attendee.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {attendee.attendeeName?.charAt(0)?.toUpperCase() ||
                            "?"}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {attendee.attendeeName}
                        </div>
                        {attendee.attendeeEmail &&
                          attendee.attendeeEmail !== attendee.attendeeName && (
                            <div className="text-xs text-gray-500">
                              {attendee.attendeeEmail}
                            </div>
                          )}
                        {attendee.createdAt && (
                          <div className="text-xs text-gray-500">
                            {isUpcoming ? "Registered" : "Attended"} on{" "}
                            {attendee.createdAt.toDate
                              ? attendee.createdAt.toDate().toLocaleDateString()
                              : "Unknown date"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
