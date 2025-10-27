/**
 * Repository de séries - gerencia interação com Firestore
 */

import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { ShowCadastro, Show, ShowEdicao } from '../types';
import { showFirestoreParaApp, showAppParaFirestore } from '../utils/mappers.util';

const COLLECTION = 'shows';

/**
 * Cria uma nova série
 */
export const criar = async (show: ShowCadastro): Promise<string> => {
  const showFirestore = showAppParaFirestore(show);
  
  const docRef = await addDoc(collection(db, COLLECTION), {
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
  const snapshot = await getDocs(collection(db, COLLECTION));

  return snapshot.docs.map((docSnapshot) =>
    showFirestoreParaApp({ id: docSnapshot.id, ...docSnapshot.data() })
  );
};

/**
 * Busca série por ID
 */
export const buscarPorId = async (id: string): Promise<Show | null> => {
  const docRef = doc(db, COLLECTION, id);
  const docSnapshot = await getDoc(docRef);

  if (!docSnapshot.exists()) {
    return null;
  }

  return showFirestoreParaApp({ id: docSnapshot.id, ...docSnapshot.data() });
};

/**
 * Atualiza série existente
 */
export const atualizar = async (id: string, show: Partial<ShowEdicao>): Promise<void> => {
  const showFirestore = showAppParaFirestore(show as ShowCadastro);
  
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...showFirestore,
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Deleta série
 */
export const deletar = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
};

export default {
  criar,
  buscarTodos,
  buscarPorId,
  atualizar,
  deletar,
};

