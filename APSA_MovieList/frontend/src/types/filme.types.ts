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
  genero: string;
  ano: string;
  duracao: string;
  notaImdb: string;
  metascore: string;
  sinopse: string;
  avaliacoes: Avaliacao[];
  usuario: string;
  assistido: boolean;
  avaliacoesUsuarios?: AvaliacaoUsuario[];
  mediaAvaliacaoUsuarios?: number;
  notaRottenTomatoes?: string;
  emailsEAvaliacoes?: string;
}

export interface FilmeCadastro {
  titulo: string;
  genero: string;
  ano: string;
  duracao: string;
  notaImdb: string;
  metascore: string;
  sinopse: string;
  avaliacoes: Avaliacao[];
  usuario: string;
  assistido: boolean;
}

export interface FilmeEdicao extends FilmeCadastro {
  id: string;
  avaliacoesUsuarios?: AvaliacaoUsuario[];
}

