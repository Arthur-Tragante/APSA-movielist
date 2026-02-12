import axios from 'axios';
import Cookies from 'js-cookie';
import { COOKIES } from '../constants';

/**
 * Cliente HTTP para comunicação com o backend
 */

// URL do backend (produção ou desenvolvimento)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Retorna o email do usuário logado (cookie > env var > fallback)
 */
const getUserEmail = (): string => {
  return Cookies.get(COOKIES.EMAIL)
    || import.meta.env.VITE_USER_EMAIL
    || 'arthur.tragante@gmail.com';
};

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 30000, // 30 segundos
});

/**
 * Interceptor para adicionar headers customizados
 */
apiClient.interceptors.request.use(
  async (config) => {
    // Adiciona email do usuário logado em todas as requisições
    config.headers['X-User-Email'] = getUserEmail();
    return config;
  },
  (error) => {
    console.error('❌ Erro ao preparar requisição:', error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor para tratamento de erros
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Erro retornado pelo backend
      const mensagem = error.response.data?.erro || 'Erro ao comunicar com o servidor';
      console.error('Erro na API:', mensagem);
      throw new Error(mensagem);
    } else if (error.request) {
      // Erro de rede
      console.error('Erro de rede:', error.message);
      throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
    } else {
      // Erro desconhecido
      console.error('Erro:', error.message);
      throw new Error('Ocorreu um erro inesperado.');
    }
  }
);

export default apiClient;

