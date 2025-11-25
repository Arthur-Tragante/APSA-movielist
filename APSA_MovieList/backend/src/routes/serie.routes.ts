import { Router } from 'express';
import { serieController } from '../controllers';
import { autenticar, validarCorpo, serieSchemas, rateLimiterCriacao } from '../middlewares';

const router = Router();

/**
 * Todas as rotas de séries requerem autenticação
 */
router.use(autenticar);

/**
 * GET /api/series
 * Lista todas as séries do usuário autenticado
 */
router.get('/', serieController.listar);

/**
 * GET /api/series/:id
 * Busca uma série específica
 */
router.get('/:id', serieController.buscarPorId);

/**
 * POST /api/series
 * Cria uma nova série
 */
router.post(
  '/',
  rateLimiterCriacao,
  validarCorpo(serieSchemas.criar),
  serieController.criar
);

/**
 * PUT /api/series/:id
 * Atualiza uma série existente
 */
router.put('/:id', validarCorpo(serieSchemas.atualizar), serieController.atualizar);

/**
 * DELETE /api/series/:id
 * Deleta uma série
 */
router.delete('/:id', serieController.deletar);

/**
 * POST /api/series/:id/avaliar
 * Adiciona ou atualiza avaliação de uma série
 */
router.post('/:id/avaliar', serieController.avaliar);

/**
 * DELETE /api/series/:id/avaliar
 * Remove avaliação de uma série
 */
router.delete('/:id/avaliar', serieController.removerAvaliacao);

/**
 * POST /api/series/:id/episodios
 * Adiciona um episódio a uma série
 */
router.post('/:id/episodios', serieController.adicionarEpisodio);

/**
 * DELETE /api/series/:id/episodios/:temporada/:episodio
 * Remove um episódio de uma série
 */
router.delete('/:id/episodios/:temporada/:episodio', serieController.removerEpisodio);

/**
 * POST /api/series/:id/episodios/:temporada/:episodio/avaliar
 * Avalia um episódio
 */
router.post('/:id/episodios/:temporada/:episodio/avaliar', serieController.avaliarEpisodio);

/**
 * DELETE /api/series/:id/episodios/:temporada/:episodio/avaliar
 * Remove avaliação de um episódio
 */
router.delete('/:id/episodios/:temporada/:episodio/avaliar', serieController.removerAvaliacaoEpisodio);

export default router;
