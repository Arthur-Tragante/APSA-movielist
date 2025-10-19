import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Carregando } from '../../components';
import { useFilmes } from '../../hooks';
import { Filme } from '../../types';
import './ListaFilmes.css';

/**
 * Página de listagem de filmes com filtros e ordenação
 */
const ListaFilmes: React.FC = () => {
  const navigate = useNavigate();
  const { filmes, carregando } = useFilmes();
  const [termoBusca, setTermoBusca] = useState('');
  const [navegando, setNavegando] = useState(false);
  const [ordenacao, setOrdenacao] = useState<{
    campo: keyof Filme | null;
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

  const handleOrdenar = (campo: keyof Filme) => {
    setOrdenacao((prev) => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filmesOrdenados = React.useMemo(() => {
    if (!ordenacao.campo) return filmes;

    return [...filmes].sort((a, b) => {
      const valorA = a[ordenacao.campo!];
      const valorB = b[ordenacao.campo!];

      if (valorA === undefined || valorB === undefined) return 0;

      let comparacao = 0;

      if (typeof valorA === 'string' && typeof valorB === 'string') {
        comparacao = valorA.localeCompare(valorB);
      } else if (typeof valorA === 'number' && typeof valorB === 'number') {
        comparacao = valorA - valorB;
      } else if (typeof valorA === 'boolean' && typeof valorB === 'boolean') {
        comparacao = valorA === valorB ? 0 : valorA ? 1 : -1;
      }

      return ordenacao.direcao === 'asc' ? comparacao : -comparacao;
    });
  }, [filmes, ordenacao]);

  const filmesFiltrados = React.useMemo(() => {
    if (!termoBusca) return filmesOrdenados;

    return filmesOrdenados.filter((filme) =>
      filme.titulo.toLowerCase().includes(termoBusca.toLowerCase())
    );
  }, [filmesOrdenados, termoBusca]);

  const renderIconeOrdenacao = (campo: keyof Filme) => {
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
          <h2>Meus Filmes</h2>
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
                      <span
                        className={`badge ${
                          filme.assistido ? 'badge-sim' : 'badge-nao'
                        }`}
                      >
                        {filme.assistido ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td>
                      {filme.mediaAvaliacaoUsuarios
                        ? `${filme.mediaAvaliacaoUsuarios.toFixed(1)}/10`
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

