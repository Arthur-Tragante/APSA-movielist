import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Modal, Carregando, AvaliacaoEstrelas } from '../../components';
import { useApiExterna, useAuth } from '../../hooks';
import { filmeService } from '../../services';
import { ResultadoFilmeTMDB, Avaliacao } from '../../types';
import { MENSAGENS_ERRO, MENSAGENS_SUCESSO, TMDB_IMAGE_BASE_URL } from '../../constants';
import './AdicionarFilme.css';

/**
 * Página de cadastro de filmes com busca automática
 */
const AdicionarFilme: React.FC = () => {
  const navigate = useNavigate();
  const { obterUsuarioLogado } = useAuth();
  const { resultados, buscarPorTitulo, buscarInformacoesCompletas, limparResultados, carregando: carregandoApi, erro: erroApi } = useApiExterna();

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
  const [carregando, setCarregando] = useState(false);
  const [exibirModal, setExibirModal] = useState(false);
  const [mensagemModal, setMensagemModal] = useState('');
  const [tipoModal, setTipoModal] = useState<'sucesso' | 'erro' | 'informacao'>('informacao');

  const usuario = obterUsuarioLogado();

  const handleBuscarFilme = (termoBusca: string) => {
    setTitulo(termoBusca);
    const tituloBusca = termoBusca.split(' / ')[0];
    buscarPorTitulo(tituloBusca);
  };

  const handleSelecionarFilme = async (filme: ResultadoFilmeTMDB) => {
    limparResultados();
    setCarregando(true);

    try {
      const info = await buscarInformacoesCompletas(filme.id);

      if (info) {
        setTitulo(`${info.tituloPt} / ${info.tituloEn}`);
        setDuracao(info.duracao?.toString() || '');
        setGenero(info.generos);
        setAno(info.ano);
        setSinopse(info.sinopse);
        setNotaImdb(info.notaImdb);
        setMetascore(info.metascore);
        setAvaliacoes(info.avaliacoes.map((av: { fonte: string; valor: string }) => ({
          fonte: av.fonte,
          valor: av.valor,
        })));
      }
    } catch (error) {
      console.error('Erro ao buscar informações do filme:', error);
      setMensagemModal(MENSAGENS_ERRO.ERRO_BUSCAR_FILME);
      setTipoModal('erro');
      setExibirModal(true);
    } finally {
      setCarregando(false);
    }
  };

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
    if (!validarCampos()) return;

    if (!usuario) {
      setMensagemModal('Usuário não autenticado');
      setTipoModal('erro');
      setExibirModal(true);
      return;
    }

    setCarregando(true);

    try {
      const idFilme = await filmeService.criar({
        titulo,
        duracao,
        genero,
        ano,
        sinopse,
        notaImdb,
        metascore,
        avaliacoes,
        assistido,
        usuario: usuario.email,
      });

      // Se o usuário deu uma nota, adiciona a avaliação
      if (notaUsuario > 0 && usuario) {
        await filmeService.atualizarAvaliacaoUsuario(
          idFilme,
          usuario.email,
          notaUsuario,
          comentarioUsuario
        );
      }

      setMensagemModal(MENSAGENS_SUCESSO.FILME_SALVO);
      setTipoModal('sucesso');
      setExibirModal(true);
    } catch (error) {
      console.error('Erro ao salvar filme:', error);
      setMensagemModal(MENSAGENS_ERRO.ERRO_SALVAR_FILME);
      setTipoModal('erro');
      setExibirModal(true);
    } finally {
      setCarregando(false);
    }
  };

  const handleFecharModal = () => {
    setExibirModal(false);
    if (tipoModal === 'sucesso') {
      navigate('/lista');
    }
  };

  return (
    <>
      <Header />
      <div className="adicionar-container">
        <h2 className="adicionar-titulo">Adicionar Filme</h2>

        <div className="adicionar-form">
          <div className="form-grupo">
            <label htmlFor="titulo">Título * TESTE PRA VALIDAR DEPLOY</label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => handleBuscarFilme(e.target.value)}
              placeholder="Digite o título do filme (mínimo 2 caracteres)"
              disabled={carregando}
            />

            {erroApi && (
              <div className="mensagem-erro-busca">
                {erroApi}
              </div>
            )}

            {carregandoApi && titulo.length >= 2 && (
              <div className="mensagem-carregando">
                Buscando filmes...
              </div>
            )}

            {resultados.length > 0 && (
              <div className="dropdown-resultados">
                {resultados.map((filme) => (
                  <div
                    key={filme.id}
                    className="resultado-item"
                    onClick={() => handleSelecionarFilme(filme)}
                  >
                    {filme.poster_path && (
                      <img
                        src={`${TMDB_IMAGE_BASE_URL}${filme.poster_path}`}
                        alt={filme.title}
                        className="resultado-poster"
                      />
                    )}
                    <div className="resultado-info">
                      <h4>{filme.title}</h4>
                      <p className="resultado-ano">
                        {new Date(filme.release_date).getFullYear()}
                      </p>
                      <p className="resultado-sinopse">{filme.overview}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-grupo-checkbox">
            <input
              id="assistido"
              type="checkbox"
              checked={assistido}
              onChange={(e) => setAssistido(e.target.checked)}
              disabled={carregando}
            />
            <label htmlFor="assistido">Assistido</label>
          </div>

          <div className="form-linha">
            <div className="form-grupo">
              <label htmlFor="ano">Ano *</label>
              <input
                id="ano"
                type="text"
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                placeholder="Ex: 2024"
                disabled={carregando}
              />
            </div>

            <div className="form-grupo">
              <label htmlFor="duracao">Duração (min) *</label>
              <input
                id="duracao"
                type="text"
                value={duracao}
                onChange={(e) => setDuracao(e.target.value)}
                placeholder="Ex: 120"
                disabled={carregando}
              />
            </div>
          </div>

          <div className="form-grupo">
            <label htmlFor="genero">Gênero *</label>
            <input
              id="genero"
              type="text"
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
              placeholder="Ex: Ação, Drama"
              disabled={carregando}
            />
          </div>

          <div className="form-linha">
            <div className="form-grupo">
              <label htmlFor="notaImdb">Nota IMDB</label>
              <input
                id="notaImdb"
                type="text"
                value={notaImdb}
                onChange={(e) => setNotaImdb(e.target.value)}
                placeholder="Ex: 8.5"
                disabled={carregando}
              />
            </div>

            <div className="form-grupo">
              <label htmlFor="metascore">Metascore</label>
              <input
                id="metascore"
                type="text"
                value={metascore}
                onChange={(e) => setMetascore(e.target.value)}
                placeholder="Ex: 85"
                disabled={carregando}
              />
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
              onChange={(e) => setSinopse(e.target.value)}
              placeholder="Digite a sinopse do filme"
              rows={5}
              disabled={carregando}
            />
          </div>

          <div className="form-grupo">
            <label>Sua Avaliação (Opcional)</label>
            <AvaliacaoEstrelas
              nota={notaUsuario}
              aoMudarNota={setNotaUsuario}
              somenteLeitura={carregando}
            />
            {notaUsuario > 0 && (
              <p className="texto-ajuda">
                Você está avaliando este filme com nota {notaUsuario}/10
              </p>
            )}
          </div>

          {notaUsuario > 0 && (
            <div className="form-grupo">
              <label htmlFor="comentarioUsuario">Observação da Avaliação (Opcional)</label>
              <textarea
                id="comentarioUsuario"
                value={comentarioUsuario}
                onChange={(e) => setComentarioUsuario(e.target.value)}
                placeholder="Adicione um comentário sobre sua avaliação..."
                rows={3}
                disabled={carregando}
                className="textarea-comentario"
              />
            </div>
          )}

          <div className="form-acoes">
            <button
              type="button"
              className="btn-cancelar"
              onClick={() => navigate('/lista')}
              disabled={carregando}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-salvar"
              onClick={handleSalvarFilme}
              disabled={carregando || carregandoApi}
            >
              {carregando ? 'Salvando...' : 'Salvar Filme'}
            </button>
          </div>
        </div>

        {(carregando || carregandoApi) && (
          <div className="overlay-carregando">
            <Carregando mensagem="Processando..." />
          </div>
        )}
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

export default AdicionarFilme;

