import Cookies from 'js-cookie';
import { COOKIES, VALIDADE_COOKIE_DIAS } from '../constants';
import { DadosLogin, DadosRegistro, Usuario } from '../types';
import apiClient from './api.client';

/**
 * Service para autenticação via JWT
 */
class AuthService {
  /**
   * Realiza login com email e senha
   */
  async entrar(dados: DadosLogin): Promise<string> {
    const { email, senha } = dados;

    const response = await apiClient.post('/auth/login', { email, senha });
    const { token, usuario } = response.data.dados;

    Cookies.set(COOKIES.TOKEN, token, { expires: VALIDADE_COOKIE_DIAS });
    Cookies.set(COOKIES.EMAIL, usuario.email, { expires: VALIDADE_COOKIE_DIAS });
    Cookies.set(COOKIES.NOME, usuario.nome, { expires: VALIDADE_COOKIE_DIAS });

    return token;
  }

  /**
   * Registra um novo usuário
   */
  async registrar(dados: DadosRegistro): Promise<string> {
    const { nome, email, senha } = dados;

    const response = await apiClient.post('/auth/registrar', { nome, email, senha });
    const { token, usuario } = response.data.dados;

    Cookies.set(COOKIES.TOKEN, token, { expires: VALIDADE_COOKIE_DIAS });
    Cookies.set(COOKIES.EMAIL, usuario.email, { expires: VALIDADE_COOKIE_DIAS });
    Cookies.set(COOKIES.NOME, usuario.nome, { expires: VALIDADE_COOKIE_DIAS });

    return token;
  }

  /**
   * Troca a senha do usuário
   */
  async trocarSenha(senhaAtual: string, novaSenha: string): Promise<void> {
    const email = Cookies.get(COOKIES.EMAIL);
    if (!email) throw new Error('Usuário não autenticado');

    await apiClient.post('/auth/trocar-senha', { email, senhaAtual, novaSenha });
  }

  /**
   * Solicita recuperação de senha (placeholder - não implementado no backend)
   */
  async recuperarSenha(email: string): Promise<void> {
    // TODO: Implementar endpoint de recuperação de senha no backend
    console.log('Solicitação de recuperação de senha para:', email);
    throw new Error('Funcionalidade de recuperação de senha não disponível no momento');
  }

  /**
   * Realiza logout
   */
  async sair(): Promise<void> {
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

    if (email) {
      return {
        email,
        nome: nome || email.split('@')[0],
      };
    }

    return null;
  }

  /**
   * Retorna o token JWT armazenado
   */
  obterToken(): string | undefined {
    return Cookies.get(COOKIES.TOKEN);
  }
}

export default new AuthService();
