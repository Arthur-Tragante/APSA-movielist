import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  UserCredential,
} from 'firebase/auth';
import Cookies from 'js-cookie';
import { auth } from '../config/firebase.config';
import { usuarioRepository } from '../repositories';
import { COOKIES, VALIDADE_COOKIE_DIAS } from '../constants';
import { DadosLogin, DadosRegistro, Usuario } from '../types';

/**
 * Service para lógica de negócio relacionada à autenticação
 */
class AuthService {
  /**
   * Realiza login com email e senha
   */
  async entrar(dados: DadosLogin): Promise<string> {
    const { email, senha } = dados;
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      senha
    );
    
    const token = await userCredential.user.getIdToken();
    
    // Salva token e email nos cookies
    Cookies.set(COOKIES.TOKEN, token, { expires: VALIDADE_COOKIE_DIAS });
    Cookies.set(COOKIES.EMAIL, email, { expires: VALIDADE_COOKIE_DIAS });
    
    // Busca e salva o nome do usuário
    try {
      const usuario = await usuarioRepository.buscarPorEmail(email);
      console.log('👤 Usuário do Firestore:', usuario);
      
      if (usuario && usuario.nome) {
        Cookies.set(COOKIES.NOME, usuario.nome, { expires: VALIDADE_COOKIE_DIAS });
        console.log('✅ Nome salvo nos cookies:', usuario.nome);
      } else {
        // Fallback: usa parte do email como nome
        const nomeFallback = email.split('@')[0];
        Cookies.set(COOKIES.NOME, nomeFallback, { expires: VALIDADE_COOKIE_DIAS });
        console.warn('⚠️ Nome não encontrado, usando fallback:', nomeFallback);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar usuário:', error);
      // Fallback: usa parte do email como nome
      const nomeFallback = email.split('@')[0];
      Cookies.set(COOKIES.NOME, nomeFallback, { expires: VALIDADE_COOKIE_DIAS });
    }
    
    return token;
  }

  /**
   * Registra um novo usuário
   */
  async registrar(dados: DadosRegistro): Promise<string> {
    const { nome, email, senha } = dados;
    
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      senha
    );
    
    const token = await userCredential.user.getIdToken();
    
    // Salva dados nos cookies
    Cookies.set(COOKIES.TOKEN, token, { expires: VALIDADE_COOKIE_DIAS });
    Cookies.set(COOKIES.EMAIL, email, { expires: VALIDADE_COOKIE_DIAS });
    Cookies.set(COOKIES.NOME, nome, { expires: VALIDADE_COOKIE_DIAS });
    
    // Cria usuário no Firestore
    await usuarioRepository.criar({ nome, email });
    
    return token;
  }

  /**
   * Envia email de recuperação de senha
   */
  async recuperarSenha(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  /**
   * Realiza logout
   */
  async sair(): Promise<void> {
    await firebaseSignOut(auth);
    
    // Remove cookies
    Cookies.remove(COOKIES.TOKEN);
    Cookies.remove(COOKIES.EMAIL);
    Cookies.remove(COOKIES.NOME);
  }

  /**
   * Verifica se o usuário está autenticado
   */
  estaAutenticado(): boolean {
    return !!Cookies.get(COOKIES.TOKEN);
  }

  /**
   * Obtém dados do usuário logado dos cookies
   */
  obterUsuarioLogado(): Usuario | null {
    const email = Cookies.get(COOKIES.EMAIL);
    const nome = Cookies.get(COOKIES.NOME);
    
    console.log('🍪 Cookies - Email:', email, 'Nome:', nome);
    
    if (email) {
      return { 
        email, 
        nome: nome || email.split('@')[0] 
      };
    }
    
    return null;
  }
}

export default new AuthService();

