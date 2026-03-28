import {
  filmeMongoParaApp,
  filmeAppParaMongo,
  atualizacaoFilmeParaMongo,
  serieMongoParaApp,
  serieAppParaMongo,
} from '../utils/mappers.util';

// ─── helpers ────────────────────────────────────────────────────────────────

const mongoFilme = () => ({
  id: 'abc123',
  title: 'Interstellar',
  genre: 'Sci-Fi',
  year: '2014',
  duration: '169 min',
  imdbRating: '8.6',
  metascore: '74',
  synopsis: 'A team of explorers travel through a wormhole.',
  poster: 'https://example.com/poster.jpg',
  ratings: [
    { Source: 'Internet Movie Database', Value: '8.6/10' },
    { Source: 'Rotten Tomatoes', Value: '73%' },
  ],
  user: 'user@example.com',
  watched: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-02'),
  userRatings: [
    { user: 'Alice', email: 'alice@example.com', rating: 9, comment: 'Great!' },
    { user: 'Bob', email: 'bob@example.com', rating: 7, comment: '' },
  ],
});

const appFilme = () => ({
  titulo: 'Interstellar',
  genero: 'Sci-Fi',
  ano: '2014',
  duracao: '169 min',
  notaImdb: '8.6',
  metascore: '74',
  sinopse: 'A team of explorers travel through a wormhole.',
  poster: 'https://example.com/poster.jpg',
  avaliacoes: [
    { fonte: 'Internet Movie Database', valor: '8.6/10' },
    { fonte: 'Rotten Tomatoes', valor: '73%' },
  ],
  usuario: 'user@example.com',
  assistido: true,
  avaliacoesUsuarios: [
    { usuario: 'Alice', email: 'alice@example.com', nota: 9, comentario: 'Great!' },
  ],
});

// ─── filmeMongoParaApp ───────────────────────────────────────────────────────

describe('filmeMongoParaApp', () => {
  it('maps all scalar fields correctly', () => {
    const result = filmeMongoParaApp(mongoFilme());

    expect(result.id).toBe('abc123');
    expect(result.titulo).toBe('Interstellar');
    expect(result.genero).toBe('Sci-Fi');
    expect(result.ano).toBe('2014');
    expect(result.duracao).toBe('169 min');
    expect(result.notaImdb).toBe('8.6');
    expect(result.metascore).toBe('74');
    expect(result.sinopse).toBe('A team of explorers travel through a wormhole.');
    expect(result.poster).toBe('https://example.com/poster.jpg');
    expect(result.usuario).toBe('user@example.com');
    expect(result.assistido).toBe(true);
  });

  it('maps external ratings array', () => {
    const result = filmeMongoParaApp(mongoFilme());

    expect(result.avaliacoes).toHaveLength(2);
    expect(result.avaliacoes[0]).toEqual({
      fonte: 'Internet Movie Database',
      valor: '8.6/10',
    });
  });

  it('maps user ratings and calculates average', () => {
    const result = filmeMongoParaApp(mongoFilme());

    expect(result.avaliacoesUsuarios).toHaveLength(2);
    expect(result.avaliacoesUsuarios[0].usuario).toBe('Alice');
    expect(result.avaliacoesUsuarios[0].nota).toBe(9);
    expect(result.avaliacoesUsuarios[1].nota).toBe(7);
    // average of 9 and 7 = 8
    expect(result.mediaAvaliacaoUsuarios).toBe(8);
  });

  it('sets mediaAvaliacaoUsuarios to undefined when there are no ratings', () => {
    const doc = { ...mongoFilme(), userRatings: [] };
    const result = filmeMongoParaApp(doc);

    expect(result.mediaAvaliacaoUsuarios).toBeUndefined();
  });

  it('ignores zero-value ratings when calculating average', () => {
    const doc = {
      ...mongoFilme(),
      userRatings: [
        { user: 'Alice', email: 'alice@example.com', rating: 0, comment: '' },
        { user: 'Bob', email: 'bob@example.com', rating: 8, comment: '' },
      ],
    };
    const result = filmeMongoParaApp(doc);

    // only non-zero ratings count → average is 8
    expect(result.mediaAvaliacaoUsuarios).toBe(8);
  });

  it('returns empty arrays when optional fields are missing', () => {
    const doc = { ...mongoFilme(), ratings: undefined, userRatings: undefined };
    const result = filmeMongoParaApp(doc);

    expect(result.avaliacoes).toEqual([]);
    expect(result.avaliacoesUsuarios).toEqual([]);
  });
});

// ─── filmeAppParaMongo ───────────────────────────────────────────────────────

