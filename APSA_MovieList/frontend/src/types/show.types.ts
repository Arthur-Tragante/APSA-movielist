/**
 * Tipos relacionados a séries/shows
 */

export interface AvaliacaoUsuarioShow {
  usuario: string;
  email: string;
  nota: number;
  assistido: boolean;
  comentario?: string;
}

export interface AvaliacaoShow {
  fonte: string;
  valor: string;
}

export interface Show {
  id: string;
  titulo: string;
  genero: string;
  ano: string;
  temporadas: string;
  notaImdb: string;
  metascore: string;
  sinopse: string;
  poster?: string;
  avaliacoes: AvaliacaoShow[];
  usuario: string;
  assistido: boolean;
  avaliacoesUsuarios?: AvaliacaoUsuarioShow[];
  mediaAvaliacaoUsuarios?: number;
  notaRottenTomatoes?: string;
  emailsEAvaliacoes?: string;
}

export interface ShowCadastro {
  titulo: string;
  genero: string;
  ano: string;
  temporadas: string;
  notaImdb: string;
  metascore: string;
  sinopse: string;
  poster?: string;
  avaliacoes: AvaliacaoShow[];
  usuario: string;
  assistido: boolean;
}

export interface ShowEdicao extends ShowCadastro {
  id: string;
  avaliacoesUsuarios?: AvaliacaoUsuarioShow[];
}



