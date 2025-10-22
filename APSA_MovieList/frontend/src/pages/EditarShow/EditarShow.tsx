import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header, Modal, AvaliacaoEstrelas, Carregando } from '../../components';
import { useAuth } from '../../hooks';
import { showService } from '../../services';
import { Show, Avaliacao } from '../../types';
import { MENSAGENS_ERRO, MENSAGENS_SUCESSO } from '../../constants';
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
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [assistido, setAssistido] = useState(false);
  const [notaUsuario, setNotaUsuario] = useState(0);
  const [comentarioUsuario, setComentarioUsuario] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [exibirModal, setExibirModal] = useState(false);
  const [mensagemModal, setMensagemModal] = useState('');
  const [tipoModal, setTipoModal] = useState<'sucesso' | 'erro' | 'informacao'>('informacao');
  
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
          setAvaliacoes(showData.avaliacoes || []);
          setAssistido(showData.assistido);
          dadosCarregadosRef.current = true;
        }

        if (usuario && showData.avaliacoesUsuarios && !comentarioCarregadoRef.current) {
          const avaliacaoExistente = showData.avaliacoesUsuarios.find(
            (av) => av.email === usuario.email || av.usuario === usuario.nome
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
  }, [id, usuario]);

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
          assistido,
          comentarioUsuario
        );
      }

      setMensagemModal('Série atualizada com sucesso!');
      setTipoModal('sucesso');
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

  const fecharModal = () => {
    setExibirModal(false);
    if (tipoModal === 'sucesso') {
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
                tamanho={30}
                onChange={setNotaUsuario}
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
                      <AvaliacaoEstrelas nota={avaliacao.nota} tamanho={16} somenteLeitura />
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
          mensagem={mensagemModal}
          tipo={tipoModal}
          onFechar={fecharModal}
        />
      )}
    </div>
  );
};

export default EditarShow;


