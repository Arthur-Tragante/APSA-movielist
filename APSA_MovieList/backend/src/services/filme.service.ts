import { filmeRepository } from '../repositories';
import { Filme, CriarFilmeDTO, AtualizarFilmeDTO } from '../types';
import { MENSAGENS_ERRO } from '../constants/mensagens.constants';
import cacheService from './cache.service';
import { CACHE_PREFIXES } from '../constants/api.constants';

/**
 * Service com lógica de negócio para filmes
 */
class FilmeService {
  /**
   * Busca todos os filmes do usuário
   */
  async buscarFilmesUsuario(emailUsuario: string): Promise<Filme[]> {
    const chaveCache = `${CACHE_PREFIXES.FILMES_USUARIO}${emailUsuario}`;

    // Verifica cache
    const cacheado = await cacheService.obter(chaveCache);
    if (cacheado) {
      return JSON.parse(cacheado);
    }

    const filmes = await filmeRepository.buscarPorUsuario(emailUsuario);

    // Salva no cache (5 minutos)
    await cacheService.definir(chaveCache, JSON.stringify(filmes), 300);

    return filmes;
  }

  /**
   * Busca filme por ID
   */
  async buscarPorId(id: string, emailUsuario?: string): Promise<Filme> {
    const chaveCache = `${CACHE_PREFIXES.FILME}${id}`;

    // Verifica cache
    const cacheado = await cacheService.obter(chaveCache);
    if (cacheado) {
      const filme: Filme = JSON.parse(cacheado);
      
      // Valida permissão se email fornecido
      if (emailUsuario && filme.usuario !== emailUsuario) {
        throw new Error(MENSAGENS_ERRO.USUARIO_NAO_AUTORIZADO);
      }
      
      return filme;
    }

    const filme = await filmeRepository.buscarPorId(id);

    if (!filme) {
      throw new Error(MENSAGENS_ERRO.FILME_NAO_ENCONTRADO);
    }

    // Valida permissão se email fornecido
    if (emailUsuario && filme.usuario !== emailUsuario) {
      throw new Error(MENSAGENS_ERRO.USUARIO_NAO_AUTORIZADO);
    }

    // Salva no cache (5 minutos)
    await cacheService.definir(chaveCache, JSON.stringify(filme), 300);

    return filme;
  }

  /**
   * Cria um novo filme
   */
  async criar(emailUsuario: string, dadosFilme: CriarFilmeDTO): Promise<string> {
    // Validações
    this.validarDadosFilme(dadosFilme);

    const idFilme = await filmeRepository.criar(emailUsuario, dadosFilme);

    // Invalida cache do usuário
    await this.invalidarCacheUsuario(emailUsuario);

    return idFilme;
  }

  /**
   * Atualiza um filme existente
   */
  async atualizar(
    id: string,
    emailUsuario: string,
    dadosFilme: AtualizarFilmeDTO
  ): Promise<void> {
    // Verifica se filme existe e se usuário tem permissão
    const filme = await this.buscarPorId(id, emailUsuario);

    if (filme.usuario !== emailUsuario) {
      throw new Error(MENSAGENS_ERRO.USUARIO_NAO_AUTORIZADO);
    }

    // Validações parciais
    if (dadosFilme.titulo !== undefined && !dadosFilme.titulo.trim()) {
      throw new Error('Título não pode ser vazio');
    }

    await filmeRepository.atualizar(id, dadosFilme);

    // Invalida caches
    await this.invalidarCacheFilme(id);
    await this.invalidarCacheUsuario(emailUsuario);
  }

  /**
   * Deleta um filme
   */
  async deletar(id: string, emailUsuario: string): Promise<void> {
    // Verifica se filme existe e se usuário tem permissão
    const filme = await this.buscarPorId(id, emailUsuario);

    if (filme.usuario !== emailUsuario) {
      throw new Error(MENSAGENS_ERRO.USUARIO_NAO_AUTORIZADO);
    }

    await filmeRepository.deletar(id);

    // Invalida caches
    await this.invalidarCacheFilme(id);
    await this.invalidarCacheUsuario(emailUsuario);
  }

  /**
   * Adiciona ou atualiza avaliação de usuário
   */
  async avaliarFilme(
    idFilme: string,
    emailUsuario: string,
    nomeUsuario: string,
    nota: number,
    comentario?: string
  ): Promise<void> {
    // Validações
    if (nota < 0 || nota > 10) {
      throw new Error(MENSAGENS_ERRO.NOTA_FORA_INTERVALO);
    }

    if (nota % 0.5 !== 0) {
      throw new Error('Nota deve ser múltiplo de 0.5 (ex: 7.5, 8.0, 8.5)');
    }

    await filmeRepository.atualizarAvaliacaoUsuario(
      idFilme,
      emailUsuario,
      nomeUsuario,
      nota,
      comentario
    );

    // Invalida cache do filme
    await this.invalidarCacheFilme(idFilme);

    // Invalida cache de todos os usuários que têm o filme
    const filme = await filmeRepository.buscarPorId(idFilme);
    if (filme) {
      await this.invalidarCacheUsuario(filme.usuario);
    }
  }

  /**
   * Remove avaliação de usuário
   */
  async removerAvaliacao(idFilme: string, emailUsuario: string): Promise<void> {
    await filmeRepository.removerAvaliacaoUsuario(idFilme, emailUsuario);

    // Invalida cache do filme
    await this.invalidarCacheFilme(idFilme);

    // Invalida cache do usuário dono do filme
    const filme = await filmeRepository.buscarPorId(idFilme);
    if (filme) {
      await this.invalidarCacheUsuario(filme.usuario);
    }
  }

  /**
   * Valida dados obrigatórios do filme
   */
  private validarDadosFilme(dados: CriarFilmeDTO): void {
    if (!dados.titulo || !dados.titulo.trim()) {
      throw new Error('Título é obrigatório');
    }

    if (!dados.duracao || !dados.duracao.trim()) {
      throw new Error('Duração é obrigatória');
    }

    if (!dados.genero || !dados.genero.trim()) {
      throw new Error('Gênero é obrigatório');
    }

    if (!dados.ano || !dados.ano.trim()) {
      throw new Error('Ano é obrigatório');
    }

    // Valida formato do ano
    const anoNumero = parseInt(dados.ano, 10);
    if (isNaN(anoNumero) || anoNumero < 1800 || anoNumero > new Date().getFullYear() + 5) {
      throw new Error('Ano inválido');
    }
  }

  /**
   * Invalida cache de um filme
   */
  private async invalidarCacheFilme(idFilme: string): Promise<void> {
    await cacheService.remover(`${CACHE_PREFIXES.FILME}${idFilme}`);
  }

  /**
   * Invalida cache de filmes do usuário
   */
  private async invalidarCacheUsuario(emailUsuario: string): Promise<void> {
    await cacheService.remover(`${CACHE_PREFIXES.FILMES_USUARIO}${emailUsuario}`);
  }
}

export default new FilmeService();

