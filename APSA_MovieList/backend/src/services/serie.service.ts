import { serieRepository } from '../repositories';
import { Serie, CriarSerieDTO, AtualizarSerieDTO, Episodio } from '../types';
import cacheService from './cache.service';
import { CACHE_PREFIXES } from '../constants/api.constants';

/**
 * Service com lógica de negócio para séries
 */
class SerieService {
  /**
   * Busca todas as séries do usuário
   */
  async buscarSeriesUsuario(emailUsuario: string): Promise<Serie[]> {
    const chaveCache = `${CACHE_PREFIXES.SERIES_USUARIO}${emailUsuario}`;

    // Verifica cache
    const cacheado = await cacheService.obter(chaveCache);
    if (cacheado) {
      return JSON.parse(cacheado);
    }

    const series = await serieRepository.buscarPorUsuario(emailUsuario);

    // Salva no cache (5 minutos)
    await cacheService.definir(chaveCache, JSON.stringify(series), 300);

    return series;
  }

  /**
   * Busca série por ID
   */
  async buscarPorId(id: string): Promise<Serie> {
    const chaveCache = `${CACHE_PREFIXES.SERIE}${id}`;

    // Verifica cache
    const cacheado = await cacheService.obter(chaveCache);
    if (cacheado) {
      return JSON.parse(cacheado);
    }

    const serie = await serieRepository.buscarPorId(id);

    if (!serie) {
      throw new Error('Série não encontrada');
    }

    // Salva no cache (5 minutos)
    await cacheService.definir(chaveCache, JSON.stringify(serie), 300);

    return serie;
  }

  /**
   * Cria uma nova série
   */
  async criar(emailUsuario: string, dadosSerie: CriarSerieDTO): Promise<string> {
    // Validações
    this.validarDadosSerie(dadosSerie);

    const idSerie = await serieRepository.criar(emailUsuario, dadosSerie);

    // Invalida cache do usuário
    await this.invalidarCacheUsuario(emailUsuario);

    return idSerie;
  }

  /**
   * Atualiza uma série existente
   */
  async atualizar(
    id: string,
    emailUsuario: string,
    dadosSerie: AtualizarSerieDTO
  ): Promise<void> {
    // Verifica se série existe
    await this.buscarPorId(id);

    // Validações parciais
    if (dadosSerie.titulo !== undefined && !dadosSerie.titulo.trim()) {
      throw new Error('Título não pode ser vazio');
    }

    if (dadosSerie.temporadas !== undefined && !dadosSerie.temporadas.toString().trim()) {
      throw new Error('Número de temporadas não pode ser vazio');
    }

    if (dadosSerie.genero !== undefined && !dadosSerie.genero.trim()) {
      throw new Error('Gênero não pode ser vazio');
    }

    await serieRepository.atualizar(id, dadosSerie);

    // Invalida caches
    await this.invalidarCache(id, emailUsuario);
  }

  /**
   * Deleta uma série
   */
  async deletar(id: string, emailUsuario: string): Promise<void> {
    // Verifica se série existe
    await this.buscarPorId(id);

    await serieRepository.deletar(id);

    // Invalida caches
    await this.invalidarCache(id, emailUsuario);
  }

  /**
   * Atualiza avaliação de usuário
   */
  async atualizarAvaliacaoUsuario(
    idSerie: string,
    emailUsuario: string,
    nomeUsuario: string,
    nota: number,
    comentario?: string
  ): Promise<void> {
    // Verifica se série existe
    await this.buscarPorId(idSerie);

    // Valida nota
    if (nota < 0 || nota > 10) {
      throw new Error('Nota deve estar entre 0 e 10');
    }

    await serieRepository.atualizarAvaliacaoUsuario(
      idSerie,
      emailUsuario,
      nomeUsuario,
      nota,
      comentario
    );

    // Invalida cache
    const chaveCache = `${CACHE_PREFIXES.SERIE}${idSerie}`;
    await cacheService.remover(chaveCache);
  }

