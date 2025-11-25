import { Response, NextFunction } from 'express';
import { serieService } from '../services';
import { RequisicaoAutenticada, CriarSerieDTO, AtualizarSerieDTO, AvaliarSerieDTO, Episodio, AvaliarEpisodioDTO } from '../types';

/**
 * Controller para operações de séries
 */
class SerieController {
  /**
   * Lista todas as séries do usuário
   * GET /api/series
   */
  async listar(req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const emailUsuario = req.usuario!.email;
      const series = await serieService.buscarSeriesUsuario(emailUsuario);

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
      const emailUsuario = req.usuario!.email;

      const serie = await serieService.buscarPorId(id, emailUsuario);

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
        mensagem: 'Série criada com sucesso',
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
        mensagem: 'Série atualizada com sucesso',
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
        mensagem: 'Série deletada com sucesso',
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
      const nomeUsuario = req.usuario!.nome || '';
      const { nota, comentario }: AvaliarSerieDTO = req.body;

      if (!nota || nota < 0 || nota > 10) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Nota deve estar entre 0 e 10',
        });
      }

      await serieService.atualizarAvaliacaoUsuario(
        id,
        emailUsuario,
        nomeUsuario,
        nota,
        comentario
      );

      res.json({
        sucesso: true,
        mensagem: 'Avaliação registrada com sucesso',
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
        mensagem: 'Avaliação removida com sucesso',
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
        mensagem: 'Episódio adicionado com sucesso',
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
        mensagem: 'Episódio removido com sucesso',
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
      const nomeUsuario = req.usuario!.nome || '';
      const { nota, comentario }: AvaliarEpisodioDTO = req.body;
      const numeroTemporada = parseInt(temporada, 10);
      const numeroEpisodio = parseInt(episodio, 10);

      if (isNaN(numeroTemporada) || isNaN(numeroEpisodio)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'numeroTemporada e numeroEpisodio devem ser números',
        });
      }

      if (!nota || nota < 0 || nota > 10) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Nota deve estar entre 0 e 10',
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
        mensagem: 'Episódio avaliado com sucesso',
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
        mensagem: 'Avaliação do episódio removida com sucesso',
      });
    } catch (erro) {
      next(erro);
    }
  }
}

export default new SerieController();
