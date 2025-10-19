import React from 'react';
import './Modal.css';

interface ModalProps {
  exibir: boolean;
  mensagem: string;
  aoFechar: () => void;
  tipo?: 'sucesso' | 'erro' | 'informacao';
}

/**
 * Componente de Modal reutilizável
 */
const Modal: React.FC<ModalProps> = ({
  exibir,
  mensagem,
  aoFechar,
  tipo = 'informacao',
}) => {
  if (!exibir) return null;

  return (
    <div className="modal-overlay" onClick={aoFechar}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header modal-header-${tipo}`}>
          <h3>
            {tipo === 'sucesso' && '✓ Sucesso'}
            {tipo === 'erro' && '✕ Erro'}
            {tipo === 'informacao' && 'ℹ Informação'}
          </h3>
        </div>
        <div className="modal-body">
          <p>{mensagem}</p>
        </div>
        <div className="modal-footer">
          <button onClick={aoFechar} className="btn-modal">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;

