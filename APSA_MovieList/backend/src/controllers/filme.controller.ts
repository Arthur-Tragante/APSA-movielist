import { Response, NextFunction } from 'express';
import { filmeService } from '../services';
import { RequisicaoAutenticada, CriarFilmeDTO, AtualizarFilmeDTO, AvaliarFilmeDTO } from '../types';
import { MENSAGENS_SUCESSO } from '../constants/mensagens.constants';

/**
 * Controller para operações de filmes
 */
class FilmeController {
  /**
   * Lista todos os filmes do usuário
   * GET /api/filmes
   */
  async listar(req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const emailUsuario = req.usuario!.email;
      const filmes = await filmeService.buscarFilmesUsuario(emailUsuario);

      res.json({
        sucesso: true,
        dados: filmes,
      });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Busca um filme específico
   * GET /api/filmes/:id
   */
  async buscarPorId(req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      const emailUsuario = req.usuario!.email;

      const filme = await filmeService.buscarPorId(id, emailUsuario);

      res.json({
        sucesso: true,
        dados: filme,
      });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Cria um novo filme
   * POST /api/filmes
   */
  async criar(req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const emailUsuario = req.usuario!.email;
      const dadosFilme: CriarFilmeDTO = req.body;

      const idFilme = await filmeService.criar(emailUsuario, dadosFilme);

      res.status(201).json({
        sucesso: true,
        mensagem: MENSAGENS_SUCESSO.FILME_CRIADO,
        dados: { id: idFilme },
      });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Atualiza um filme existente
   * PUT /api/filmes/:id
   */
  async atualizar(req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      const emailUsuario = req.usuario!.email;
      const dadosFilme: AtualizarFilmeDTO = req.body;

      await filmeService.atualizar(id, emailUsuario, dadosFilme);

      res.json({
        sucesso: true,
        mensagem: MENSAGENS_SUCESSO.FILME_ATUALIZADO,
      });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Deleta um filme
   * DELETE /api/filmes/:id
   */
  async deletar(req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      const emailUsuario = req.usuario!.email;

      await filmeService.deletar(id, emailUsuario);

      res.json({
        sucesso: true,
        mensagem: MENSAGENS_SUCESSO.FILME_DELETADO,
      });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Adiciona ou atualiza avaliação de um filme
   * POST /api/filmes/:id/avaliar
   */
  async avaliar(req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      const emailUsuario = req.usuario!.email;
      const nomeUsuario = req.usuario!.nome || emailUsuario.split('@')[0];
      const { nota, comentario }: AvaliarFilmeDTO = req.body;

      await filmeService.avaliarFilme(id, emailUsuario, nomeUsuario, nota, comentario);

      res.json({
        sucesso: true,
        mensagem: MENSAGENS_SUCESSO.AVALIACAO_SALVA,
      });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * Remove avaliação de um filme
   * DELETE /api/filmes/:id/avaliar
   */
  async removerAvaliacao(req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      const emailUsuario = req.usuario!.email;

      await filmeService.removerAvaliacao(id, emailUsuario);

      res.json({
        sucesso: true,
        mensagem: 'Avaliação removida com sucesso',
      });
    } catch (erro) {
      next(erro);
    }
  }
}

export default new FilmeController();

