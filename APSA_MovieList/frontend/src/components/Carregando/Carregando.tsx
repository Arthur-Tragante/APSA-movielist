import React from 'react';
import './Carregando.css';

interface CarregandoProps {
  mensagem?: string;
}

/**
 * Componente de loading
 */
const Carregando: React.FC<CarregandoProps> = ({
  mensagem = 'Carregando...',
}) => {
  return (
    <div className="carregando-container">
      <div className="spinner"></div>
      <p className="carregando-texto">{mensagem}</p>
    </div>
  );
};

export default Carregando;

