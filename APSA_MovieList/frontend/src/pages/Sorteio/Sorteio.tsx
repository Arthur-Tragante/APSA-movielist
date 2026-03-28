import React, { useState, useEffect } from 'react';
import { Header, Modal, Carregando } from '../../components';
import { useAuth } from '../../hooks';
import './Sorteio.css';
import sorteioRepository from '../../repositories/sorteio.repository';
import websocketService from '../../services/websocket.service';

interface FilmeSorteio {
  id: string;
  titulo: string;
  usuario: string;
  email: string;
}

interface ResultadoSorteio {
  allPicks: string[];
  winner: string;
}

/**
 * Página de sorteio de filmes
 * Cada usuário pode adicionar um filme e depois sortear
 */
const Sorteio: React.FC = () => {
  const { obterUsuarioLogado } = useAuth();
  const usuario = obterUsuarioLogado();
  
  const [tituloFilme, setTituloFilme] = useState('');
  const [filmesSorteio, setFilmesSorteio] = useState<FilmeSorteio[]>([]);
  const [resultado, setResultado] = useState<ResultadoSorteio | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [exibirModal, setExibirModal] = useState(false);
  const [mensagemModal, setMensagemModal] = useState('');
  const [tipoModal, setTipoModal] = useState<'sucesso' | 'erro' | 'informacao'>('informacao');

  useEffect(() => {
    if (!usuario) return;

    // Conecta ao WebSocket
    websocketService.connect();

    // Handlers para eventos WebSocket
    const handleEstadoInicial = (estado: any) => {
      setFilmesSorteio(estado.filmes);
      setResultado(estado.resultado);
      setCarregando(false);
    };

    const handleFilmeAdicionado = (filme: FilmeSorteio) => {
      setFilmesSorteio(prev => [...prev, filme]);
    };

    const handleFilmeRemovido = (data: { id: string }) => {
      setFilmesSorteio(prev => prev.filter(f => f.id !== data.id));
    };

    const handleResultado = (res: ResultadoSorteio) => {
      setResultado(res);
    };

    const handleResultadoLimpo = () => {
      setResultado(null);
    };

    const handleFilmesLimpos = () => {
      setFilmesSorteio([]);
    };

    // Registra listeners
    websocketService.onEstadoInicial(handleEstadoInicial);
    websocketService.onFilmeAdicionado(handleFilmeAdicionado);
    websocketService.onFilmeRemovido(handleFilmeRemovido);
    websocketService.onResultado(handleResultado);
    websocketService.onResultadoLimpo(handleResultadoLimpo);
    websocketService.onFilmesLimpos(handleFilmesLimpos);

    // Solicita estado inicial
    websocketService.obterEstadoSorteio();

    // Cleanup: apenas remove listeners, mantém conexão ativa
    return () => {
      websocketService.removeAllListeners();
    };
  }, [usuario]);

  const usuarioJaAdicionou = (): boolean => {
    return filmesSorteio.some(
      (filme) => filme.email === usuario?.email || filme.usuario === usuario?.nome
    );
  };

  const handleAdicionarFilme = async () => {
    if (!tituloFilme.trim()) {
      setMensagemModal('Digite o título do filme');
      setTipoModal('erro');
      setExibirModal(true);
      return;
    }

    if (!usuario) {
      setMensagemModal('Usuário não autenticado');
      setTipoModal('erro');
      setExibirModal(true);
      return;
    }

    if (usuarioJaAdicionou()) {
      setMensagemModal('Você já adicionou um filme ao sorteio');
      setTipoModal('informacao');
      setExibirModal(true);
      return;
    }

    try {
      setCarregando(true);
      await sorteioRepository.adicionarFilme(tituloFilme.trim());

      setTituloFilme('');
      setMensagemModal('Filme adicionado com sucesso!');
      setTipoModal('sucesso');
      setExibirModal(true);
    } catch (erro: any) {
      console.error('Erro ao adicionar filme:', erro);
      setMensagemModal(erro.response?.data?.mensagem || `Erro ao adicionar filme: ${erro.message}`);
      setTipoModal('erro');
      setExibirModal(true);
    } finally {
      setCarregando(false);
    }
  };

  const handleRemoverFilme = async (id: string) => {
    try {
      setCarregando(true);
      await sorteioRepository.removerFilme(id);
      
      setMensagemModal('Filme removido com sucesso!');
      setTipoModal('sucesso');
      setExibirModal(true);
    } catch (erro: any) {
      console.error('Erro ao remover filme:', erro);
      setMensagemModal(`Erro ao remover filme: ${erro.message}`);
      setTipoModal('erro');
      setExibirModal(true);
    } finally {
      setCarregando(false);
    }
  };

  const handleSortear = async () => {
    setCarregando(true);
    setMensagemModal('');
    setTipoModal('informacao');
    setExibirModal(false);

    try {
      const resultado = await sorteioRepository.sortear(
        import.meta.env.VITE_DISCORD_WEBHOOK_URL
      );

      setMensagemModal(`Filme sorteado: ${resultado.vencedor}`);
      setTipoModal('sucesso');
      setExibirModal(true);
    } catch (erro: any) {
      console.error('Erro ao sortear:', erro);
      setMensagemModal(erro.response?.data?.mensagem || erro.message || 'Erro ao sortear filme.');
      setTipoModal('erro');
      setExibirModal(true);
    } finally {
      setCarregando(false);
    }
  };

  const handleLimparResultado = async () => {
    try {
      setCarregando(true);
      await sorteioRepository.limparResultado();

      setMensagemModal('Resultado limpo com sucesso!');
      setTipoModal('sucesso');
      setExibirModal(true);
    } catch (erro: any) {
      console.error('Erro ao limpar resultado:', erro);
      setMensagemModal(`Erro ao limpar resultado: ${erro.message}`);
      setTipoModal('erro');
      setExibirModal(true);
    } finally {
      setCarregando(false);
    }
  };

  const fecharModal = () => {
    setExibirModal(false);
  };

  if (carregando && filmesSorteio.length === 0) {
    return (
      <>
        <Header />
        <Carregando mensagem="Carregando sorteio..." />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="sorteio-container">
        <div className="sorteio-content">
          <h1 className="sorteio-titulo">Sortear um Filme</h1>

          <div className="sorteio-input-section">
            <input
              type="text"
              className="sorteio-input"
              placeholder="Digite o título do filme..."
              value={tituloFilme}
              onChange={(e) => setTituloFilme(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdicionarFilme()}
              disabled={carregando || usuarioJaAdicionou()}
            />
            <button
              className="sorteio-btn-adicionar"
              onClick={handleAdicionarFilme}
              disabled={carregando || usuarioJaAdicionou()}
            >
              {carregando ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>

          {usuarioJaAdicionou() && (
            <p className="sorteio-aviso">Você já adicionou um filme ao sorteio</p>
          )}

          <div className="sorteio-secao">
            <h2>Filmes Participantes ({filmesSorteio.length})</h2>
            <div className="sorteio-lista">
              {filmesSorteio.length === 0 ? (
                <p className="sorteio-vazio">Nenhum filme adicionado ainda</p>
              ) : (
                filmesSorteio.map((filme) => (
                  <div key={filme.id} className="sorteio-item">
                    <div className="sorteio-item-info">
                      <span className="sorteio-item-titulo">{filme.titulo}</span>
                      <span className="sorteio-item-usuario">por {filme.usuario}</span>
                    </div>
                    {(filme.email === usuario?.email || filme.usuario === usuario?.nome) && (
                      <button
                        className="sorteio-btn-remover"
                        onClick={() => handleRemoverFilme(filme.id)}
                        disabled={carregando}
                      >
                        Remover
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {filmesSorteio.length > 0 && (
              <button
                className="sorteio-btn-sortear"
                onClick={handleSortear}
                disabled={carregando}
              >
                {carregando ? 'Sorteando...' : 'Sortear Filme'}
              </button>
            )}
          </div>

          {resultado && (
            <>
              <div className="sorteio-secao">
                <h2>Ordem de Sorteio</h2>
                <div className="sorteio-resultado-lista">
                  {resultado.allPicks.map((filme, index) => (
                    <div key={index} className="sorteio-resultado-item">
                      {index + 1}. {filme}
                    </div>
                  ))}
                </div>
              </div>

              <div className="sorteio-secao sorteio-vencedor-secao">
                <h2>Filme Sorteado</h2>
                <div className="sorteio-vencedor">
                  <span>{resultado.winner}</span>
                </div>
              </div>

              <button
                className="sorteio-btn-limpar"
                onClick={handleLimparResultado}
                disabled={carregando}
              >
                Limpar Resultado
              </button>
            </>
          )}
        </div>
      </div>

      {exibirModal && (
        <Modal
          exibir={exibirModal}
          mensagem={mensagemModal}
          tipo={tipoModal}
          aoFechar={fecharModal}
        />
      )}
    </>
  );
};

export default Sorteio;

