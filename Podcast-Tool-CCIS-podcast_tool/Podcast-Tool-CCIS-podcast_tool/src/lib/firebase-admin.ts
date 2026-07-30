import * as admin from 'firebase-admin';

// Accept both ADMIN_FIREBASE_* and FIREBASE_* naming conventions
const projectId = process.env.ADMIN_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.ADMIN_FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
const rawPrivateKey = process.env.ADMIN_FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;
const storageBucket = process.env.ADMIN_FIREBASE_STORAGE_BUCKET
  || process.env.FIREBASE_STORAGE_BUCKET
  || (projectId ? `${projectId}.firebasestorage.app` : undefined);

if (!admin.apps.length) {
  try {
    if (projectId && clientEmail && rawPrivateKey) {
      let privateKey = rawPrivateKey.replace(/\\n/g, '\n');
      // If the key is wrapped in quotes, remove them
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
      }
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket,
      });
      console.log(`Firebase Admin initialized successfully (project: ${projectId}, bucket: ${storageBucket})`);
    } else {
      console.warn(
        'Firebase Admin: Missing credentials. Required env vars: ' +
        'ADMIN_FIREBASE_PROJECT_ID (or FIREBASE_PROJECT_ID), ' +
        'ADMIN_FIREBASE_CLIENT_EMAIL (or FIREBASE_CLIENT_EMAIL), ' +
        'ADMIN_FIREBASE_PRIVATE_KEY (or FIREBASE_PRIVATE_KEY). ' +
        'Falling back to default application credentials.'
      );
      admin.initializeApp();
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

// Provide a dummy mock if not initialized to prevent Next.js build crashes during module collection
const db = admin.apps.length > 0 ? admin.firestore() : ({} as admin.firestore.Firestore);
const storage = admin.apps.length > 0 ? admin.storage() : ({} as admin.storage.Storage);
export { db, storage };
