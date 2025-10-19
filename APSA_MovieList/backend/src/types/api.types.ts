/**
 * Tipos relacionados a APIs externas
 */

export interface ResultadoBuscaTMDB {
  id: number;
  title: string;
  original_title: string;
  release_date: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

export interface DetalheFilmeTMDB {
  id: number;
  title: string;
  original_title: string;
  release_date: string;
  runtime: number;
  overview: string;
  poster_path: string;
  vote_average: number;
  vote_count: number;
  genres: Array<{ id: number; name: string }>;
  imdb_id: string;
}

export interface RespostaOMDB {
  Title: string;
  Year: string;
  Runtime: string;
  Genre: string;
  Plot: string;
  Poster: string;
  imdbRating: string;
  imdbVotes: string;
  Metascore: string;
  Ratings: Array<{
    Source: string;
    Value: string;
  }>;
  Response: string;
}

export interface ResultadoBusca {
  id: number;
  titulo: string;
  tituloOriginal: string;
  ano: string;
  sinopse: string;
  poster: string;
}

export interface DetalhesFilme {
  titulo: string;
  tituloOriginal: string;
  ano: string;
  duracao: string;
  genero: string;
  sinopse: string;
  poster: string;
  notaImdb: string;
  votosImdb: string;
  metascore: string;
  avaliacoes: Array<{
    fonte: string;
    valor: string;
  }>;
  imdbId: string;
}

