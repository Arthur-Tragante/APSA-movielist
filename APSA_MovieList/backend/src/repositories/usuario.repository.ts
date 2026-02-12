import { UsuarioModel } from '../models';
import { Usuario } from '../types';

/**
 * Repository para operações de usuários no MongoDB
 */
class UsuarioRepository {

  /**
   * Busca usuário por ID
   */
  async buscarPorId(id: string): Promise<Usuario | null> {
    const usuario = await UsuarioModel.findById(id).lean();

    if (!usuario) {
      return null;
    }

    return {
      id: usuario._id.toString(),
      nome: usuario.nome || usuario.name,
      email: usuario.email,
    } as Usuario;
  }

  /**
   * Busca usuário por email
   */
  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const usuario = await UsuarioModel.findOne({ email }).lean();

    if (!usuario) {
      return null;
    }

    return {
      id: usuario._id.toString(),
      nome: usuario.nome || usuario.name,
      email: usuario.email,
    } as Usuario;
  }

  /**
   * Cria um novo usuário
   */
  async criar(uid: string, nome: string, email: string): Promise<void> {
    const novoUsuario = new UsuarioModel({
      _id: uid,
      nome,
      email,
    });
    
    await novoUsuario.save();
  }

  /**
   * Atualiza um usuário existente
   */
  async atualizar(id: string, dados: Partial<Omit<Usuario, 'id' | 'criadoEm'>>): Promise<void> {
    await UsuarioModel.findByIdAndUpdate(id, dados);
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

