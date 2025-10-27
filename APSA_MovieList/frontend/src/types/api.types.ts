/**
 * Tipos relacionados às APIs externas (TMDB, OMDB)
 */

export interface ResultadoFilmeTMDB {
  id: string;
  title: string;
  poster_path: string;
  release_date: string;
  overview: string;
}

export interface DetalhesFilmeTMDB {
  title: string;
  runtime: number;
  genres: { id: number; name: string }[];
  release_date: string;
  overview: string;
  original_title: string;
  imdb_id?: string;
}

export interface ResultadoSerieTMDB {
  id: string;
  name: string;
  poster_path: string;
  first_air_date: string;
  overview: string;
}

export interface DetalhesSerieTMDB {
  name: string;
  number_of_seasons: number;
  genres: { id: number; name: string }[];
  first_air_date: string;
  overview: string;
  original_name: string;
  external_ids?: {
    imdb_id?: string;
  };
}

export interface RespostaOMDB {
  Title: string;
  Year: string;
  Runtime: string;
  Genre: string;
  Plot: string;
  imdbRating: string;
  imdbVotes: string;
  Metascore: string;
  Ratings: { Source: string; Value: string }[];
  Response: string;
  totalSeasons?: string;
}

