import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import './Header.css';

/**
 * Componente de cabeçalho da aplicação
 */
const Header: React.FC = () => {
  const navigate = useNavigate();
  const { sair, obterUsuarioLogado } = useAuth();
  const usuario = obterUsuarioLogado();

  const handleNavegar = (rota: string) => {
    navigate(rota);
  };

  const handleSair = async () => {
    await sair();
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-logo" onClick={() => handleNavegar('/lista')}>
          <h1>Moicanos Toolkit</h1>
        </div>

        <nav className="header-nav">
          <button
            className="btn-nav"
            onClick={() => handleNavegar('/lista')}
          >
            Filmes
          </button>
          <button
            className="btn-nav"
            onClick={() => handleNavegar('/adicionar')}
          >
            Adicionar Filme
          </button>
        </nav>

        <div className="header-usuario">
          {usuario && (
            <span className="nome-usuario">Olá, {usuario.nome}</span>
          )}
          <button className="btn-sair" onClick={handleSair}>
            Sair
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

