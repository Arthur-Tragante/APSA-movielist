import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Modal, Carregando, AvaliacaoEstrelas } from '../../components';
import { useAuth } from '../../hooks';
import { showService } from '../../services';
import { Avaliacao } from '../../types';
import { MENSAGENS_ERRO, MENSAGENS_SUCESSO } from '../../constants';
import './AdicionarShow.css';

/**
 * Página de cadastro de séries
 */
const AdicionarShow: React.FC = () => {
  const navigate = useNavigate();
  const { obterUsuarioLogado } = useAuth();

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
  const [carregando, setCarregando] = useState(false);
  const [exibirModal, setExibirModal] = useState(false);
  const [mensagemModal, setMensagemModal] = useState('');
  const [tipoModal, setTipoModal] = useState<'sucesso' | 'erro' | 'informacao'>('informacao');
  
  const checkboxLockRef = useRef(false);
  const usuario = obterUsuarioLogado();

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
    if (!validarCampos()) return;

    if (!usuario) {
      setMensagemModal('Usuário não autenticado');
      setTipoModal('erro');
      setExibirModal(true);
      return;
    }

    setCarregando(true);

    try {
      const idShow = await showService.criar({
        titulo,
        temporadas,
        genero,
        ano,
        sinopse,
        notaImdb: notaImdb || 'N/A',
        metascore: metascore || 'N/A',
        poster: poster || '',
        avaliacoes,
        usuario: usuario.nome,
        assistido,
      });

      if (notaUsuario > 0) {
        await showService.atualizarAvaliacaoUsuario(
          idShow,
          usuario.email,
          usuario.nome,
          notaUsuario,
          assistido,
          comentarioUsuario
        );
      }

      setMensagemModal(MENSAGENS_SUCESSO.FILME_SALVO);
      setTipoModal('sucesso');
      setExibirModal(true);
      
      setTimeout(() => {
        navigate('/series');
      }, 1500);
    } catch (erro: any) {
      console.error('Erro ao salvar série:', erro);
      setMensagemModal(`Erro ao salvar série: ${erro.message}`);
      setTipoModal('erro');
      setExibirModal(true);
    } finally {
      setCarregando(false);
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
  };

  const handleVoltar = () => {
    navigate('/series');
  };

  if (carregando) {
    return <Carregando />;
  }

  return (
    <div className="pagina-adicionar-show">
      <Header />
      <div className="adicionar-show-container">
        <div className="adicionar-show-header">
          <button onClick={handleVoltar} className="btn-voltar">
            ← Voltar
          </button>
          <h1>Adicionar Nova Série</h1>
        </div>

        <form className="formulario-show" onSubmit={(e) => e.preventDefault()}>
          <div className="form-grupo">
            <label htmlFor="titulo">Título *</label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Digite o título da série"
              required
            />
          </div>

          <div className="form-grupo-inline">
            <div className="form-grupo">
              <label htmlFor="ano">Ano *</label>
              <input
                id="ano"
                type="text"
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                placeholder="Ex: 2020-2023"
                required
              />
            </div>

            <div className="form-grupo">
              <label htmlFor="temporadas">Temporadas *</label>
              <input
                id="temporadas"
                type="text"
                value={temporadas}
                onChange={(e) => setTemporadas(e.target.value)}
                placeholder="Ex: 5"
                required
              />
            </div>

            <div className="form-grupo">
              <label htmlFor="genero">Gênero *</label>
              <input
                id="genero"
                type="text"
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                placeholder="Ex: Drama, Terror"
                required
              />
            </div>
          </div>

          <div className="form-grupo-inline">
            <div className="form-grupo">
              <label htmlFor="notaImdb">Nota IMDB</label>
              <input
                id="notaImdb"
                type="text"
                value={notaImdb}
                onChange={(e) => setNotaImdb(e.target.value)}
                placeholder="Ex: 8.5"
              />
            </div>

            <div className="form-grupo">
              <label htmlFor="metascore">Metascore</label>
              <input
                id="metascore"
                type="text"
                value={metascore}
                onChange={(e) => setMetascore(e.target.value)}
                placeholder="Ex: 75"
              />
            </div>
          </div>

          <div className="form-grupo">
            <label htmlFor="poster">URL da Capa</label>
            <input
              id="poster"
              type="text"
              value={poster}
              onChange={(e) => setPoster(e.target.value)}
              placeholder="URL da imagem da capa"
            />
          </div>

          <div className="form-grupo">
            <label htmlFor="sinopse">Sinopse</label>
            <textarea
              id="sinopse"
              value={sinopse}
              onChange={(e) => setSinopse(e.target.value)}
              placeholder="Descrição da série"
              rows={5}
            />
          </div>

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

          {assistido && (
            <div className="secao-avaliacao-usuario">
              <h3>Sua Avaliação</h3>
              
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
          )}

          <div className="form-acoes">
            <button
              type="button"
              onClick={handleVoltar}
              className="btn-cancelar"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSalvarShow}
              className="btn-salvar"
              disabled={carregando}
            >
              {carregando ? 'Salvando...' : 'Salvar Série'}
            </button>
          </div>
        </form>
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

export default AdicionarShow;


