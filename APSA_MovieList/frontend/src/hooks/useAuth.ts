import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';
import { DadosLogin, DadosRegistro } from '../types';
import { MENSAGENS_ERRO, MENSAGENS_SUCESSO } from '../constants';

/**
 * Hook customizado para autenticação
 */
export const useAuth = () => {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const navigate = useNavigate();

  const entrar = async (dados: DadosLogin): Promise<boolean> => {
    setCarregando(true);
    setErro(null);

    try {
      await authService.entrar(dados);
      navigate('/lista');
      return true;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setErro(MENSAGENS_ERRO.LOGIN_FALHOU);
      return false;
    } finally {
      setCarregando(false);
    }
  };

  const registrar = async (dados: DadosRegistro): Promise<boolean> => {
    setCarregando(true);
    setErro(null);

    try {
      await authService.registrar(dados);
      navigate('/lista');
      return true;
    } catch (error) {
      console.error('Erro ao registrar:', error);
      setErro(MENSAGENS_ERRO.REGISTRO_FALHOU);
      return false;
    } finally {
      setCarregando(false);
    }
  };

  const recuperarSenha = async (email: string): Promise<boolean> => {
    setCarregando(true);
    setErro(null);

    try {
      await authService.recuperarSenha(email);
      return true;
    } catch (error) {
      console.error('Erro ao recuperar senha:', error);
      setErro(MENSAGENS_ERRO.RECUPERACAO_SENHA_FALHOU);
      return false;
    } finally {
      setCarregando(false);
    }
  };

  const sair = async (): Promise<void> => {
    setCarregando(true);
    try {
      await authService.sair();
      navigate('/');
    } catch (error) {
      console.error('Erro ao sair:', error);
    } finally {
      setCarregando(false);
    }
  };

  const estaAutenticado = (): boolean => {
    return authService.estaAutenticado();
  };

  const obterUsuarioLogado = () => {
    return authService.obterUsuarioLogado();
  };

  return {
    entrar,
    registrar,
    recuperarSenha,
    sair,
    estaAutenticado,
    obterUsuarioLogado,
    carregando,
    erro,
  };
};

