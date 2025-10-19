import admin from 'firebase-admin';

/**
 * Configuração do Firebase Admin SDK
 */
const initializeFirebase = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    throw new Error('Credenciais do Firebase não configuradas corretamente no .env');
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
};

export const firebaseApp = initializeFirebase();
export const firestore = admin.firestore();
export const auth = admin.auth();

export default firebaseApp;

