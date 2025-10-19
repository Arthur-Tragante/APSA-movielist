import { Router } from 'express';
import { apiExternaController } from '../controllers';
import { autenticar, rateLimiterApiExterna } from '../middlewares';

const router = Router();

/**
 * Todas as rotas de API externa requerem autenticação
 */
router.use(autenticar);
router.use(rateLimiterApiExterna);

/**
 * GET /api/buscar/filme?titulo=...
 * Busca filmes no TMDB
 */
router.get('/filme', apiExternaController.buscarFilme);

/**
 * GET /api/buscar/detalhes/:id
 * Busca detalhes de um filme no TMDB
 */
router.get('/detalhes/:id', apiExternaController.buscarDetalhes);

/**
 * GET /api/buscar/ratings/:imdbId
 * Busca ratings no OMDB
 */
router.get('/ratings/:imdbId', apiExternaController.buscarRatings);

export default router;

