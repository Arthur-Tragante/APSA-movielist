/**
 * Repository de séries - gerencia interação com Firestore
 */

import { firestore } from '../config/firebase.config';
import { ShowCadastro, Show, ShowEdicao } from '../types';
import { showFirestoreParaApp, showAppParaFirestore } from '../utils/mappers.util';

const COLLECTION = 'shows';

/**
 * Cria uma nova série
 */
export const criar = async (show: ShowCadastro): Promise<string> => {
  const showFirestore = showAppParaFirestore(show);
  
  const docRef = await firestore.collection(COLLECTION).add({
    ...showFirestore,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return docRef.id;
};

/**
 * Busca todas as séries
 */
export const buscarTodos = async (): Promise<Show[]> => {
  const snapshot = await firestore.collection(COLLECTION).get();

  return snapshot.docs.map((doc) =>
    showFirestoreParaApp({ id: doc.id, ...doc.data() })
  );
};

/**
 * Busca série por ID
 */
export const buscarPorId = async (id: string): Promise<Show | null> => {
  const doc = await firestore.collection(COLLECTION).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return showFirestoreParaApp({ id: doc.id, ...doc.data() });
};

/**
 * Atualiza série existente
 */
export const atualizar = async (id: string, show: Partial<ShowEdicao>): Promise<void> => {
  const showFirestore = showAppParaFirestore(show as ShowCadastro);
  
  await firestore.collection(COLLECTION).doc(id).update({
    ...showFirestore,
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Deleta série
 */
export const deletar = async (id: string): Promise<void> => {
  await firestore.collection(COLLECTION).doc(id).delete();
};

export default {
  criar,
  buscarTodos,
  buscarPorId,
  atualizar,
  deletar,
};

