// Example Cloud Function (Node.js) to securely promote a user to 'speaker'.
// This is a template - deploy to Firebase Functions and secure with callable or admin SDK.

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Callable function - client must be authenticated and the caller should be verified as faculty
exports.promoteToSpeaker = functions.https.onCall(async (data, context) => {
  // context.auth contains the caller info
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be logged in"
    );
  }

  const callerUid = context.auth.uid;
  const targetUid = data.targetUid;

  if (!targetUid) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "targetUid is required"
    );
  }

  // Verify caller is faculty by reading their user doc
  const callerDoc = await admin.firestore().doc(`users/${callerUid}`).get();
  const callerData = callerDoc.data();
  if (!callerData || callerData.role !== "faculty") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only faculty can promote speakers"
    );
  }

  // Perform promotion with audit fields
  await admin.firestore().doc(`users/${targetUid}`).update({
    role: "speaker",
    promotedBy: callerUid,
    promotedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
});
