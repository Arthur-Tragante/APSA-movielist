import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header, Modal, AvaliacaoEstrelas, Carregando } from '../../components';
import { useAuth } from '../../hooks';
import { filmeService } from '../../services';
import { Filme, Avaliacao } from '../../types';
import { MENSAGENS_ERRO, MENSAGENS_SUCESSO } from '../../constants';
import './EditarFilme.css';

/**
 * Página de edição de filmes com avaliação de usuários
 */
const EditarFilme: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { obterUsuarioLogado } = useAuth();

  const [filme, setFilme] = useState<Filme | null>(null);
  const [titulo, setTitulo] = useState('');
  const [duracao, setDuracao] = useState('');
  const [genero, setGenero] = useState('');
  const [ano, setAno] = useState('');
  const [sinopse, setSinopse] = useState('');
  const [notaImdb, setNotaImdb] = useState('');
  const [metascore, setMetascore] = useState('');
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
    const carregarFilme = async () => {
      if (!id) {
        setMensagemModal(MENSAGENS_ERRO.ID_INDEFINIDO);
        setTipoModal('erro');
        setExibirModal(true);
        return;
      }

      try {
        const filmeData = await filmeService.buscarPorId(id);

        if (!filmeData) {
          setMensagemModal(MENSAGENS_ERRO.FILME_NAO_ENCONTRADO);
          setTipoModal('erro');
          setExibirModal(true);
          return;
        }

        setFilme(filmeData);
        
        // Carrega dados apenas uma vez
        if (!dadosCarregadosRef.current) {
          setTitulo(filmeData.titulo);
          setDuracao(filmeData.duracao);
          setGenero(filmeData.genero);
          setAno(filmeData.ano);
          setSinopse(filmeData.sinopse);
          setNotaImdb(filmeData.notaImdb);
          setMetascore(filmeData.metascore);
          setAvaliacoes(filmeData.avaliacoes || []);
          setAssistido(filmeData.assistido);
          dadosCarregadosRef.current = true;
        }

        if (usuario && filmeData.avaliacoesUsuarios && !comentarioCarregadoRef.current) {
          const avaliacaoExistente = filmeData.avaliacoesUsuarios.find(
            (av) => av.email === usuario.email || av.usuario === usuario.nome
          );
          if (avaliacaoExistente) {
            setNotaUsuario(avaliacaoExistente.nota);
            setComentarioUsuario(avaliacaoExistente.comentario || '');
            comentarioCarregadoRef.current = true;
          }
        }
      } catch (error) {
        console.error('Erro ao carregar filme:', error);
        setMensagemModal(MENSAGENS_ERRO.ERRO_BUSCAR_FILME);
        setTipoModal('erro');
        setExibirModal(true);
      } finally {
        setCarregando(false);
      }
    };

    carregarFilme();
  }, [id, usuario]);

  const validarCampos = (): boolean => {
    if (!titulo || !duracao || !genero || !ano) {
      setMensagemModal(MENSAGENS_ERRO.CAMPOS_OBRIGATORIOS);
      setTipoModal('erro');
      setExibirModal(true);
      return false;
    }
    return true;
  };

  const handleSalvarFilme = async () => {
    if (!validarCampos() || !id) return;

    setSalvando(true);

    try {
      await filmeService.atualizar(id, {
        id,
        titulo,
        duracao,
        genero,
        ano,
        sinopse,
        notaImdb,
        metascore,
        avaliacoes,
        assistido,
        usuario: filme?.usuario || '',
      });

      if (notaUsuario > 0 && usuario) {
        await filmeService.atualizarAvaliacaoUsuario(
          id,
          usuario.email,
          notaUsuario,
          comentarioUsuario
        );
      }

      setMensagemModal(MENSAGENS_SUCESSO.FILME_ATUALIZADO);
      setTipoModal('sucesso');
      setExibirModal(true);
    } catch (error) {
      console.error('Erro ao atualizar filme:', error);
      setMensagemModal(MENSAGENS_ERRO.ERRO_ATUALIZAR_FILME);
      setTipoModal('erro');
      setExibirModal(true);
    } finally {
      setSalvando(false);
    }
  };

  const handleFecharModal = () => {
    setExibirModal(false);
    if (tipoModal === 'sucesso') {
      navigate('/lista');
    }
  };

  if (carregando) {
    return (
      <>
        <Header />
        <Carregando mensagem="Carregando filme..." />
      </>
    );
  }

  if (!filme) {
    return (
      <>
        <Header />
        <div className="erro-container">
          <p>Filme não encontrado.</p>
          <button onClick={() => navigate('/lista')} className="btn-voltar">
            Voltar para Lista
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="editar-container">
        <h2 className="editar-titulo">Editar Filme</h2>

        <div className="editar-form">
          <div className="form-grupo">
            <label htmlFor="titulo">Título</label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              placeholder="Digite o título do filme"
              disabled
              readOnly
            />
          </div>

          <div className="filme-info-layout">
            {filme?.poster && (
              <div className="filme-poster-preview">
                <img src={filme.poster} alt={titulo} className="poster-imagem" />
              </div>
            )}

            <div className="filme-dados">
              <button
                type="button"
                className={`form-grupo-checkbox ${salvando ? 'disabled' : ''}`}
                disabled={salvando}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  if (salvando || checkboxLockRef.current) return;
                  
                  checkboxLockRef.current = true;
                  console.log('🔘 Checkbox clicado! Estado atual:', assistido);
                  
                  setAssistido(prev => {
                    const novoValor = !prev;
                    console.log('🔄 Mudando de', prev, 'para', novoValor);
                    return novoValor;
                  });
                  
                  setTimeout(() => {
                    checkboxLockRef.current = false;
                  }, 500);
                }}
              >
                <div className={`checkbox-custom ${assistido ? 'checked' : ''}`}>
                  {assistido && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M13.5 4L6 11.5L2.5 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="checkbox-label">Assistido {assistido ? '✓' : ''}</span>
              </button>

              <div className="form-linha">
                <div className="form-grupo">
                  <label htmlFor="ano">Ano</label>
                  <input
                    id="ano"
                    type="text"
                    value={ano}
                    placeholder="Ex: 2024"
                    disabled
                    readOnly
                  />
                </div>

                <div className="form-grupo">
                  <label htmlFor="duracao">Duração (min)</label>
                  <input
                    id="duracao"
                    type="text"
                    value={duracao}
                    placeholder="Ex: 120"
                    disabled
                    readOnly
                  />
                </div>
              </div>

              <div className="form-grupo">
                <label htmlFor="genero">Gênero</label>
                <input
                  id="genero"
                  type="text"
                  value={genero}
                  placeholder="Ex: Ação, Drama"
                  disabled
                  readOnly
                />
              </div>

              <div className="form-linha">
                <div className="form-grupo">
                  <label htmlFor="notaImdb">Nota IMDB</label>
                  <input
                    id="notaImdb"
                    type="text"
                    value={notaImdb}
                placeholder="Ex: 8.5"
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
                    placeholder="Ex: 85"
                    disabled
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {avaliacoes.length > 0 && (
            <div className="form-grupo">
              <label>Outras Avaliações</label>
              <div className="avaliacoes-lista">
                {avaliacoes.map((av, index) => (
                  <div key={index} className="avaliacao-item">
                    <span className="avaliacao-fonte">{av.fonte}:</span>
                    <span className="avaliacao-valor">{av.valor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-grupo">
            <label htmlFor="sinopse">Sinopse</label>
            <textarea
              id="sinopse"
              value={sinopse}
              placeholder="Digite a sinopse do filme"
              rows={5}
              disabled
              readOnly
            />
          </div>

          {filme.avaliacoesUsuarios && filme.avaliacoesUsuarios.length > 0 && (
            <div className="form-grupo">
              <label>Avaliações de Todos os Usuários</label>
              <div className="avaliacoes-usuarios">
                {filme.avaliacoesUsuarios.map((av, index) => (
                  <div key={index} className="avaliacao-usuario-card">
                    <div className="avaliacao-usuario-header">
                      <span className="avaliacao-usuario-nome">{av.usuario}</span>
                      <span className="avaliacao-usuario-nota">{av.nota}/10 ⭐</span>
                    </div>
                    {av.comentario && (
                      <div className="avaliacao-usuario-comentario">
                        <p>{av.comentario}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-grupo">
            <label>Sua Avaliação</label>
            <AvaliacaoEstrelas
              nota={notaUsuario}
              aoMudarNota={setNotaUsuario}
              somenteLeitura={salvando}
            />
          </div>

          {notaUsuario > 0 && (
            <div className="form-grupo">
              <label htmlFor="comentarioUsuario">Sua Observação (Opcional)</label>
              <textarea
                id="comentarioUsuario"
                value={comentarioUsuario}
                onChange={(e) => setComentarioUsuario(e.target.value)}
                placeholder="Adicione um comentário sobre sua avaliação..."
                rows={3}
                disabled={salvando}
                className="textarea-comentario"
              />
            </div>
          )}

          <div className="form-acoes">
            <button
              type="button"
              className="btn-cancelar"
              onClick={() => navigate('/lista')}
              disabled={salvando}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-salvar"
              onClick={handleSalvarFilme}
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>

      <Modal
        exibir={exibirModal}
        mensagem={mensagemModal}
        aoFechar={handleFecharModal}
        tipo={tipoModal}
      />
    </>
  );
};

export default EditarFilme;

