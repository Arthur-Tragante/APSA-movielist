import { filmeRepository } from '../repositories';
import { Filme, CriarFilmeDTO, AtualizarFilmeDTO } from '../types';
import { MENSAGENS_ERRO } from '../constants/mensagens.constants';
import cacheService from './cache.service';
import { CACHE_PREFIXES } from '../constants/api.constants';
import axios from 'axios';

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
   * Sorteia filmes até um deles vencer 5 vezes. Registra no Discord e retorna resultado completo.
   */
  async sortearFilme(webhookUrl: string): Promise<{ vencedor: string; sorteios: string[]; totais: Record<string, number>; }> {
    // Busca todos os filmes salvos (pode-se ajustar para pegar do repositório referente ao sorteio, aqui vou usar todos mesmo)
    const filmesDoc = await filmeRepository.buscarTodos();
    const titulos: string[] = filmesDoc.map(filme => filme.titulo);

    if (!titulos.length) {
      throw new Error('Não há filmes para sortear');
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
    for (const filme of filmesDoc) {
      await filmeRepository.deletar(filme.id);
    }

    // Dispara resultado no Discord
    const mensagem = `🎬 Resultado do Sorteio:\n\nVencedor: ${vencedor}\n\nSorteios:\n${sorteios.map((t, i) => `${i + 1}. ${t}`).join(' \n')}`;
    if (webhookUrl) {
      console.log('Tentando enviar webhook Discord:', webhookUrl, '\nConteúdo:', mensagem);
      try {
        await axios.post(webhookUrl, { content: mensagem });
        console.log('✅ Webhook Discord enviado com sucesso:', webhookUrl);
      } catch (error: any) {
        if (error.response) {
          console.error('❌ Erro ao enviar webhook Discord:', error.response.status, error.response.data);
        } else {
          console.error('❌ Erro ao enviar webhook Discord:', error.message);
        }
      }
    } else {
      console.warn('Webhook Discord não informado, não será enviado!');
    }

    return { vencedor, sorteios, totais };
  }

  /**
   * Sorteia entre uma lista fornecida de filmes.
   */
  async sortearFilmesEnviados(filmes: any[], webhookUrl: string): Promise<{ vencedor: string; sorteios: string[]; totais: Record<string, number> }> {
    const titulos: string[] = filmes.map(f => typeof f === 'string' ? f : (f.titulo || f.title || f.nome || f));
    if (!titulos.length) {
      throw new Error('Nenhum filme para sortear');
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

    // Calcula ranking dos mais sorteados
    const ranking = Object.entries(totais)
      .sort((a, b) => b[1] - a[1])
      .map(([titulo, vezes]) => ({ titulo, vezes }));

    // Top sorteados na ordem decrescente
    const ordemTop = ranking.map(r => r.titulo);

    // Mensagem detalhada para o Discord com embed
    const rankingText = ranking
      .map((item, idx) => `${idx + 1}. ${item.titulo} (${item.vezes} vezes)`)
      .join('\n');

    const embed = {
      title: '🎬 Resultado do Sorteio',
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

    // Texto simples com emojis (enviado como conteúdo 'content') para canais que não exibem embeds
    const mensagemTexto = [
      `🎬 Resultado do Sorteio:\n`,
      `🏆 Vencedor: ${vencedor}\n`,
      `\n📋 Ranking Completo:\n${rankingText || 'N/A'}`
    ].join('\n');

    if (webhookUrl) {
      try {
        // Envia tanto o conteúdo simples (com emojis) quanto o embed para melhor compatibilidade
        await axios.post(webhookUrl, { content: mensagemTexto, embeds: [embed] });
        console.log('✅ Webhook Discord enviado com sucesso (content + embed):', webhookUrl);
      } catch (erro: any) {
        if (erro.response) {
          console.error('❌ Erro ao enviar webhook Discord:', erro.response.status, erro.response.data);
        } else {
          console.error('❌ Erro ao enviar webhook Discord:', erro.message || erro);
        }
        // Não lança erro para não quebrar o sorteio se o webhook falhar
      }
    }

    return { vencedor, sorteios: ordemTop, totais };
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

