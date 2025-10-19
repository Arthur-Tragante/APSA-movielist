import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks';
import { Modal } from '../../components';
import { MENSAGENS_SUCESSO } from '../../constants';
import './Login.css';

/**
 * Página de Login com registro e recuperação de senha
 */
const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nomeRegistro, setNomeRegistro] = useState('');
  const [emailRegistro, setEmailRegistro] = useState('');
  const [senhaRegistro, setSenhaRegistro] = useState('');
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const [exibirFormularioRecuperacao, setExibirFormularioRecuperacao] = useState(false);
  const [exibirFormularioRegistro, setExibirFormularioRegistro] = useState(false);
  const [exibirModal, setExibirModal] = useState(false);
  const [mensagemModal, setMensagemModal] = useState('');
  const [tipoModal, setTipoModal] = useState<'sucesso' | 'erro' | 'informacao'>('informacao');

  const { entrar, registrar, recuperarSenha, estaAutenticado, carregando, erro } = useAuth();

  useEffect(() => {
    if (estaAutenticado()) {
      window.location.href = '/lista';
    }
  }, [estaAutenticado]);

  useEffect(() => {
    if (erro) {
      setMensagemModal(erro);
      setTipoModal('erro');
      setExibirModal(true);
    }
  }, [erro]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await entrar({ email, senha });
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    const sucesso = await registrar({
      nome: nomeRegistro,
      email: emailRegistro,
      senha: senhaRegistro,
    });
    
    if (sucesso) {
      limparFormularios();
    }
  };

  const handleRecuperacao = async (e: React.FormEvent) => {
    e.preventDefault();
    const sucesso = await recuperarSenha(emailRecuperacao);
    
    if (sucesso) {
      setMensagemModal(MENSAGENS_SUCESSO.RECUPERACAO_SENHA_ENVIADA);
      setTipoModal('sucesso');
      setExibirModal(true);
      setExibirFormularioRecuperacao(false);
      setEmailRecuperacao('');
    }
  };

  const limparFormularios = () => {
    setEmail('');
    setSenha('');
    setNomeRegistro('');
    setEmailRegistro('');
    setSenhaRegistro('');
    setEmailRecuperacao('');
  };

  const handleFecharModal = () => {
    setExibirModal(false);
  };

  return (
    <div className="login-pagina">
      <div className="login-container">
        <h1 className="login-titulo">Moicanos Toolkit</h1>
        <p className="login-subtitulo">Gerenciador de Filmes</p>

        {/* Formulário de Login */}
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-grupo">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              required
              disabled={carregando}
            />
          </div>

          <div className="form-grupo">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              required
              disabled={carregando}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Link de Recuperação de Senha */}
        <p
          className="link-texto"
          onClick={() => setExibirFormularioRecuperacao(!exibirFormularioRecuperacao)}
        >
          Esqueceu a senha?
        </p>

        {exibirFormularioRecuperacao && (
          <form onSubmit={handleRecuperacao} className="form-secundario">
            <div className="form-grupo">
              <label htmlFor="emailRecuperacao">Email de Recuperação</label>
              <input
                id="emailRecuperacao"
                type="email"
                value={emailRecuperacao}
                onChange={(e) => setEmailRecuperacao(e.target.value)}
                placeholder="Digite seu email"
                required
                disabled={carregando}
              />
            </div>
            <button type="submit" className="btn-secondary" disabled={carregando}>
              {carregando ? 'Enviando...' : 'Enviar Email de Recuperação'}
            </button>
          </form>
        )}

        {/* Link de Registro */}
        <p
          className="link-texto"
          onClick={() => setExibirFormularioRegistro(!exibirFormularioRegistro)}
        >
          Não tem conta? Registre-se
        </p>

        {exibirFormularioRegistro && (
          <form onSubmit={handleRegistro} className="form-secundario">
            <div className="form-grupo">
              <label htmlFor="nomeRegistro">Nome</label>
              <input
                id="nomeRegistro"
                type="text"
                value={nomeRegistro}
                onChange={(e) => setNomeRegistro(e.target.value)}
                placeholder="Digite seu nome"
                required
                disabled={carregando}
              />
            </div>

            <div className="form-grupo">
              <label htmlFor="emailRegistro">Email</label>
              <input
                id="emailRegistro"
                type="email"
                value={emailRegistro}
                onChange={(e) => setEmailRegistro(e.target.value)}
                placeholder="Digite seu email"
                required
                disabled={carregando}
              />
            </div>

            <div className="form-grupo">
              <label htmlFor="senhaRegistro">Senha</label>
              <input
                id="senhaRegistro"
                type="password"
                value={senhaRegistro}
                onChange={(e) => setSenhaRegistro(e.target.value)}
                placeholder="Digite sua senha"
                required
                disabled={carregando}
              />
            </div>

            <button type="submit" className="btn-secondary" disabled={carregando}>
              {carregando ? 'Registrando...' : 'Cadastrar'}
            </button>
          </form>
        )}
      </div>

      <Modal
        exibir={exibirModal}
        mensagem={mensagemModal}
        aoFechar={handleFecharModal}
        tipo={tipoModal}
      />
    </div>
  );
};

export default Login;

