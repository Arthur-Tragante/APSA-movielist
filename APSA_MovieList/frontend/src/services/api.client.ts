import axios from 'axios';
import Cookies from 'js-cookie';
import { COOKIES } from '../constants';

/**
 * Cliente HTTP para comunicação com o backend
 */

// URL do backend (produção ou desenvolvimento)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 30000,
});

/**
 * Interceptor para adicionar Authorization header (JWT)
 */
apiClient.interceptors.request.use(
  async (config) => {
    const token = Cookies.get(COOKIES.TOKEN);
    if (token && token !== '' && !token.startsWith('mock-token-')) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Fallback legado: envia email via header para compatibilidade
    const userEmail = Cookies.get(COOKIES.EMAIL) || import.meta.env.VITE_USER_EMAIL;
    if (userEmail) {
      config.headers['X-User-Email'] = userEmail;
    }

    return config;
  },
  (error) => {
    console.error('Erro ao preparar requisição:', error);
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
      const status = error.response.status;
      const mensagem = error.response.data?.erro || 'Erro ao comunicar com o servidor';

      // Token expirado ou inválido - redireciona para login
      if (status === 401) {
        Cookies.remove(COOKIES.TOKEN);
        Cookies.remove(COOKIES.EMAIL);
        Cookies.remove(COOKIES.NOME);
        window.location.href = '/login';
        return Promise.reject(new Error('Sessão expirada. Faça login novamente.'));
      }

      console.error('Erro na API:', mensagem);
      throw new Error(mensagem);
    } else if (error.request) {
      console.error('Erro de rede:', error.message);
      throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
    } else {
      console.error('Erro:', error.message);
      throw new Error('Ocorreu um erro inesperado.');
    }
  }
);

export default apiClient;
