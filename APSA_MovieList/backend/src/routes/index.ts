import { Router } from 'express';
import filmeRoutes from './filme.routes';
import apiExternaRoutes from './api-externa.routes';

const router = Router();

/**
 * Health check
 */
router.get('/health', (_req, res) => {
  res.json({
    sucesso: true,
    mensagem: 'API Moicanos Backend está funcionando',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Rotas de filmes
 */
router.use('/filmes', filmeRoutes);

/**
 * Rotas de APIs externas
 */
router.use('/buscar', apiExternaRoutes);

export default router;

