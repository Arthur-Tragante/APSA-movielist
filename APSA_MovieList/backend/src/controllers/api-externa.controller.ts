import { Request, Response, NextFunction } from 'express';
import { apiExternaService } from '../services';

/**
 * Controller para operações com APIs externas
 */
class ApiExternaController {
  /**
   * Busca filmes no TMDB
   * GET /api/buscar/filme?titulo=...
   */
  async buscarFilme(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { titulo } = req.query;

      if (!titulo || typeof titulo !== 'string') {
        return res.status(400).json({
          sucesso: false,
          erro: 'Parâmetro "titulo" é obrigatório',
        });
      }

      const resultados = await apiExternaService.buscarFilme(titulo);

      return res.json({
        sucesso: true,
        dados: resultados,
      });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Busca detalhes de um filme específico no TMDB
   * GET /api/buscar/detalhes/:id
   */
  async buscarDetalhes(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      const { idioma } = req.query;
      const idTmdb = parseInt(id, 10);

      if (isNaN(idTmdb)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'ID inválido',
        });
      }

      const idiomaString = typeof idioma === 'string' ? idioma : 'pt-BR';
      const detalhes = await apiExternaService.buscarDetalhesFilme(idTmdb, idiomaString);

      if (!detalhes) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Filme não encontrado',
        });
      }

      return res.json({
        sucesso: true,
        dados: detalhes,
      });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Busca ratings no OMDB
   * GET /api/buscar/ratings/:imdbId
   */
  async buscarRatings(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { imdbId } = req.params;

      if (!imdbId || !imdbId.startsWith('tt')) {
        return res.status(400).json({
          sucesso: false,
          erro: 'ID do IMDB inválido (deve começar com "tt")',
        });
      }

      const ratings = await apiExternaService.buscarRatings(imdbId);

      return res.json({
        sucesso: true,
        dados: ratings,
      });
    } catch (erro) {
      next(erro);
    }
  }
}

export default new ApiExternaController();

