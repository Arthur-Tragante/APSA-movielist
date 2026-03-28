import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Modal } from '../../components';
import { authService } from '../../services';
import '../Login/Login.css';

const RedefinirSenha: React.FC = () => {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [exibirModal, setExibirModal] = useState(false);
  const [mensagemModal, setMensagemModal] = useState('');
  const [tipoModal, setTipoModal] = useState<'sucesso' | 'erro' | 'informacao'>('informacao');

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (novaSenha !== confirmarSenha) {
      setMensagemModal('As senhas não coincidem.');
      setTipoModal('erro');
      setExibirModal(true);
      return;
    }

    if (novaSenha.length < 6) {
      setMensagemModal('A senha deve ter pelo menos 6 caracteres.');
      setTipoModal('erro');
      setExibirModal(true);
      return;
    }

    setCarregando(true);
    try {
      await authService.redefinirSenha(token, novaSenha);
      setMensagemModal('Senha redefinida com sucesso! Você já pode fazer login.');
      setTipoModal('sucesso');
      setExibirModal(true);
    } catch {
      setMensagemModal('Token inválido ou expirado. Solicite um novo email de recuperação.');
      setTipoModal('erro');
      setExibirModal(true);
    } finally {
      setCarregando(false);
    }
  };

  const handleFecharModal = () => {
    setExibirModal(false);
    if (tipoModal === 'sucesso') {
      navigate('/');
    }
  };

  if (!token) {
    return (
      <div className="login-pagina">
        <div className="login-container">
          <h1 className="login-titulo">Our Horror Story</h1>
          <p style={{ color: '#e50914', textAlign: 'center' }}>Link inválido. Solicite um novo email de recuperação.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Voltar ao Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-pagina">
      <div className="login-container">
        <h1 className="login-titulo">Our Horror Story</h1>
        <p className="login-subtitulo">Redefinir senha</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-grupo">
            <label htmlFor="novaSenha">Nova senha</label>
            <input
              id="novaSenha"
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Digite a nova senha"
              required
              disabled={carregando}
            />
          </div>

          <div className="form-grupo">
            <label htmlFor="confirmarSenha">Confirmar senha</label>
            <input
              id="confirmarSenha"
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Confirme a nova senha"
              required
              disabled={carregando}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={carregando}>
            {carregando ? 'Salvando...' : 'Redefinir senha'}
          </button>
        </form>
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

export default RedefinirSenha;
