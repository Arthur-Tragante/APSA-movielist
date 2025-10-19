import axios from 'axios';
import { auth } from '../config/firebase.config';

/**
 * Cliente HTTP para comunicação com o backend
 */

// URL do backend (produção ou desenvolvimento)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Bypass ngrok warning page
  },
  timeout: 30000, // 30 segundos
});

/**
 * Interceptor para adicionar token de autenticação
 */
apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Erro ao obter token:', error);
      }
    }
    
    return config;
  },
  (error) => {
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

