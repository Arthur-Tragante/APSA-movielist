import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Carregando } from '../../components';
import { useFilmes, useAuth } from '../../hooks';
import { Filme } from '../../types';
import './ListaFilmes.css';

/**
 * Página de listagem de filmes com filtros e ordenação
 */
const ListaFilmes: React.FC = () => {
  const navigate = useNavigate();
  const { filmes, carregando } = useFilmes();
  const { obterUsuarioLogado } = useAuth();
  const usuario = obterUsuarioLogado();
  
  const [termoBusca, setTermoBusca] = useState('');
  const [navegando, setNavegando] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'todos' | 'assistidos' | 'nao-assistidos'>('todos');
  const [ordenacao, setOrdenacao] = useState<{
    campo: keyof Filme | 'votos' | 'usuarioVotou' | null;
    direcao: 'asc' | 'desc';
  }>({ campo: null, direcao: 'asc' });

  const handleEditar = React.useCallback((id: string) => {
    if (navegando) return; // Previne cliques múltiplos
    
    setNavegando(true);
    try {
      navigate(`/editar/${id}`);
    } catch (error) {
      console.error('Erro ao navegar:', error);
      setNavegando(false);
    }
  }, [navigate, navegando]);

  const handleOrdenar = (campo: keyof Filme | 'votos' | 'usuarioVotou') => {
    setOrdenacao((prev) => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filmesOrdenados = React.useMemo(() => {
    if (!ordenacao.campo) return filmes;

    return [...filmes].sort((a, b) => {
      let comparacao = 0;

      // Ordenação customizada para campos calculados
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
        // Ordenação normal para campos do tipo Filme
        const valorA = a[ordenacao.campo as keyof Filme];
        const valorB = b[ordenacao.campo as keyof Filme];

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
  }, [filmes, ordenacao, usuario]);

  const filmesFiltrados = React.useMemo(() => {
    let resultado = filmesOrdenados;

    // Filtro por aba
    if (abaAtiva === 'assistidos') {
      resultado = resultado.filter((filme) => filme.assistido);
    } else if (abaAtiva === 'nao-assistidos') {
      resultado = resultado.filter((filme) => !filme.assistido);
    }

    // Filtro por busca
    if (termoBusca) {
      resultado = resultado.filter((filme) =>
        filme.titulo.toLowerCase().includes(termoBusca.toLowerCase())
      );
    }

    return resultado;
  }, [filmesOrdenados, termoBusca, abaAtiva]);

  // Verifica se o usuário logado votou no filme
  const usuarioVotou = (filme: Filme): boolean => {
    if (!usuario || !filme.avaliacoesUsuarios) return false;
    return filme.avaliacoesUsuarios.some(
      (av) => av.email === usuario.email || av.usuario === usuario.nome
    );
  };

  // Conta quantos usuários votaram
  const contarVotos = (filme: Filme): string => {
    const totalVotos = filme.avaliacoesUsuarios?.length || 0;
    return `${totalVotos}/4`;
  };

  const renderIconeOrdenacao = (campo: keyof Filme | 'votos' | 'usuarioVotou') => {
    if (ordenacao.campo !== campo) return null;
    return ordenacao.direcao === 'asc' ? ' ▲' : ' ▼';
  };

  if (carregando && filmes.length === 0) {
    return (
      <>
        <Header />
        <Carregando mensagem="Carregando filmes..." />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="lista-container">
        <div className="lista-cabecalho">
          <h2>Nossos Filmes</h2>
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
            Todos ({filmes.length})
          </button>
          <button
            className={`aba ${abaAtiva === 'assistidos' ? 'aba-ativa' : ''}`}
            onClick={() => setAbaAtiva('assistidos')}
          >
            Assistidos ({filmes.filter(f => f.assistido).length})
          </button>
          <button
            className={`aba ${abaAtiva === 'nao-assistidos' ? 'aba-ativa' : ''}`}
            onClick={() => setAbaAtiva('nao-assistidos')}
          >
            Não Assistidos ({filmes.filter(f => !f.assistido).length})
          </button>
        </div>

        {filmesFiltrados.length === 0 ? (
          <div className="lista-vazia">
            <p>Nenhum filme encontrado.</p>
            <button
              className="btn-adicionar"
              onClick={() => navigate('/adicionar')}
            >
              Adicionar Primeiro Filme
            </button>
          </div>
        ) : (
          <div className="tabela-container">
            <table className="tabela-filmes">
              <thead>
                <tr>
                  <th onClick={() => handleOrdenar('titulo')}>
                    Título{renderIconeOrdenacao('titulo')}
                  </th>
                  <th onClick={() => handleOrdenar('genero')}>
                    Gênero{renderIconeOrdenacao('genero')}
                  </th>
                  <th onClick={() => handleOrdenar('ano')}>
                    Ano{renderIconeOrdenacao('ano')}
                  </th>
                  <th onClick={() => handleOrdenar('duracao')}>
                    Duração{renderIconeOrdenacao('duracao')}
                  </th>
                  <th onClick={() => handleOrdenar('notaImdb')}>
                    IMDB{renderIconeOrdenacao('notaImdb')}
                  </th>
                  <th onClick={() => handleOrdenar('metascore')}>
                    Meta{renderIconeOrdenacao('metascore')}
                  </th>
                  <th onClick={() => handleOrdenar('notaRottenTomatoes')}>
                    Rotten{renderIconeOrdenacao('notaRottenTomatoes')}
                  </th>
                  <th onClick={() => handleOrdenar('votos')}>
                    Votos{renderIconeOrdenacao('votos')}
                  </th>
                  <th onClick={() => handleOrdenar('usuarioVotou')}>
                    Você Votou?{renderIconeOrdenacao('usuarioVotou')}
                  </th>
                  <th onClick={() => handleOrdenar('assistido')}>
                    Assistido{renderIconeOrdenacao('assistido')}
                  </th>
                  <th onClick={() => handleOrdenar('mediaAvaliacaoUsuarios')}>
                    Média Usuários{renderIconeOrdenacao('mediaAvaliacaoUsuarios')}
                  </th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filmesFiltrados.map((filme) => (
                  <tr key={filme.id}>
                    <td className="celula-titulo">{filme.titulo}</td>
                    <td>{filme.genero}</td>
                    <td>{filme.ano}</td>
                    <td>{filme.duracao} min</td>
                    <td>{filme.notaImdb || 'N/A'}</td>
                    <td>{filme.metascore || 'N/A'}</td>
                    <td>{filme.notaRottenTomatoes || 'N/A'}</td>
                    <td>
                      <span className="badge badge-info">{contarVotos(filme)}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          usuarioVotou(filme) ? 'badge-sim' : 'badge-nao'
                        }`}
                      >
                        {usuarioVotou(filme) ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          filme.assistido ? 'badge-sim' : 'badge-nao'
                        }`}
                      >
                        {filme.assistido ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td>
                      {filme.avaliacoesUsuarios && filme.avaliacoesUsuarios.length > 0
                        ? `${(filme.mediaAvaliacaoUsuarios || 0).toFixed(1)}/10`
                        : 'N/A'}
                    </td>
                    <td>
                      <button
                        className="btn-editar"
                        onClick={() => handleEditar(filme.id)}
                        disabled={navegando}
                        title="Editar filme"
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

export default ListaFilmes;

