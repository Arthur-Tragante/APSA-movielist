import { serieRepository } from '../repositories';
import { Serie, CriarSerieDTO, AtualizarSerieDTO, Episodio } from '../types';
import { MENSAGENS_ERRO } from '../constants/mensagens.constants';
import cacheService from './cache.service';
import { CACHE_PREFIXES } from '../constants/api.constants';
import axios from 'axios';

/**
 * Service com lógica de negócio para séries
 */
class SerieService {
  /**
   * Busca TODAS as séries do sistema (independente do usuário)
   */
  async buscarTodas(): Promise<Serie[]> {
    const chaveCache = `${CACHE_PREFIXES.SERIES_USUARIO}todas`;

    const cacheado = await cacheService.obter(chaveCache);
    if (cacheado) {
      return JSON.parse(cacheado);
    }

    const series = await serieRepository.buscarTodas();

    await cacheService.definir(chaveCache, JSON.stringify(series), 300);

    return series;
  }

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
      throw new Error(MENSAGENS_ERRO.SERIE_NAO_ENCONTRADA);
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
      throw new Error(MENSAGENS_ERRO.NOTA_FORA_INTERVALO);
    }

    if (nota % 0.5 !== 0) {
      throw new Error('Nota deve ser múltiplo de 0.5 (ex: 7.5, 8.0, 8.5)');
    }

    await serieRepository.atualizarAvaliacaoUsuario(
      idSerie,
      emailUsuario,
      nomeUsuario,
      nota,
      comentario
    );

    // Invalida cache da série
    await this.invalidarCacheSerie(idSerie);

    // Invalida cache do usuário dono da série
    const serie = await serieRepository.buscarPorId(idSerie);
    if (serie) {
      await this.invalidarCacheUsuario(serie.usuario);
    }
  }

  /**
   * Remove avaliação de usuário
   */
  async removerAvaliacaoUsuario(idSerie: string, emailUsuario: string): Promise<void> {
    // Verifica se série existe
    await this.buscarPorId(idSerie);

    await serieRepository.removerAvaliacaoUsuario(idSerie, emailUsuario);

    // Invalida cache da série
    await this.invalidarCacheSerie(idSerie);

    // Invalida cache do usuário dono da série
    const serie = await serieRepository.buscarPorId(idSerie);
    if (serie) {
      await this.invalidarCacheUsuario(serie.usuario);
    }
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
   * Sorteia séries até uma delas vencer 5 vezes. Registra no Discord e retorna resultado completo.
   */
  async sortearSerie(webhookUrl: string): Promise<{ vencedor: string; sorteios: string[]; totais: Record<string, number> }> {
    const seriesDoc = await serieRepository.buscarTodas();
    const titulos: string[] = seriesDoc.map(serie => serie.titulo);

    if (!titulos.length) {
      throw new Error('Não há séries para sortear');
    }

    const totais: Record<string, number> = {};
    titulos.forEach(t => { totais[t] = 0; });
    const sorteios: string[] = [];
    let vencedor = '';
    let terminou = false;

    function embaralhar(array: string[]): string[] {
      const novo = [...array];
      for (let i = novo.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [novo[i], novo[j]] = [novo[j], novo[i]];
      }
      return novo;
    }

    while (!terminou) {
      const embaralhados = embaralhar(titulos);
      const sorteado = embaralhados[0];
      sorteios.push(sorteado);
      totais[sorteado]++;
      if (totais[sorteado] >= 5) {
        vencedor = sorteado;
        terminou = true;
      }
    }

    // Limpa a coleção após o sorteio
    for (const serie of seriesDoc) {
      await serieRepository.deletar(serie.id);
    }

    // Dispara resultado no Discord
    const mensagem = `📺 Resultado do Sorteio de Séries:\n\nVencedor: ${vencedor}\n\nSorteios:\n${sorteios.map((t, i) => `${i + 1}. ${t}`).join(' \n')}`;
    if (webhookUrl) {
      try {
        await axios.post(webhookUrl, { content: mensagem });
      } catch (error: any) {
        if (error.response) {
          console.error('❌ Erro ao enviar webhook Discord:', error.response.status, error.response.data);
        } else {
          console.error('❌ Erro ao enviar webhook Discord:', error.message);
        }
      }
    }

    return { vencedor, sorteios, totais };
  }

  /**
   * Sorteia entre uma lista fornecida de séries.
   */
  async sortearSeriesEnviadas(series: any[], webhookUrl: string): Promise<{ vencedor: string; sorteios: string[]; totais: Record<string, number> }> {
    const titulos: string[] = series.map(s => typeof s === 'string' ? s : (s.titulo || s.title || s.nome || s));
    if (!titulos.length) {
      throw new Error('Nenhuma série para sortear');
    }

    const totais: Record<string, number> = {};
    titulos.forEach(t => { totais[t] = 0; });
    const sorteios: string[] = [];
    let vencedor = '';
    let terminou = false;

    function embaralhar(array: string[]): string[] {
      const novo = [...array];
      for (let i = novo.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [novo[i], novo[j]] = [novo[j], novo[i]];
      }
      return novo;
    }

    while (!terminou) {
      const embaralhados = embaralhar(titulos);
      const sorteado = embaralhados[0];
      sorteios.push(sorteado);
      totais[sorteado]++;
      if (totais[sorteado] >= 5) {
        vencedor = sorteado;
        terminou = true;
      }
    }

    const ranking = Object.entries(totais)
      .sort((a, b) => b[1] - a[1])
      .map(([titulo, vezes]) => ({ titulo, vezes }));

    const ordemTop = ranking.map(r => r.titulo);

    const rankingText = ranking
      .map((item, idx) => `${idx + 1}. ${item.titulo} (${item.vezes} vezes)`)
      .join('\n');

    const embed = {
      title: '📺 Resultado do Sorteio de Séries',
      color: 3447003,
      fields: [
        {
          name: '🏆 Vencedor',
          value: vencedor,
          inline: false
        },
        {
          name: '📊 Ranking Completo',
          value: rankingText || 'N/A',
          inline: false
        }
      ],
      timestamp: new Date().toISOString()
    };

    const mensagemTexto = [
      `📺 Resultado do Sorteio de Séries:\n`,
      `🏆 Vencedor: ${vencedor}\n`,
      `\n📋 Ranking Completo:\n${rankingText || 'N/A'}`
    ].join('\n');

    if (webhookUrl) {
      try {
        await axios.post(webhookUrl, { content: mensagemTexto, embeds: [embed] });
      } catch (erro: any) {
        if (erro.response) {
          console.error('❌ Erro ao enviar webhook Discord:', erro.response.status, erro.response.data);
        } else {
          console.error('❌ Erro ao enviar webhook Discord:', erro.message || erro);
        }
      }
    }

    return { vencedor, sorteios: ordemTop, totais };
  }

  /**
   * Invalida cache de série
   */
  private async invalidarCache(idSerie: string, emailUsuario: string): Promise<void> {
    await Promise.all([
      this.invalidarCacheSerie(idSerie),
      this.invalidarCacheUsuario(emailUsuario),
    ]);
  }

  /**
   * Invalida cache de uma série específica
   */
  private async invalidarCacheSerie(idSerie: string): Promise<void> {
    await cacheService.remover(`${CACHE_PREFIXES.SERIE}${idSerie}`);
    await cacheService.remover(`${CACHE_PREFIXES.SERIES_USUARIO}todas`);
  }

  /**
   * Invalida cache do usuário
   */
  private async invalidarCacheUsuario(emailUsuario: string): Promise<void> {
    await cacheService.remover(`${CACHE_PREFIXES.SERIES_USUARIO}${emailUsuario}`);
    await cacheService.remover(`${CACHE_PREFIXES.SERIES_USUARIO}todas`);
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
      throw new Error(MENSAGENS_ERRO.NOTA_FORA_INTERVALO);
    }

    if (nota % 0.5 !== 0) {
      throw new Error('Nota deve ser múltiplo de 0.5 (ex: 7.5, 8.0, 8.5)');
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
