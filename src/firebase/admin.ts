// Firebase Admin initialization (Node.js environment)
// Place your serviceAccountKey.json file in the same directory.
import admin from 'firebase-admin';
import path from 'path';

// Initialize only once
if (!admin.apps.length) {
  const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
}

export const adminAuth = admin.auth();
export default admin;
