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

export interface AvaliacaoEpisodio {
  usuario: string;
  email: string;
  nota: number;
  comentario?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Episodio {
  numero: number;
  titulo: string;
  sinopse?: string;
  dataLancamento?: string;
  avaliacoesEpisodio?: AvaliacaoEpisodio[];
}

export interface Temporada {
  numero: number;
  episodios: Episodio[];
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
  criadoEm?: string;
  atualizadoEm?: string;
  avaliacoesUsuarios?: AvaliacaoUsuarioShow[];
  mediaAvaliacaoUsuarios?: number;
  notaRottenTomatoes?: string;
  emailsEAvaliacoes?: string;
  temporadasEpisodios?: Temporada[];
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
  temporadasEpisodios?: Temporada[];
}

export interface ShowEdicao extends ShowCadastro {
  id: string;
  avaliacoesUsuarios?: AvaliacaoUsuarioShow[];
}







