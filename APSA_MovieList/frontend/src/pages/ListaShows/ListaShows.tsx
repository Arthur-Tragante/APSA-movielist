import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Carregando } from '../../components';
import { useShows, useAuth } from '../../hooks';
import { Show } from '../../types';
import './ListaShows.css';

/**
 * Página de listagem de séries com filtros e ordenação
 */
const ListaShows: React.FC = () => {
  const navigate = useNavigate();
  const { shows, carregando } = useShows();
  const { obterUsuarioLogado } = useAuth();
  const usuario = obterUsuarioLogado();
  
  const [termoBusca, setTermoBusca] = useState('');
  const [navegando, setNavegando] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'todos' | 'assistidos' | 'nao-assistidos'>('todos');
  const [ordenacao, setOrdenacao] = useState<{
    campo: keyof Show | 'votos' | 'usuarioVotou' | null;
    direcao: 'asc' | 'desc';
  }>({ campo: null, direcao: 'asc' });

  const handleEditar = React.useCallback((id: string) => {
    if (navegando) return;
    
    setNavegando(true);
    try {
      navigate(`/series/editar/${id}`);
    } catch (error) {
      console.error('Erro ao navegar:', error);
      setNavegando(false);
    }
  }, [navigate, navegando]);

  const handleOrdenar = (campo: keyof Show | 'votos' | 'usuarioVotou') => {
    setOrdenacao((prev) => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc',
    }));
  };

  const showsOrdenados = React.useMemo(() => {
    if (!ordenacao.campo) return shows;

    return [...shows].sort((a, b) => {
      let comparacao = 0;

      if (ordenacao.campo === 'votos') {
        const votosA = a.avaliacoesUsuarios?.length || 0;
        const votosB = b.avaliacoesUsuarios?.length || 0;
        comparacao = votosA - votosB;
      } else if (ordenacao.campo === 'usuarioVotou') {
        const votouA = usuario && a.avaliacoesUsuarios?.some(
          (av) => av.email === usuario.email || av.usuario === usuario.nome
        ) ? 1 : 0;
        const votouB = usuario && b.avaliacoesUsuarios?.some(
          (av) => av.email === usuario.email || av.usuario === usuario.nome
        ) ? 1 : 0;
        comparacao = votouA - votouB;
      } else {
        const valorA = a[ordenacao.campo as keyof Show];
        const valorB = b[ordenacao.campo as keyof Show];

        if (valorA === undefined || valorB === undefined) return 0;

        if (typeof valorA === 'string' && typeof valorB === 'string') {
          comparacao = valorA.localeCompare(valorB);
        } else if (typeof valorA === 'number' && typeof valorB === 'number') {
          comparacao = valorA - valorB;
        } else if (typeof valorA === 'boolean' && typeof valorB === 'boolean') {
          comparacao = valorA === valorB ? 0 : valorA ? 1 : -1;
        }
      }

      return ordenacao.direcao === 'asc' ? comparacao : -comparacao;
    });
  }, [shows, ordenacao, usuario]);

  const showsFiltrados = React.useMemo(() => {
    let resultado = showsOrdenados;

    if (abaAtiva === 'assistidos') {
      resultado = resultado.filter((show) => show.assistido);
    } else if (abaAtiva === 'nao-assistidos') {
      resultado = resultado.filter((show) => !show.assistido);
    }

    if (termoBusca) {
      resultado = resultado.filter((show) =>
        show.titulo.toLowerCase().includes(termoBusca.toLowerCase())
      );
    }

    return resultado;
  }, [showsOrdenados, termoBusca, abaAtiva]);

  const usuarioVotou = (show: Show): boolean => {
    if (!usuario || !show.avaliacoesUsuarios) return false;
    return show.avaliacoesUsuarios.some(
      (av) => av.email === usuario.email || av.usuario === usuario.nome
    );
  };

  const contarVotos = (show: Show): string => {
    const totalVotos = show.avaliacoesUsuarios?.length || 0;
    return `${totalVotos}/4`;
  };

  const renderIconeOrdenacao = (campo: keyof Show | 'votos' | 'usuarioVotou') => {
    if (ordenacao.campo !== campo) return null;
    return ordenacao.direcao === 'asc' ? ' ▲' : ' ▼';
  };

  if (carregando && shows.length === 0) {
    return (
      <>
        <Header />
        <Carregando mensagem="Carregando séries..." />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="lista-container">
        <div className="lista-cabecalho">
          <h2>Nossas Séries</h2>
          <div className="lista-busca">
            <input
              type="text"
              placeholder="Buscar por título..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="input-busca"
            />
          </div>
        </div>

        <div className="lista-abas">
          <button
            className={`aba ${abaAtiva === 'todos' ? 'aba-ativa' : ''}`}
            onClick={() => setAbaAtiva('todos')}
          >
            Todas ({shows.length})
          </button>
          <button
            className={`aba ${abaAtiva === 'assistidos' ? 'aba-ativa' : ''}`}
            onClick={() => setAbaAtiva('assistidos')}
          >
            Assistidas ({shows.filter((s) => s.assistido).length})
          </button>
          <button
            className={`aba ${abaAtiva === 'nao-assistidos' ? 'aba-ativa' : ''}`}
            onClick={() => setAbaAtiva('nao-assistidos')}
          >
            Não Assistidas ({shows.filter((s) => !s.assistido).length})
          </button>
        </div>

        {showsFiltrados.length === 0 ? (
          <div className="lista-vazia">
            <p>Nenhuma série encontrada</p>
          </div>
        ) : (
          <div className="tabela-wrapper">
            <table className="tabela-shows">
              <thead>
                <tr>
                  <th onClick={() => handleOrdenar('titulo')}>
                    Título{renderIconeOrdenacao('titulo')}
                  </th>
                  <th onClick={() => handleOrdenar('ano')}>
                    Ano{renderIconeOrdenacao('ano')}
                  </th>
                  <th onClick={() => handleOrdenar('temporadas')}>
                    Temporadas{renderIconeOrdenacao('temporadas')}
                  </th>
                  <th onClick={() => handleOrdenar('genero')}>
                    Gênero{renderIconeOrdenacao('genero')}
                  </th>
                  <th onClick={() => handleOrdenar('notaImdb')}>
                    IMDB{renderIconeOrdenacao('notaImdb')}
                  </th>
                  <th onClick={() => handleOrdenar('mediaAvaliacaoUsuarios')}>
                    Média Usuários{renderIconeOrdenacao('mediaAvaliacaoUsuarios')}
                  </th>
                  <th onClick={() => handleOrdenar('votos')}>
                    Votos{renderIconeOrdenacao('votos')}
                  </th>
                  <th onClick={() => handleOrdenar('usuarioVotou')}>
                    Você Votou?{renderIconeOrdenacao('usuarioVotou')}
                  </th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {showsFiltrados.map((show) => (
                  <tr key={show.id}>
                    <td className="coluna-titulo">{show.titulo}</td>
                    <td>{show.ano}</td>
                    <td>{show.temporadas}</td>
                    <td>{show.genero}</td>
                    <td>
                      {show.notaImdb !== 'N/A' ? (
                        <span className="badge badge-imdb">{show.notaImdb}</span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>
                      {show.avaliacoesUsuarios && show.avaliacoesUsuarios.length > 0 ? (
                        <span className="badge badge-usuarios">
                          {show.mediaAvaliacaoUsuarios?.toFixed(1) || '0.0'}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>
                      <span className="badge badge-info">{contarVotos(show)}</span>
                    </td>
                    <td>
                      {usuarioVotou(show) ? (
                        <span className="badge badge-success">Sim</span>
                      ) : (
                        <span className="badge badge-pending">Não</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleEditar(show.id)}
                        disabled={navegando}
                        className="btn-editar"
                      >
                        {navegando ? 'Abrindo...' : 'Editar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default ListaShows;