  /**
   * Remove avaliação de usuário
   */
  async removerAvaliacaoUsuario(idSerie: string, emailUsuario: string): Promise<void> {
    // Verifica se série existe
    await this.buscarPorId(idSerie);

    await serieRepository.removerAvaliacaoUsuario(idSerie, emailUsuario);

    // Invalida cache
    const chaveCache = `${CACHE_PREFIXES.SERIE}${idSerie}`;
    await cacheService.remover(chaveCache);
  }

  /**
   * Validações dos dados da série
   */
  private validarDadosSerie(dados: CriarSerieDTO): void {
    if (!dados.titulo?.trim()) {
      throw new Error('Título é obrigatório');
    }

    if (!dados.temporadas?.toString().trim()) {
      throw new Error('Número de temporadas é obrigatório');
    }

    if (!dados.genero?.trim()) {
      throw new Error('Gênero é obrigatório');
    }

    if (!dados.ano?.trim()) {
      throw new Error('Ano é obrigatório');
    }
  }

  /**
   * Invalida cache de série
   */
  private async invalidarCache(idSerie: string, emailUsuario: string): Promise<void> {
    const chaveCache = `${CACHE_PREFIXES.SERIE}${idSerie}`;
    const chaveCacheUsuario = `${CACHE_PREFIXES.SERIES_USUARIO}${emailUsuario}`;

    await Promise.all([
      cacheService.remover(chaveCache),
      cacheService.remover(chaveCacheUsuario),
    ]);
  }

  /**
   * Invalida cache do usuário
   */
  private async invalidarCacheUsuario(emailUsuario: string): Promise<void> {
    const chaveCacheUsuario = `${CACHE_PREFIXES.SERIES_USUARIO}${emailUsuario}`;
    await cacheService.remover(chaveCacheUsuario);
  }

  /**
   * Adiciona um episódio a uma série
   */
  async adicionarEpisodio(
    idSerie: string,
    emailUsuario: string,
    numeroTemporada: number,
    episodio: Episodio
  ): Promise<void> {
    // Verifica se série existe
    await this.buscarPorId(idSerie);

    await serieRepository.adicionarEpisodio(idSerie, numeroTemporada, episodio);

    // Invalida cache
    await this.invalidarCache(idSerie, emailUsuario);
  }

  /**
   * Remove um episódio de uma série
   */
  async removerEpisodio(
    idSerie: string,
    emailUsuario: string,
    numeroTemporada: number,
    numeroEpisodio: number
  ): Promise<void> {
    // Verifica se série existe
    await this.buscarPorId(idSerie);

    await serieRepository.removerEpisodio(idSerie, numeroTemporada, numeroEpisodio);

    // Invalida cache
    await this.invalidarCache(idSerie, emailUsuario);
  }

  /**
   * Avalia um episódio
   */
  async avaliarEpisodio(
    idSerie: string,
    emailUsuario: string,
    nomeUsuario: string,
    numeroTemporada: number,
    numeroEpisodio: number,
    nota: number,
    comentario?: string
  ): Promise<void> {
    // Verifica se série existe
    await this.buscarPorId(idSerie);

    // Valida nota
    if (nota < 0 || nota > 10) {
      throw new Error('Nota deve estar entre 0 e 10');
    }

    await serieRepository.avaliarEpisodio(
      idSerie,
      numeroTemporada,
      numeroEpisodio,
      emailUsuario,
      nomeUsuario,
      nota,
      comentario
    );

    // Invalida cache
    const chaveCache = `${CACHE_PREFIXES.SERIE}${idSerie}`;
    await cacheService.remover(chaveCache);
  }

  /**
   * Remove avaliação de um episódio
   */
  async removerAvaliacaoEpisodio(
    idSerie: string,
    emailUsuario: string,
    numeroTemporada: number,
    numeroEpisodio: number
  ): Promise<void> {
    // Verifica se série existe
    await this.buscarPorId(idSerie);

    await serieRepository.removerAvaliacaoEpisodio(
      idSerie,
      numeroTemporada,
      numeroEpisodio,
      emailUsuario
    );

    // Invalida cache
    const chaveCache = `${CACHE_PREFIXES.SERIE}${idSerie}`;
    await cacheService.remover(chaveCache);
  }
}

export default new SerieService();
