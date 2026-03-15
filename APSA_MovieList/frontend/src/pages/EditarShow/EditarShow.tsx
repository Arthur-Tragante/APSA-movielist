import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header, Modal, AvaliacaoEstrelas, Carregando } from '../../components';
import { useAuth } from '../../hooks';
import { showService, apiExternaService } from '../../services';
import { Show } from '../../types';
import { MENSAGENS_ERRO } from '../../constants';
import './EditarShow.css';

/**
 * Página de edição de séries com avaliação de usuários
 */
const EditarShow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { obterUsuarioLogado } = useAuth();

  const [show, setShow] = useState<Show | null>(null);
  const [titulo, setTitulo] = useState('');
  const [temporadas, setTemporadas] = useState('');
  const [genero, setGenero] = useState('');
  const [ano, setAno] = useState('');
  const [sinopse, setSinopse] = useState('');
  const [notaImdb, setNotaImdb] = useState('');
  const [metascore, setMetascore] = useState('');
  const [poster, setPoster] = useState('');
  const [assistido, setAssistido] = useState(false);
  const [notaUsuario, setNotaUsuario] = useState(0);
  const [comentarioUsuario, setComentarioUsuario] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [exibirModal, setExibirModal] = useState(false);
  const [mensagemModal, setMensagemModal] = useState('');
  const [tipoModal, setTipoModal] = useState<'sucesso' | 'erro' | 'informacao'>('informacao');
  
  // Episode states
  const [temporadaSelecionada, setTemporadaSelecionada] = useState(1);
  const [episodiosTmdb, setEpisodiosTmdb] = useState<any[]>([]);
  const [carregandoEpisodios, setCarregandoEpisodios] = useState(false);
  const [episodiosCarregados, setEpisodiosCarregados] = useState<Record<number, any[]>>({});
  const [notasEpisodios, setNotasEpisodios] = useState<Record<string, number>>({});
  const [comentariosEpisodios, setComentariosEpisodios] = useState<Record<string, string>>({});
  const [salvandoEpisodio, setSalvandoEpisodio] = useState<string | null>(null);
  const [vinculandoTmdb, setVinculandoTmdb] = useState(false);

  const checkboxLockRef = useRef(false);
  const comentarioCarregadoRef = useRef(false);
  const dadosCarregadosRef = useRef(false);
  const usuario = obterUsuarioLogado();

  useEffect(() => {
    const carregarShow = async () => {
      if (!id) {
        setMensagemModal(MENSAGENS_ERRO.ID_INDEFINIDO);
        setTipoModal('erro');
        setExibirModal(true);
        return;
      }

      try {
        const showData = await showService.buscarPorId(id);

        if (!showData) {
          setMensagemModal('Série não encontrada');
          setTipoModal('erro');
          setExibirModal(true);
          return;
        }

        setShow(showData);
        
        if (!dadosCarregadosRef.current) {
          setTitulo(showData.titulo);
          setTemporadas(showData.temporadas);
          setGenero(showData.genero);
          setAno(showData.ano);
          setSinopse(showData.sinopse);
          setNotaImdb(showData.notaImdb);
          setMetascore(showData.metascore);
          setPoster(showData.poster || '');
          setAssistido(showData.assistido);
          dadosCarregadosRef.current = true;
        }

        const usuarioAtual = obterUsuarioLogado();
        if (usuarioAtual && showData.avaliacoesUsuarios && !comentarioCarregadoRef.current) {
          const avaliacaoExistente = showData.avaliacoesUsuarios.find(
            (av) => av.email === usuarioAtual.email || av.usuario === usuarioAtual.nome
          );
          if (avaliacaoExistente) {
            setNotaUsuario(avaliacaoExistente.nota);
            setComentarioUsuario(avaliacaoExistente.comentario || '');
            comentarioCarregadoRef.current = true;
          }
        }
      } catch (error) {
        console.error('Erro ao carregar série:', error);
        setMensagemModal('Erro ao buscar série');
        setTipoModal('erro');
        setExibirModal(true);
      } finally {
        setCarregando(false);
      }
    };

    carregarShow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Load episodes from TMDB when season tab changes
  const carregarEpisodios = useCallback(async (numTemporada: number) => {
    if (!show?.idTmdb) return;

    // Check if already loaded
    if (episodiosCarregados[numTemporada]) {
      setEpisodiosTmdb(episodiosCarregados[numTemporada]);
      return;
    }

    setCarregandoEpisodios(true);
    try {
      const resultado = await apiExternaService.buscarEpisodiosTemporada(
        show.idTmdb,
        numTemporada
      );

      if (resultado?.episodios) {
        setEpisodiosTmdb(resultado.episodios);
        setEpisodiosCarregados(prev => ({ ...prev, [numTemporada]: resultado.episodios }));

        // Load existing ratings for these episodes
        const temporadaExistente = show.temporadasEpisodios?.find(t => t.numero === numTemporada);
        if (temporadaExistente && usuario) {
          const novasNotas: Record<string, number> = {};
          const novosComentarios: Record<string, string> = {};
          temporadaExistente.episodios.forEach(ep => {
            const avaliacao = ep.avaliacoesEpisodio?.find(
              av => av.email === usuario.email
            );
            if (avaliacao) {
              const chave = `${numTemporada}-${ep.numero}`;
              novasNotas[chave] = avaliacao.nota;
              novosComentarios[chave] = avaliacao.comentario || '';
            }
          });
          setNotasEpisodios(prev => ({ ...prev, ...novasNotas }));
          setComentariosEpisodios(prev => ({ ...prev, ...novosComentarios }));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar episódios:', error);
    } finally {
      setCarregandoEpisodios(false);
    }
  }, [show, episodiosCarregados, usuario]);

  // Load episodes when season tab changes
  useEffect(() => {
    if (show?.idTmdb) {
      carregarEpisodios(temporadaSelecionada);
    }
  }, [temporadaSelecionada, show?.idTmdb, carregarEpisodios]);

  const handleSalvarAvaliacaoEpisodio = async (numTemporada: number, numEpisodio: number, ep: any) => {
    if (!id || !usuario) return;

    const chave = `${numTemporada}-${numEpisodio}`;
    const nota = notasEpisodios[chave];
    const comentario = comentariosEpisodios[chave] || '';

    if (!nota || nota <= 0) {
      setMensagemModal('Selecione uma nota para o episódio');
      setTipoModal('erro');
      setExibirModal(true);
      return;
    }

    setSalvandoEpisodio(chave);
    try {
      // First ensure the episode exists in the backend
      await showService.adicionarEpisodio(id, numTemporada, {
        numero: numEpisodio,
        titulo: ep.titulo,
        sinopse: ep.sinopse || '',
        dataLancamento: ep.dataLancamento || '',
      });

      // Then rate it
      await showService.avaliarEpisodio(id, numTemporada, numEpisodio, nota, comentario);

      // Refresh show data
      const showAtualizado = await showService.buscarPorId(id);
      if (showAtualizado) {
        setShow(showAtualizado);
      }

      setMensagemModal(`Episódio ${numEpisodio} avaliado com sucesso!`);
      setTipoModal('sucesso');
      setNavegarAoFechar(false);
      setExibirModal(true);
    } catch (error: any) {
      console.error('Erro ao avaliar episódio:', error);
      setMensagemModal(`Erro ao avaliar episódio: ${error.message}`);
      setTipoModal('erro');
      setExibirModal(true);
    } finally {
      setSalvandoEpisodio(null);
    }
  };

  const obterNotaExistente = (numTemporada: number, numEpisodio: number): number | null => {
    const temporada = show?.temporadasEpisodios?.find(t => t.numero === numTemporada);
    if (!temporada) return null;
    const episodio = temporada.episodios.find(e => e.numero === numEpisodio);
    if (!episodio || !usuario) return null;
    const avaliacao = episodio.avaliacoesEpisodio?.find(av => av.email === usuario.email);
    return avaliacao?.nota ?? null;
  };

  const obterAvaliacoesOutros = (numTemporada: number, numEpisodio: number) => {
    const temporada = show?.temporadasEpisodios?.find(t => t.numero === numTemporada);
    if (!temporada) return [];
    const episodio = temporada.episodios.find(e => e.numero === numEpisodio);
    if (!episodio) return [];
    return (episodio.avaliacoesEpisodio || []).filter(av => av.email !== usuario?.email);
  };

  const handleVincularTmdb = async () => {
    if (!id || !show) return;
    setVinculandoTmdb(true);
    try {
      // Extract first part of title (before " / ")
      const tituloParaBusca = show.titulo.split(' / ')[0].trim();
      const resultados = await apiExternaService.buscarSeriesPorTitulo(tituloParaBusca);

      if (resultados.length > 0) {
        const tmdbId = Number(resultados[0].id);
        await showService.atualizar(id, { idTmdb: tmdbId } as any);

        // Refresh show data
        const showAtualizado = await showService.buscarPorId(id);
        if (showAtualizado) {
          setShow(showAtualizado);
        }

        setMensagemModal('TMDB vinculado com sucesso! Episódios disponíveis.');
        setTipoModal('sucesso');
        setNavegarAoFechar(false);
        setExibirModal(true);
      } else {
        setMensagemModal('Série não encontrada no TMDB.');
        setTipoModal('erro');
        setExibirModal(true);
      }
    } catch (error: any) {
      console.error('Erro ao vincular TMDB:', error);
      setMensagemModal(`Erro ao vincular TMDB: ${error.message}`);
      setTipoModal('erro');
      setExibirModal(true);
    } finally {
      setVinculandoTmdb(false);
    }
  };

  const totalTemporadas = parseInt(temporadas) || 1;

  const validarCampos = (): boolean => {
    if (!titulo || !temporadas || !genero || !ano) {
      setMensagemModal(MENSAGENS_ERRO.CAMPOS_OBRIGATORIOS);
      setTipoModal('erro');
      setExibirModal(true);
      return false;
    }
    return true;
  };

  const handleSalvarShow = async () => {
    if (!validarCampos() || !id) return;

    if (!usuario) {
      setMensagemModal('Usuário não autenticado');
      setTipoModal('erro');
      setExibirModal(true);
      return;
    }

    setSalvando(true);

    try {
      if (notaUsuario > 0) {
        await showService.atualizarAvaliacaoUsuario(
          id,
          usuario.email,
          usuario.nome,
          notaUsuario,
          comentarioUsuario
        );
      }

      setMensagemModal('Série atualizada com sucesso!');
      setTipoModal('sucesso');
      setNavegarAoFechar(true);
      setExibirModal(true);

      setTimeout(() => {
        navigate('/series');
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao atualizar série:', error);
      setMensagemModal(`Erro ao atualizar série: ${error.message}`);
      setTipoModal('erro');
      setExibirModal(true);
    } finally {
      setSalvando(false);
    }
  };

  const handleCheckboxClick = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (checkboxLockRef.current) {
      return;
    }

    checkboxLockRef.current = true;

    setAssistido(prev => {
      const novoValor = !prev;
      return novoValor;
    });

    setTimeout(() => {
      checkboxLockRef.current = false;
    }, 300);
  };

  const [navegarAoFechar, setNavegarAoFechar] = useState(false);

  const fecharModal = () => {
    setExibirModal(false);
    if (tipoModal === 'sucesso' && navegarAoFechar) {
      navigate('/series');
    }
  };

  const handleVoltar = () => {
    navigate('/series');
  };

  if (carregando) {
    return <Carregando mensagem="Carregando série..." />;
  }

  if (!show) {
    return (
      <>
        <Header />
        <div className="editar-erro">
          <p>Série não encontrada</p>
          <button onClick={handleVoltar} className="btn-voltar">
            Voltar para lista
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="pagina-editar-show">
      <Header />
      <div className="editar-show-container">
        <div className="editar-show-header">
          <button onClick={handleVoltar} className="btn-voltar">
            ← Voltar
          </button>
          <h1>Editar Série</h1>
        </div>

        <form className="formulario-show" onSubmit={(e) => e.preventDefault()}>
          {poster && (
            <div className="show-info-layout">
              <div className="show-poster-preview">
                {poster && (
                  <img
                    src={poster}
                    alt={titulo}
                    className="poster-imagem"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
              
              <div className="show-dados">
                <div className="form-grupo">
                  <label htmlFor="titulo">Título</label>
                  <input
                    id="titulo"
                    type="text"
                    value={titulo}
                    disabled
                    readOnly
                  />
                </div>

                <div className="form-grupo-inline">
                  <div className="form-grupo">
                    <label htmlFor="ano">Ano</label>
                    <input
                      id="ano"
                      type="text"
                      value={ano}
                      disabled
                      readOnly
                    />
                  </div>

                  <div className="form-grupo">
                    <label htmlFor="temporadas">Temporadas</label>
                    <input
                      id="temporadas"
                      type="text"
                      value={temporadas}
                      disabled
                      readOnly
                    />
                  </div>

                  <div className="form-grupo">
                    <label htmlFor="genero">Gênero</label>
                    <input
                      id="genero"
                      type="text"
                      value={genero}
                      disabled
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {!poster && (
            <>
              <div className="form-grupo">
                <label htmlFor="titulo">Título</label>
                <input
                  id="titulo"
                  type="text"
                  value={titulo}
                  disabled
                  readOnly
                />
              </div>

              <div className="form-grupo-inline">
                <div className="form-grupo">
                  <label htmlFor="ano">Ano</label>
                  <input
                    id="ano"
                    type="text"
                    value={ano}
                    disabled
                    readOnly
                  />
                </div>

                <div className="form-grupo">
                  <label htmlFor="temporadas">Temporadas</label>
                  <input
                    id="temporadas"
                    type="text"
                    value={temporadas}
                    disabled
                    readOnly
                  />
                </div>

                <div className="form-grupo">
                  <label htmlFor="genero">Gênero</label>
                  <input
                    id="genero"
                    type="text"
                    value={genero}
                    disabled
                    readOnly
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-grupo-inline">
            <div className="form-grupo">
              <label htmlFor="notaImdb">Nota IMDB</label>
              <input
                id="notaImdb"
                type="text"
                value={notaImdb}
                disabled
                readOnly
              />
            </div>

            <div className="form-grupo">
              <label htmlFor="metascore">Metascore</label>
              <input
                id="metascore"
                type="text"
                value={metascore}
                disabled
                readOnly
              />
            </div>
          </div>

          <div className="form-grupo">
            <label htmlFor="sinopse">Sinopse</label>
            <textarea
              id="sinopse"
              value={sinopse}
              disabled
              readOnly
              rows={5}
            />
          </div>

          <div className="secao-avaliacao-usuario">
            <h3>Sua Avaliação</h3>
            
            <div className="form-grupo-checkbox">
              <button
                type="button"
                className={`checkbox-custom ${assistido ? 'checked' : ''}`}
                onPointerDown={handleCheckboxClick}
                aria-checked={assistido}
                role="checkbox"
              >
                {assistido && '✓'}
              </button>
              <span className="checkbox-label">Já assisti esta série</span>
            </div>

            <div className="form-grupo">
              <label>Nota</label>
              <AvaliacaoEstrelas
                nota={notaUsuario}
                aoMudarNota={setNotaUsuario}
              />
            </div>

            <div className="form-grupo">
              <label htmlFor="comentario">Comentário</label>
              <textarea
                id="comentario"
                value={comentarioUsuario}
                onChange={(e) => setComentarioUsuario(e.target.value)}
                placeholder="O que você achou da série?"
                rows={3}
              />
            </div>
          </div>

          <div className="form-acoes">
            <button
              type="button"
              onClick={handleVoltar}
              className="btn-cancelar"
              disabled={salvando}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSalvarShow}
              className="btn-salvar"
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Salvar Avaliação'}
            </button>
          </div>
        </form>

        {/* Seção de Episódios */}
        {show.idTmdb && totalTemporadas > 0 && (
          <div className="secao-episodios">
            <h3>Episódios</h3>

            <div className="temporadas-tabs">
              {Array.from({ length: totalTemporadas }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  type="button"
                  className={`tab-temporada ${temporadaSelecionada === num ? 'ativa' : ''}`}
                  onClick={() => setTemporadaSelecionada(num)}
                >
                  T{num}
                </button>
              ))}
            </div>

            {carregandoEpisodios ? (
              <div className="episodios-carregando">Carregando episódios...</div>
            ) : episodiosTmdb.length > 0 ? (
              <div className="lista-episodios">
                {episodiosTmdb.map((ep) => {
                  const chave = `${temporadaSelecionada}-${ep.numero}`;
                  const notaExistente = obterNotaExistente(temporadaSelecionada, ep.numero);
                  const avaliacoesOutros = obterAvaliacoesOutros(temporadaSelecionada, ep.numero);
                  const notaAtual = notasEpisodios[chave] ?? notaExistente ?? 0;

                  return (
                    <div key={ep.numero} className="episodio-card">
                      <div className="episodio-header">
                        <div className="episodio-info">
                          <span className="episodio-numero">E{ep.numero}</span>
                          <span className="episodio-titulo">{ep.titulo}</span>
                          {ep.dataLancamento && (
                            <span className="episodio-data">{ep.dataLancamento}</span>
                          )}
                        </div>
                        {ep.duracao && (
                          <span className="episodio-duracao">{ep.duracao} min</span>
                        )}
                      </div>

                      {ep.sinopse && (
                        <p className="episodio-sinopse">{ep.sinopse}</p>
                      )}

                      <div className="episodio-avaliacao">
                        <div className="episodio-nota-container">
                          <AvaliacaoEstrelas
                            nota={notaAtual}
                            aoMudarNota={(nota) => {
                              setNotasEpisodios(prev => ({ ...prev, [chave]: nota }));
                            }}
                          />
                          <input
                            type="text"
                            className="episodio-comentario-input"
                            placeholder="Comentário..."
                            value={comentariosEpisodios[chave] || ''}
                            onChange={(e) => {
                              setComentariosEpisodios(prev => ({ ...prev, [chave]: e.target.value }));
                            }}
                          />
                          <button
                            type="button"
                            className="btn-avaliar-episodio"
                            onClick={() => handleSalvarAvaliacaoEpisodio(temporadaSelecionada, ep.numero, ep)}
                            disabled={salvandoEpisodio === chave}
                          >
                            {salvandoEpisodio === chave ? '...' : notaExistente ? 'Atualizar' : 'Avaliar'}
                          </button>
                        </div>

                        {avaliacoesOutros.length > 0 && (
                          <div className="episodio-avaliacoes-outros">
                            {avaliacoesOutros.map((av, idx) => (
                              <span key={idx} className="episodio-avaliacao-badge" title={av.comentario || ''}>
                                {av.usuario || av.email.split('@')[0]}: {av.nota}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="episodios-vazio">Nenhum episódio encontrado para esta temporada.</p>
            )}
          </div>
        )}

        {!show.idTmdb && (
          <div className="secao-episodios-indisponivel">
            <p>Episódios não disponíveis. Vincule ao TMDB para carregar a lista de episódios.</p>
            <button
              type="button"
              className="btn-vincular-tmdb"
              onClick={handleVincularTmdb}
              disabled={vinculandoTmdb}
            >
              {vinculandoTmdb ? 'Buscando...' : 'Vincular ao TMDB'}
            </button>
          </div>
        )}

        {show.avaliacoesUsuarios && show.avaliacoesUsuarios.length > 0 && (
          <div className="secao-avaliacoes-outros">
            <h3>Avaliações de Outros Usuários</h3>
            <div className="lista-avaliacoes">
              {show.avaliacoesUsuarios
                .filter((av) => av.email !== usuario?.email && av.usuario !== usuario?.nome)
                .map((avaliacao, index) => (
                  <div key={index} className="avaliacao-card">
                    <div className="avaliacao-usuario-info">
                      <strong>{avaliacao.usuario || avaliacao.email}</strong>
                      <AvaliacaoEstrelas nota={avaliacao.nota} aoMudarNota={() => {}} somenteLeitura />
                    </div>
                    {avaliacao.comentario && (
                      <p className="avaliacao-comentario">{avaliacao.comentario}</p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {exibirModal && (
        <Modal
          exibir={exibirModal}
          mensagem={mensagemModal}
          tipo={tipoModal}
          aoFechar={fecharModal}
        />
      )}
    </div>
  );
};

export default EditarShow;



