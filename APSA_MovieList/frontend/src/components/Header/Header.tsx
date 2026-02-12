import React, { useState } from 'react';
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
  const [menuAberto, setMenuAberto] = useState(false);

  const handleNavegar = (rota: string) => {
    navigate(rota);
    setMenuAberto(false); // Fecha o menu após navegar
  };

  const handleSair = async () => {
    await sair();
  };

  const toggleMenu = () => {
    setMenuAberto(!menuAberto);
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-logo" onClick={() => handleNavegar('/lista')}>
          <h1>Our Horror Story</h1>
        </div>

        {/* Menu Desktop */}
        <nav className="header-nav header-nav-desktop">
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
          <button
            className="btn-nav"
            onClick={() => handleNavegar('/series')}
          >
            Séries
          </button>
          <button
            className="btn-nav"
            onClick={() => handleNavegar('/series/adicionar')}
          >
            Adicionar Série
          </button>
          <button
            className="btn-nav"
            onClick={() => handleNavegar('/sorteio')}
          >
            Sorteio
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

        {/* Botão Hambúrguer Mobile */}
        <button 
          className={`header-hamburger ${menuAberto ? 'aberto' : ''}`}
          onClick={toggleMenu}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Menu Mobile */}
      {menuAberto && (
        <nav className="header-nav-mobile">
          <button
            className="btn-nav-mobile"
            onClick={() => handleNavegar('/lista')}
          >
            Filmes
          </button>
          <button
            className="btn-nav-mobile"
            onClick={() => handleNavegar('/adicionar')}
          >
            Adicionar Filme
          </button>
          <button
            className="btn-nav-mobile"
            onClick={() => handleNavegar('/series')}
          >
            Séries
          </button>
          <button
            className="btn-nav-mobile"
            onClick={() => handleNavegar('/series/adicionar')}
          >
            Adicionar Série
          </button>
          <button
            className="btn-nav-mobile"
            onClick={() => handleNavegar('/sorteio')}
          >
            Sorteio
          </button>
        </nav>
      )}
    </header>
  );
};

export default Header;

