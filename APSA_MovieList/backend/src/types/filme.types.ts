/**
 * Tipos relacionados a filmes
 */

export interface AvaliacaoUsuario {
  usuario: string;
  email: string;
  nota: number;
  assistido: boolean;
  comentario?: string;
}

export interface Avaliacao {
  fonte: string;
  valor: string;
}

export interface Filme {
  id: string;
  titulo: string;
  tituloOriginal: string;
  ano: string;
  duracao: string;
  genero: string;
  sinopse: string;
  poster: string;
  notaImdb: string;
  votosImdb?: string;
  metascore: string;
  avaliacoes: Avaliacao[];
  assistido: boolean;
  usuario: string;
  criadoEm: string;
  atualizadoEm?: string;
  avaliacoesUsuarios?: AvaliacaoUsuario[];
  mediaAvaliacaoUsuarios?: number;
}

export interface CriarFilmeDTO {
  titulo: string;
  tituloOriginal: string;
  ano: string;
  duracao: string;
  genero: string;
  sinopse: string;
  poster: string;
  notaImdb: string;
  votosImdb?: string;
  metascore: string;
  avaliacoes: Avaliacao[];
  assistido: boolean;
}

export interface AtualizarFilmeDTO {
  titulo?: string;
  tituloOriginal?: string;
  ano?: string;
  duracao?: string;
  genero?: string;
  sinopse?: string;
  poster?: string;
  notaImdb?: string;
  votosImdb?: string;
  metascore?: string;
  avaliacoes?: Avaliacao[];
  assistido?: boolean;
}

export interface AvaliarFilmeDTO {
  nota: number;
  comentario?: string;
}