describe('filmeAppParaMongo', () => {
  it('maps all fields to MongoDB format', () => {
    const result = filmeAppParaMongo(appFilme());

    expect(result.title).toBe('Interstellar');
    expect(result.genre).toBe('Sci-Fi');
    expect(result.year).toBe('2014');
    expect(result.duration).toBe('169 min');
    expect(result.imdbRating).toBe('8.6');
    expect(result.synopsis).toBe('A team of explorers travel through a wormhole.');
    expect(result.user).toBe('user@example.com');
    expect(result.watched).toBe(true);
  });

  it('converts avaliacoes to ratings with Source/Value keys', () => {
    const result = filmeAppParaMongo(appFilme());

    expect(result.ratings[0]).toEqual({
      Source: 'Internet Movie Database',
      Value: '8.6/10',
    });
  });

  it('converts avaliacoesUsuarios to userRatings', () => {
    const result = filmeAppParaMongo(appFilme());

    expect(result.userRatings[0]).toEqual({
      user: 'Alice',
      email: 'alice@example.com',
      rating: 9,
      comment: 'Great!',
    });
  });

  it('sets userRatings to empty array when avaliacoesUsuarios is absent', () => {
    const { avaliacoesUsuarios, ...without } = appFilme();
    const result = filmeAppParaMongo(without);

    expect(result.userRatings).toBeUndefined();
  });
});

// ─── atualizacaoFilmeParaMongo ───────────────────────────────────────────────

describe('atualizacaoFilmeParaMongo', () => {
  it('maps only the provided fields', () => {
    const result = atualizacaoFilmeParaMongo({ titulo: 'New Title', assistido: false });

    expect(result.title).toBe('New Title');
    expect(result.watched).toBe(false);
    expect(result.genre).toBeUndefined();
    expect(result.year).toBeUndefined();
  });

  it('returns empty object when no fields are provided', () => {
    expect(atualizacaoFilmeParaMongo({})).toEqual({});
  });

  it('converts avaliacoes to ratings format', () => {
    const result = atualizacaoFilmeParaMongo({
      avaliacoes: [{ fonte: 'IMDb', valor: '7/10' }],
    });

    expect(result.ratings).toEqual([{ Source: 'IMDb', Value: '7/10' }]);
  });
});

// ─── serieMongoParaApp ───────────────────────────────────────────────────────

describe('serieMongoParaApp', () => {
  const mongoSerie = {
    id: 'serie123',
    title: 'Breaking Bad',
    originalTitle: 'Breaking Bad',
    genre: 'Drama',
    year: '2008',
    seasons: '5',
    imdbRating: '9.5',
    metascore: '99',
    synopsis: 'A chemistry teacher turns to crime.',
    poster: 'https://example.com/bb.jpg',
    ratings: [],
    user: 'user@example.com',
    watched: false,
    userRatings: [{ user: 'Alice', email: 'alice@example.com', rating: 10, comment: 'Best show!' }],
    seasonEpisodes: [
      {
        seasonNumber: 1,
        episodes: [
          {
            episodeNumber: 1,
            title: 'Pilot',
            synopsis: 'Walter starts cooking.',
            releaseDate: '2008-01-20',
            ratings: [],
          },
        ],
      },
    ],
  };

  it('maps top-level series fields', () => {
    const result = serieMongoParaApp(mongoSerie);

    expect(result.id).toBe('serie123');
    expect(result.titulo).toBe('Breaking Bad');
    expect(result.genero).toBe('Drama');
    expect(result.ano).toBe('2008');
    expect(result.temporadas).toBe('5');
    expect(result.notaImdb).toBe('9.5');
  });

  it('maps seasons and episodes', () => {
    const result = serieMongoParaApp(mongoSerie);

    expect(result.temporadasEpisodios).toHaveLength(1);
    expect(result.temporadasEpisodios[0].numero).toBe(1);
    expect(result.temporadasEpisodios[0].episodios[0].titulo).toBe('Pilot');
    expect(result.temporadasEpisodios[0].episodios[0].numero).toBe(1);
  });

  it('maps user ratings', () => {
    const result = serieMongoParaApp(mongoSerie);

    expect(result.avaliacoesUsuarios[0].nota).toBe(10);
    expect(result.avaliacoesUsuarios[0].comentario).toBe('Best show!');
  });
});

// ─── serieAppParaMongo ───────────────────────────────────────────────────────

describe('serieAppParaMongo', () => {
  it('maps series fields to MongoDB format', () => {
    const result = serieAppParaMongo({
      titulo: 'Breaking Bad',
      tituloOriginal: 'Breaking Bad',
      genero: 'Drama',
      ano: '2008',
      temporadas: '5',
      notaImdb: '9.5',
      metascore: '99',
      sinopse: 'A chemistry teacher turns to crime.',
      poster: 'https://example.com/bb.jpg',
      usuario: 'user@example.com',
      assistido: false,
      avaliacoes: [],
      temporadasEpisodios: [],
    });

    expect(result.title).toBe('Breaking Bad');
    expect(result.originalTitle).toBe('Breaking Bad');
    expect(result.genre).toBe('Drama');
    expect(result.seasons).toBe('5');
    expect(result.user).toBe('user@example.com');
    expect(result.watched).toBe(false);
  });
});
