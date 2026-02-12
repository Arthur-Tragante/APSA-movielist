/**
 * Tipos relacionados a séries
 */

export interface AvaliacaoUsuarioSerie {
  usuario: string;
  email: string;
  nota: number;
  assistido: boolean;
  comentario?: string;
}

export interface AvaliacaoSerie {
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

export interface Serie {
  id: string;
  titulo: string;
  tituloOriginal: string;
  ano: string;
  temporadas: string;
  genero: string;
  sinopse: string;
  poster: string;
  notaImdb: string;
  votosImdb?: string;
  metascore: string;
  avaliacoes: AvaliacaoSerie[];
  assistido: boolean;
  usuario: string;
  criadoEm: string;
  atualizadoEm?: string;
  avaliacoesUsuarios?: AvaliacaoUsuarioSerie[];
  mediaAvaliacaoUsuarios?: number;
  temporadasEpisodios?: Temporada[];
}

export interface CriarSerieDTO {
  titulo: string;
  tituloOriginal?: string;
  ano: string;
  temporadas: string;
  genero: string;
  sinopse: string;
  poster: string;
  notaImdb: string;
  votosImdb?: string;
  metascore: string;
  avaliacoes: AvaliacaoSerie[];
  assistido: boolean;
  temporadasEpisodios?: Temporada[];
}

export interface AtualizarSerieDTO {
  titulo?: string;
  tituloOriginal?: string;
  ano?: string;
  temporadas?: string;
  genero?: string;
  sinopse?: string;
  poster?: string;
  notaImdb?: string;
  votosImdb?: string;
  metascore?: string;
  avaliacoes?: AvaliacaoSerie[];
  assistido?: boolean;
  temporadasEpisodios?: Temporada[];
}

export interface AdicionarEpisodioDTO {
  numeroTemporada: number;
  episodio: Episodio;
}

export interface AvaliarEpisodioDTO {
  numeroTemporada: number;
  numeroEpisodio: number;
  nota: number;
  comentario?: string;
}

export interface AvaliarSerieDTO {
  nota: number;
  comentario?: string;
}
