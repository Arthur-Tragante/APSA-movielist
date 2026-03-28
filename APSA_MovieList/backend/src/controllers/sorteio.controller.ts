import { Response, NextFunction } from 'express';
import { RequisicaoAutenticada } from '../types';
import sorteioRepository from '../repositories/sorteio.repository';
import filmeService from '../services/filme.service';
import {
  emitFilmeAdicionado,
  emitFilmeRemovido,
  emitResultadoSorteio,
  emitResultadoLimpo,
  emitFilmesLimpos
} from '../config/websocket.config';

/**
 * Controller para gerenciar sorteio de filmes
 */
class SorteioController {
  /**
   * GET /api/sorteio/filmes
   * Lista todos os filmes do sorteio
   */
  async listarFilmes(_req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const filmes = await sorteioRepository.buscarTodosFilmes();
      
      return res.json({
        sucesso: true,
        dados: filmes.map(f => ({
          id: f._id.toString(),
          titulo: f.titulo,
          usuario: f.usuario,
          email: f.email
        }))
      });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * POST /api/sorteio/filmes
   * Adiciona um filme ao sorteio
   */
  async adicionarFilme(req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const { titulo } = req.body;
      const usuario = req.usuario!;

      if (!titulo || !titulo.trim()) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Título do filme é obrigatório'
        });
      }

      // Verifica se usuário já adicionou
      const jaAdicionou = await sorteioRepository.usuarioJaAdicionou(usuario.email);
      if (jaAdicionou) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Você já adicionou um filme ao sorteio'
        });
      }

      const filme = await sorteioRepository.adicionarFilme({
        titulo: titulo.trim(),
        usuario: usuario.nome || usuario.email.split('@')[0],
        email: usuario.email
      });

      // Emite evento WebSocket
      emitFilmeAdicionado(filme);

      return res.status(201).json({
        sucesso: true,
        mensagem: 'Filme adicionado com sucesso',
        dados: {
          id: filme._id.toString(),
          titulo: filme.titulo,
          usuario: filme.usuario,
          email: filme.email
        }
      });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * DELETE /api/sorteio/filmes/:id
   * Remove um filme do sorteio
   */
  async removerFilme(req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;

      const removido = await sorteioRepository.removerFilme(id);
      if (!removido) {
        return res.status(404).json({
          sucesso: false,
          mensagem: 'Filme não encontrado'
        });
      }

      // Emite evento WebSocket
      emitFilmeRemovido(id);

      return res.json({
        sucesso: true,
        mensagem: 'Filme removido com sucesso'
      });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * POST /api/sorteio/sortear
   * Realiza o sorteio
   */
  async sortear(req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const { webhook } = req.body;

      // Busca filmes do sorteio
      const filmes = await sorteioRepository.buscarTodosFilmes();
      
      if (filmes.length === 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Não há filmes para sortear'
        });
      }

      // Converte para formato esperado pelo serviço
      const filmesParaSortear = filmes.map(f => ({
        title: f.titulo,
        user: f.usuario,
        email: f.email
      }));

      // Realiza sorteio usando o serviço existente
      const resultado = await filmeService.sortearFilmesEnviados(filmesParaSortear, webhook);

      // Salva resultado no MongoDB
      await sorteioRepository.salvarResultado({
        allPicks: resultado.sorteios,
        winner: resultado.vencedor
      });

      // Emite evento WebSocket
      emitResultadoSorteio({
        allPicks: resultado.sorteios,
        winner: resultado.vencedor
      });

      // Limpa filmes do sorteio
      await sorteioRepository.limparFilmes();
      emitFilmesLimpos();

      return res.json({
        sucesso: true,
        mensagem: `Sorteio realizado! Vencedor: ${resultado.vencedor}`,
        dados: {
          vencedor: resultado.vencedor,
          sorteios: resultado.sorteios
        }
      });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * GET /api/sorteio/resultado
   * Busca o último resultado do sorteio
   */
  async obterResultado(_req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      const resultado = await sorteioRepository.buscarUltimoResultado();

      if (!resultado) {
        return res.json({
          sucesso: true,
          dados: null
        });
      }

      return res.json({
        sucesso: true,
        dados: {
          allPicks: resultado.allPicks,
          winner: resultado.winner
        }
      });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * DELETE /api/sorteio/resultado
   * Limpa o resultado do sorteio
   */
  async limparResultado(_req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      await sorteioRepository.limparResultado();

      // Emite evento WebSocket
      emitResultadoLimpo();

      return res.json({
        sucesso: true,
        mensagem: 'Resultado limpo com sucesso'
      });
    } catch (erro) {
      next(erro);
    }
  }

  /**
   * DELETE /api/sorteio/limpar-tudo
   * Limpa filmes e resultado do sorteio
   */
  async limparTudo(_req: RequisicaoAutenticada, res: Response, next: NextFunction): Promise<any> {
    try {
      await sorteioRepository.limparFilmes();
      await sorteioRepository.limparResultado();

      // Emite eventos WebSocket
      emitFilmesLimpos();
      emitResultadoLimpo();

      return res.json({
        sucesso: true,
        mensagem: 'Sorteio limpo completamente'
      });
    } catch (erro) {
      next(erro);
    }
  }
}

export default new SorteioController();
