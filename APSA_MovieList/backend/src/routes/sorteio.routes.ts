import { Router } from 'express';
import sorteioController from '../controllers/sorteio.controller';
import { autenticar } from '../middlewares';

const router = Router();

/**
 * Rotas para sorteio de filmes
 * Base: /api/sorteio
 */

/**
 * GET /api/sorteio/filmes
 * Lista todos os filmes do sorteio
 */
router.get('/filmes', autenticar, sorteioController.listarFilmes);

/**
 * POST /api/sorteio/filmes
 * Adiciona um filme ao sorteio
 * Body: { titulo: string }
 */
router.post('/filmes', autenticar, sorteioController.adicionarFilme);

/**
 * DELETE /api/sorteio/filmes/:id
 * Remove um filme do sorteio
 */
router.delete('/filmes/:id', autenticar, sorteioController.removerFilme);

/**
 * POST /api/sorteio/sortear
 * Realiza o sorteio
 * Body: { webhook?: string }
 */
router.post('/sortear', autenticar, sorteioController.sortear);

/**
 * GET /api/sorteio/resultado
 * Busca o último resultado do sorteio
 */
router.get('/resultado', autenticar, sorteioController.obterResultado);

/**
 * DELETE /api/sorteio/resultado
 * Limpa o resultado do sorteio
 */
router.delete('/resultado', autenticar, sorteioController.limparResultado);

/**
 * DELETE /api/sorteio/limpar-tudo
 * Limpa filmes e resultado
 */
router.delete('/limpar-tudo', autenticar, sorteioController.limparTudo);

export default router;
