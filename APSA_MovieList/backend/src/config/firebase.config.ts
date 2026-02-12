import admin from 'firebase-admin';

/**
 * Configuração do Firebase Admin SDK (legado)
 * O sistema migrou para MongoDB + autenticação simplificada.
 * Este arquivo é mantido apenas para referência futura.
 */
const initializeFirebase = (): admin.app.App | null => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    // Firebase não é mais obrigatório — sistema usa MongoDB
    return null;
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  } catch {
    return null;
  }
};

export const firebaseApp = initializeFirebase();
export const firestore = firebaseApp ? admin.firestore() : null;
export const realtimeDb = firebaseApp ? admin.database() : null;
export const auth = firebaseApp ? admin.auth() : null;

export default firebaseApp;

