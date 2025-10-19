import { filmeRepository } from '../repositories';
import { Filme, FilmeCadastro, FilmeEdicao, AvaliacaoUsuario } from '../types';

/**
 * Service para lógica de negócio relacionada a filmes
 */
class FilmeService {
  /**
   * Busca todos os filmes e calcula médias de avaliações
   */
  async buscarTodos(): Promise<Filme[]> {
    const filmes = await filmeRepository.buscarTodos();
    return this.calcularMediasAvaliacoes(filmes);
  }

  /**
   * Busca um filme por ID
   */
  async buscarPorId(id: string): Promise<Filme | null> {
    return await filmeRepository.buscarPorId(id);
  }

  /**
   * Busca filmes por usuário
   */
  async buscarPorUsuario(emailUsuario: string): Promise<Filme[]> {
    const filmes = await filmeRepository.buscarPorUsuario(emailUsuario);
    return this.calcularMediasAvaliacoes(filmes);
  }

  /**
   * Cria um novo filme
   */
  async criar(filme: FilmeCadastro): Promise<string> {
    this.validarCamposObrigatorios(filme);
    return await filmeRepository.criar(filme);
  }

  /**
   * Atualiza um filme existente
   */
  async atualizar(id: string, filme: Partial<FilmeEdicao>): Promise<void> {
    await filmeRepository.atualizar(id, filme);
  }

  /**
   * Atualiza ou adiciona avaliação de usuário para um filme
   */
  async atualizarAvaliacaoUsuario(
    idFilme: string,
    emailUsuario: string,
    nota: number,
    comentario?: string
  ): Promise<void> {
    const filme = await filmeRepository.buscarPorId(idFilme);
    
    if (!filme) {
      throw new Error('Filme não encontrado');
    }

    const avaliacoesAtualizadas = [...(filme.avaliacoesUsuarios || [])];
    const indiceExistente = avaliacoesAtualizadas.findIndex(
      (av) => av.email === emailUsuario
    );

    if (indiceExistente > -1) {
      avaliacoesAtualizadas[indiceExistente].nota = nota;
      avaliacoesAtualizadas[indiceExistente].comentario = comentario;
    } else {
      avaliacoesAtualizadas.push({
        usuario: emailUsuario.split('@')[0],
        email: emailUsuario,
        nota,
        assistido: filme.assistido,
        comentario,
      });
    }

    await filmeRepository.atualizar(idFilme, {
      avaliacoesUsuarios: avaliacoesAtualizadas,
    });
  }

  /**
   * Deleta um filme
   */
  async deletar(id: string): Promise<void> {
    await filmeRepository.deletar(id);
  }

  /**
   * Calcula média de avaliações de usuários e adiciona informações extras
   */
  private calcularMediasAvaliacoes(filmes: Filme[]): Filme[] {
    return filmes.map((filme) => {
      const avaliacoesUsuarios = filme.avaliacoesUsuarios || [];
      
      let mediaAvaliacaoUsuarios = 0;
      if (avaliacoesUsuarios.length > 0) {
        const somaNotas = avaliacoesUsuarios.reduce(
          (acc, av) => acc + av.nota,
          0
        );
        mediaAvaliacaoUsuarios = somaNotas / avaliacoesUsuarios.length;
      }

      const notaRottenTomatoes = filme.avaliacoes?.find(
        (av) => av.fonte === 'Rotten Tomatoes'
      )?.valor;

      const emailsEAvaliacoes = avaliacoesUsuarios
        .map((av) => `${av.usuario}: ${av.nota}/10`)
        .join(', ');

      return {
        ...filme,
        mediaAvaliacaoUsuarios,
        notaRottenTomatoes,
        emailsEAvaliacoes,
        assistido: filme.assistido || false,
      };
    });
  }

  /**
   * Valida campos obrigatórios de um filme
   */
  private validarCamposObrigatorios(filme: FilmeCadastro): void {
    const { titulo, duracao, genero, ano } = filme;
    
    if (!titulo || !duracao || !genero || !ano) {
      throw new Error('Campos obrigatórios não preenchidos');
    }
  }
}

export default new FilmeService();

