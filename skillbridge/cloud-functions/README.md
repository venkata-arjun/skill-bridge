Secure promotion workflow (suggested)

1. Deploy the `promoteToSpeaker` Cloud Function (see promoteSpeaker.js). It requires Firebase Functions.

2. From the client, call the function via the Firebase Functions callable API instead of updating `users/{uid}` directly.

Example client call (firebase v9+):

import { getFunctions, httpsCallable } from 'firebase/functions';
const functions = getFunctions();
const promote = httpsCallable(functions, 'promoteToSpeaker');
await promote({ targetUid: 'the-user-uid' });

3. Update Firestore security rules to prevent direct writes to `users.role` unless performed by trusted admin or via the function.

Security rules example (pseudo):

match /users/{userId} {
allow update: if request.auth != null && (
// allow users to update their own profile except role/promotedBy/promotedAt
request.auth.uid == userId && !('role' in request.resource.data)
) || (
// allow server/admin to set role via functions only (use custom claims or Admin SDK)
request.auth.token.admin == true
);
}

Notes:

- This is an example. Deploying functions and changing rules requires project-level access.
- Using Cloud Functions keeps promotion auditable and secure.
