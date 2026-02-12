import { UsuarioModel } from '../models';
import { Usuario } from '../types';
import { firestore } from '../config/firebase.config';
import { env } from '../config/env.config';

const COLECAO_USUARIOS = 'users';

/**
 * Repository para operações de usuários (MongoDB ou Firestore)
 */
class UsuarioRepository {

  /**
   * Busca usuário por ID
   */
  async buscarPorId(id: string): Promise<Usuario | null> {
    if (env.MONGODB_ENABLED) {
      const usuario = await UsuarioModel.findById(id).lean();
      if (!usuario) return null;
      return {
        id: usuario._id.toString(),
        nome: usuario.nome || usuario.name,
        email: usuario.email,
      } as Usuario;
    }

    if (!firestore) return null;
    const doc = await firestore.collection(COLECAO_USUARIOS).doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    return {
      id: doc.id,
      nome: data.nome || data.name || data.email?.split('@')[0],
      email: data.email,
    } as Usuario;
  }

  /**
   * Busca usuário por email
   */
  async buscarPorEmail(email: string): Promise<Usuario | null> {
    if (env.MONGODB_ENABLED) {
      const usuario = await UsuarioModel.findOne({ email }).lean();
      if (!usuario) return null;
      return {
        id: usuario._id.toString(),
        nome: usuario.nome || usuario.name,
        email: usuario.email,
      } as Usuario;
    }

    if (!firestore) return null;
    const snapshot = await firestore.collection(COLECAO_USUARIOS)
      .where('email', '==', email)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      nome: data.nome || data.name || email.split('@')[0],
      email: data.email,
    } as Usuario;
  }

  /**
   * Cria um novo usuário
   */
  async criar(uid: string, nome: string, email: string): Promise<void> {
    if (env.MONGODB_ENABLED) {
      const novoUsuario = new UsuarioModel({ _id: uid, nome, email });
      await novoUsuario.save();
      return;
    }

    if (!firestore) throw new Error('Firestore não disponível');
    await firestore.collection(COLECAO_USUARIOS).doc(uid).set({ nome, name: nome, email });
  }

  /**
   * Atualiza um usuário existente
   */
  async atualizar(id: string, dados: Partial<Omit<Usuario, 'id' | 'criadoEm'>>): Promise<void> {
    if (env.MONGODB_ENABLED) {
      await UsuarioModel.findByIdAndUpdate(id, dados);
      return;
    }

    if (!firestore) throw new Error('Firestore não disponível');
    await firestore.collection(COLECAO_USUARIOS).doc(id).update(dados);
  }

  /**
   * Verifica se usuário existe
   */
  async existe(email: string): Promise<boolean> {
    const usuario = await this.buscarPorEmail(email);
    return usuario !== null;
  }
}

export default new UsuarioRepository();

