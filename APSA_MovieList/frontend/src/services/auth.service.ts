import Cookies from 'js-cookie';
import { COOKIES, VALIDADE_COOKIE_DIAS } from '../constants';
import { DadosLogin, DadosRegistro, Usuario } from '../types';

/**
 * Service para autenticação simplificada (sem Firebase)
 */
class AuthService {
  /**
   * Realiza login com email e senha (simplificado)
   */
  async entrar(dados: DadosLogin): Promise<string> {
    const { email, senha } = dados;
    
    // TODO: Implementar validação real de senha
    // Por enquanto, aceita qualquer senha
    
    // Salva email nos cookies
    Cookies.set(COOKIES.EMAIL, email, { expires: VALIDADE_COOKIE_DIAS });
    
    // Usa parte do email como nome
    const nome = email.split('@')[0];
    Cookies.set(COOKIES.NOME, nome, { expires: VALIDADE_COOKIE_DIAS });
    
    // Token fictício
    const token = 'mock-token-' + Date.now();
    Cookies.set(COOKIES.TOKEN, token, { expires: VALIDADE_COOKIE_DIAS });
    
    return token;
  }

  /**
   * Registra um novo usuário (simplificado)
   */
  async registrar(dados: DadosRegistro): Promise<string> {
    const { nome, email } = dados;
    
    // Salva dados nos cookies
    Cookies.set(COOKIES.EMAIL, email, { expires: VALIDADE_COOKIE_DIAS });
    Cookies.set(COOKIES.NOME, nome, { expires: VALIDADE_COOKIE_DIAS });
    
    // Token fictício
    const token = 'mock-token-' + Date.now();
    Cookies.set(COOKIES.TOKEN, token, { expires: VALIDADE_COOKIE_DIAS });
    
    // TODO: Criar usuário no MongoDB via API
    
    return token;
  }

  /**
   * Envia email de recuperação de senha (desabilitado)
   */
  async recuperarSenha(email: string): Promise<void> {
    console.warn('Recuperação de senha não implementada');
    // TODO: Implementar recuperação de senha própria
  }

  /**
   * Realiza logout
   */
  async sair(): Promise<void> {
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

