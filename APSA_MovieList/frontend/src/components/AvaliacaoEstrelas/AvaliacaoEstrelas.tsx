import React, { useState, useRef } from 'react';
import './AvaliacaoEstrelas.css';

interface AvaliacaoEstrelasProps {
  nota: number;
  aoMudarNota: (nota: number) => void;
  somenteLeitura?: boolean;
}

/**
 * Componente de avaliação por estrelas (0-10 com meias estrelas)
 * Permite notas como 3.5, 7.5, etc
 */
const AvaliacaoEstrelas: React.FC<AvaliacaoEstrelasProps> = ({
  nota,
  aoMudarNota,
  somenteLeitura = false,
}) => {
  const [notaHover, setNotaHover] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLSpanElement>, estrelaPosicao: number) => {
    if (somenteLeitura) return;

    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const metadeEstrela = rect.width / 2;

    // Se clicou na metade esquerda, dá nota .5
    // Se clicou na metade direita, dá nota inteira
    const novaNota = clickX < metadeEstrela ? estrelaPosicao - 0.5 : estrelaPosicao;
    aoMudarNota(novaNota);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLSpanElement>, estrelaPosicao: number) => {
    if (somenteLeitura) return;

    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const metadeEstrela = rect.width / 2;

    const notaHoverCalc = mouseX < metadeEstrela ? estrelaPosicao - 0.5 : estrelaPosicao;
    setNotaHover(notaHoverCalc);
  };

  const handleMouseLeave = () => {
    setNotaHover(0);
  };

  const renderEstrela = (estrelaPosicao: number) => {
    const notaExibida = notaHover || nota;
    
    // Determina o tipo de preenchimento da estrela
    let tipoPreenchimento: 'vazia' | 'meia' | 'cheia' = 'vazia';
    
    if (notaExibida >= estrelaPosicao) {
      tipoPreenchimento = 'cheia';
    } else if (notaExibida >= estrelaPosicao - 0.5) {
      tipoPreenchimento = 'meia';
    }

    return (
      <span
        key={estrelaPosicao}
        className={`estrela ${tipoPreenchimento} ${
          somenteLeitura ? 'somente-leitura' : ''
        }`}
        onClick={(e) => handleClick(e, estrelaPosicao)}
        onMouseMove={(e) => handleMouseMove(e, estrelaPosicao)}
        onMouseLeave={handleMouseLeave}
      >
        {tipoPreenchimento === 'cheia' && '★'}
        {tipoPreenchimento === 'meia' && '⯨'}
        {tipoPreenchimento === 'vazia' && '☆'}
      </span>
    );
  };

  return (
    <div className="avaliacao-estrelas" ref={containerRef}>
      <div className="estrelas-container">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => renderEstrela(index))}
      </div>
      {nota > 0 && <span className="nota-texto">({nota}/10)</span>}
    </div>
  );
};

export default AvaliacaoEstrelas;

