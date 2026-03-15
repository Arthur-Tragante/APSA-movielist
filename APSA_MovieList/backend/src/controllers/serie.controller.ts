import { Response, NextFunction } from 'express';
import { serieService } from '../services';
import { RequisicaoAutenticada, CriarSerieDTO, AtualizarSerieDTO, AvaliarSerieDTO, Episodio, AvaliarEpisodioDTO } from '../types';
import { MENSAGENS_SUCESSO } from '../constants/mensagens.constants';

/**
 * Controller para operações de séries
 */
class SerieController {
  /**
   * Lista todas as séries do sistema
   * GET /api/series
   */
  async listar(_req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const series = await serieService.buscarTodas();

      res.json({
        sucesso: true,
        dados: series,
      });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Busca uma série específica
   * GET /api/series/:id
   */
  async buscarPorId(req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;

      // Permite visualizar qualquer série (sem restrição de proprietário)
      const serie = await serieService.buscarPorId(id);

      res.json({
        sucesso: true,
        dados: serie,
      });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Cria uma nova série
   * POST /api/series
   */
  async criar(req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const emailUsuario = req.usuario!.email;
      const dadosSerie: CriarSerieDTO = req.body;

      const idSerie = await serieService.criar(emailUsuario, dadosSerie);

      res.status(201).json({
        sucesso: true,
        mensagem: MENSAGENS_SUCESSO.SERIE_CRIADA,
        dados: { id: idSerie },
      });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Atualiza uma série existente
   * PUT /api/series/:id
   */
  async atualizar(req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      const emailUsuario = req.usuario!.email;
      const dadosSerie: AtualizarSerieDTO = req.body;

      await serieService.atualizar(id, emailUsuario, dadosSerie);

      res.json({
        sucesso: true,
        mensagem: MENSAGENS_SUCESSO.SERIE_ATUALIZADA,
      });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Deleta uma série
   * DELETE /api/series/:id
   */
  async deletar(req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      const emailUsuario = req.usuario!.email;

      await serieService.deletar(id, emailUsuario);

      res.json({
        sucesso: true,
        mensagem: MENSAGENS_SUCESSO.SERIE_DELETADA,
      });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Avalia uma série
   * POST /api/series/:id/avaliar
   */
  async avaliar(req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      const emailUsuario = req.usuario!.email;
      const nomeUsuario = req.usuario!.nome || emailUsuario.split('@')[0];
      const { nota, comentario }: AvaliarSerieDTO = req.body;

      await serieService.atualizarAvaliacaoUsuario(
        id,
        emailUsuario,
        nomeUsuario,
        nota,
        comentario
      );

      res.json({
        sucesso: true,
        mensagem: MENSAGENS_SUCESSO.SERIE_AVALIACAO_SALVA,
      });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Remove avaliação de uma série
   * DELETE /api/series/:id/avaliar
   */
  async removerAvaliacao(req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      const emailUsuario = req.usuario!.email;

      await serieService.removerAvaliacaoUsuario(id, emailUsuario);

      res.json({
        sucesso: true,
        mensagem: MENSAGENS_SUCESSO.SERIE_AVALIACAO_REMOVIDA,
      });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Adiciona um episódio a uma série
   * POST /api/series/:id/episodios
   */
  async adicionarEpisodio(req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      const emailUsuario = req.usuario!.email;
      const { numeroTemporada, episodio }: { numeroTemporada: number; episodio: Episodio } = req.body;

      if (!numeroTemporada || !episodio) {
        return res.status(400).json({
          sucesso: false,
          erro: 'numeroTemporada e episodio são obrigatórios',
        });
      }

      await serieService.adicionarEpisodio(id, emailUsuario, numeroTemporada, episodio);

      res.json({
        sucesso: true,
        mensagem: MENSAGENS_SUCESSO.EPISODIO_ADICIONADO,
      });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Remove um episódio de uma série
   * DELETE /api/series/:id/episodios/:temporada/:episodio
   */
  async removerEpisodio(req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id, temporada, episodio } = req.params;
      const emailUsuario = req.usuario!.email;
      const numeroTemporada = parseInt(temporada, 10);
      const numeroEpisodio = parseInt(episodio, 10);

      if (isNaN(numeroTemporada) || isNaN(numeroEpisodio)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'numeroTemporada e numeroEpisodio devem ser números',
        });
      }

      await serieService.removerEpisodio(id, emailUsuario, numeroTemporada, numeroEpisodio);

      res.json({
        sucesso: true,
        mensagem: MENSAGENS_SUCESSO.EPISODIO_REMOVIDO,
      });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Avalia um episódio
   * POST /api/series/:id/episodios/:temporada/:episodio/avaliar
   */
  async avaliarEpisodio(req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id, temporada, episodio } = req.params;
      const emailUsuario = req.usuario!.email;
      const nomeUsuario = req.usuario!.nome || emailUsuario.split('@')[0];
      const { nota, comentario }: AvaliarEpisodioDTO = req.body;
      const numeroTemporada = parseInt(temporada, 10);
      const numeroEpisodio = parseInt(episodio, 10);

      if (isNaN(numeroTemporada) || isNaN(numeroEpisodio)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'numeroTemporada e numeroEpisodio devem ser números',
        });
      }

      await serieService.avaliarEpisodio(
        id,
        emailUsuario,
        nomeUsuario,
        numeroTemporada,
        numeroEpisodio,
        nota,
        comentario
      );

      res.json({
        sucesso: true,
        mensagem: MENSAGENS_SUCESSO.EPISODIO_AVALIADO,
      });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Remove avaliação de um episódio
   * DELETE /api/series/:id/episodios/:temporada/:episodio/avaliar
   */
  async removerAvaliacaoEpisodio(req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id, temporada, episodio } = req.params;
      const emailUsuario = req.usuario!.email;
      const numeroTemporada = parseInt(temporada, 10);
      const numeroEpisodio = parseInt(episodio, 10);

      if (isNaN(numeroTemporada) || isNaN(numeroEpisodio)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'numeroTemporada e numeroEpisodio devem ser números',
        });
      }

      await serieService.removerAvaliacaoEpisodio(id, emailUsuario, numeroTemporada, numeroEpisodio);

      res.json({
        sucesso: true,
        mensagem: MENSAGENS_SUCESSO.EPISODIO_AVALIACAO_REMOVIDA,
      });
    } catch (erro) {
      next(erro);
    }
  }
  /**
   * POST /api/series/sortear
   * Recebe lista de séries do frontend e realiza o sorteio
   */
  async sortearSerie(req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const { series, webhook } = req.body;
      if (!series || !Array.isArray(series) || series.length === 0) {
        throw new Error('Nenhuma série enviada para o sorteio.');
      }
      const resultado = await serieService.sortearSeriesEnviadas(series, webhook);
      res.json({
        sucesso: true,
        mensagem: `Sorteio encerrado! O vencedor foi: ${resultado.vencedor}`,
        dados: resultado
      });
    } catch (erro: any) {
      next(erro);
    }
  }
}

export default new SerieController();
