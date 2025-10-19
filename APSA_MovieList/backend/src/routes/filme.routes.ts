import { Router } from 'express';
import { filmeController } from '../controllers';
import { autenticar, validarCorpo, filmeSchemas, rateLimiterCriacao } from '../middlewares';

const router = Router();

/**
 * Todas as rotas de filmes requerem autenticação
 */
router.use(autenticar);

/**
 * GET /api/filmes
 * Lista todos os filmes do usuário autenticado
 */
router.get('/', filmeController.listar);

/**
 * GET /api/filmes/:id
 * Busca um filme específico
 */
router.get('/:id', filmeController.buscarPorId);

/**
 * POST /api/filmes
 * Cria um novo filme
 */
router.post(
  '/',
  rateLimiterCriacao,
  validarCorpo(filmeSchemas.criar),
  filmeController.criar
);

/**
 * PUT /api/filmes/:id
 * Atualiza um filme existente
 */
router.put('/:id', validarCorpo(filmeSchemas.atualizar), filmeController.atualizar);

/**
 * DELETE /api/filmes/:id
 * Deleta um filme
 */
router.delete('/:id', filmeController.deletar);

/**
 * POST /api/filmes/:id/avaliar
 * Adiciona ou atualiza avaliação de um filme
 */
router.post('/:id/avaliar', validarCorpo(filmeSchemas.avaliar), filmeController.avaliar);

/**
 * DELETE /api/filmes/:id/avaliar
 * Remove avaliação de um filme
 */
router.delete('/:id/avaliar', filmeController.removerAvaliacao);

export default router;

