import serieService from '../services/serie.service';

// ─── mocks ──────────────────────────────────────────────────────────────────

jest.mock('../repositories', () => ({
  serieRepository: {
    buscarPorUsuario: jest.fn(),
    buscarPorId: jest.fn(),
    criar: jest.fn(),
    atualizar: jest.fn(),
    deletar: jest.fn(),
    atualizarAvaliacaoUsuario: jest.fn(),
    removerAvaliacaoUsuario: jest.fn(),
    adicionarEpisodio: jest.fn(),
    removerEpisodio: jest.fn(),
    avaliarEpisodio: jest.fn(),
    removerAvaliacaoEpisodio: jest.fn(),
  },
}));

jest.mock('../services/cache.service', () => ({
  __esModule: true,
  default: {
    obter: jest.fn(),
    definir: jest.fn(),
    remover: jest.fn(),
  },
}));

import { serieRepository } from '../repositories';
import cacheService from '../services/cache.service';

// ─── helpers ────────────────────────────────────────────────────────────────

const repo = serieRepository as jest.Mocked<typeof serieRepository>;
const cache = cacheService as jest.Mocked<typeof cacheService>;

const serieBase = () => ({
  id: 's1',
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
  assistido: true,
  avaliacoes: [],
  avaliacoesUsuarios: [],
  temporadasEpisodios: [],
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dto = (overrides: Record<string, unknown> = {}) =>
  ({
    titulo: 'Breaking Bad',
    tituloOriginal: 'Breaking Bad',
    genero: 'Drama',
    ano: '2008',
    temporadas: '5',
    notaImdb: '9.5',
    metascore: '99',
    sinopse: 'A chemistry teacher turns to crime.',
    poster: 'https://example.com/bb.jpg',
    assistido: false,
    avaliacoes: [],
    ...overrides,
  } as any);

beforeEach(() => {
  jest.clearAllMocks();
  cache.obter.mockResolvedValue(null);
  cache.definir.mockResolvedValue(undefined);
  cache.remover.mockResolvedValue(undefined);
});

// ─── buscarPorId ─────────────────────────────────────────────────────────────

describe('buscarPorId', () => {
  it('returns cached value without hitting the repository', async () => {
    cache.obter.mockResolvedValue(JSON.stringify(serieBase()));

    const result = await serieService.buscarPorId('s1');

    expect(result.titulo).toBe('Breaking Bad');
    expect(repo.buscarPorId).not.toHaveBeenCalled();
  });

  it('fetches from repository on cache miss and caches the result', async () => {
    repo.buscarPorId.mockResolvedValue(serieBase() as any);

    const result = await serieService.buscarPorId('s1');

    expect(repo.buscarPorId).toHaveBeenCalledWith('s1');
    expect(cache.definir).toHaveBeenCalledWith(
      expect.stringContaining('s1'),
      expect.any(String),
      expect.any(Number)
    );
    expect(result.titulo).toBe('Breaking Bad');
  });

  it('throws "Série não encontrada" when not found', async () => {
    repo.buscarPorId.mockResolvedValue(null as any);

    await expect(serieService.buscarPorId('missing')).rejects.toThrow(
      'Série não encontrada'
    );
  });
});

// ─── criar / validarDadosSerie ────────────────────────────────────────────────

describe('criar — validation', () => {
  it('throws when titulo is empty', async () => {
    await expect(
      serieService.criar('user@example.com', dto({ titulo: '' }))
    ).rejects.toThrow('Título é obrigatório');
  });

  it('throws when titulo is only whitespace', async () => {
    await expect(
      serieService.criar('user@example.com', dto({ titulo: '   ' }))
    ).rejects.toThrow('Título é obrigatório');
  });

  it('throws when temporadas is empty', async () => {
    await expect(
      serieService.criar('user@example.com', dto({ temporadas: '' }))
    ).rejects.toThrow('Número de temporadas é obrigatório');
  });

  it('throws when genero is empty', async () => {
    await expect(
      serieService.criar('user@example.com', dto({ genero: '' }))
    ).rejects.toThrow('Gênero é obrigatório');
  });

  it('throws when ano is empty', async () => {
    await expect(
      serieService.criar('user@example.com', dto({ ano: '' }))
    ).rejects.toThrow('Ano é obrigatório');
  });

  it('calls repository and invalidates cache on valid data', async () => {
    repo.criar.mockResolvedValue('new-id');
    const payload = dto();

    const id = await serieService.criar('user@example.com', payload);

    expect(repo.criar).toHaveBeenCalledWith('user@example.com', payload);
    expect(cache.remover).toHaveBeenCalled();
    expect(id).toBe('new-id');
  });
});

// ─── atualizar ───────────────────────────────────────────────────────────────

describe('atualizar', () => {
  beforeEach(() => {
    repo.buscarPorId.mockResolvedValue(serieBase() as any);
    repo.atualizar.mockResolvedValue(undefined);
  });

  it('throws when titulo is an empty string', async () => {
    await expect(
      serieService.atualizar('s1', 'user@example.com', { titulo: '' })
    ).rejects.toThrow('Título não pode ser vazio');
  });

  it('throws when genero is an empty string', async () => {
    await expect(
      serieService.atualizar('s1', 'user@example.com', { genero: '' })
    ).rejects.toThrow('Gênero não pode ser vazio');
  });

  it('throws when temporadas is an empty string', async () => {
    await expect(
      serieService.atualizar('s1', 'user@example.com', { temporadas: '' })
    ).rejects.toThrow('Número de temporadas não pode ser vazio');
  });

  it('allows updating other fields without touching titulo', async () => {
    await expect(
      serieService.atualizar('s1', 'user@example.com', { assistido: true })
    ).resolves.toBeUndefined();

    expect(repo.atualizar).toHaveBeenCalledWith('s1', { assistido: true });
  });

  it('throws "Série não encontrada" when series does not exist', async () => {
    repo.buscarPorId.mockResolvedValue(null as any);

    await expect(
      serieService.atualizar('missing', 'user@example.com', { assistido: true })
    ).rejects.toThrow('Série não encontrada');
  });
});

// ─── atualizarAvaliacaoUsuario ────────────────────────────────────────────────

describe('atualizarAvaliacaoUsuario', () => {
  beforeEach(() => {
    repo.buscarPorId.mockResolvedValue(serieBase() as any);
    repo.atualizarAvaliacaoUsuario.mockResolvedValue(undefined);
  });

  it('throws when nota is below 0', async () => {
    await expect(
      serieService.atualizarAvaliacaoUsuario('s1', 'user@example.com', 'User', -1)
    ).rejects.toThrow('Nota deve estar entre 0 e 10');
  });

  it('throws when nota is above 10', async () => {
    await expect(
      serieService.atualizarAvaliacaoUsuario('s1', 'user@example.com', 'User', 11)
    ).rejects.toThrow('Nota deve estar entre 0 e 10');
  });

  it('accepts boundary nota 0', async () => {
    await expect(
      serieService.atualizarAvaliacaoUsuario('s1', 'user@example.com', 'User', 0)
    ).resolves.toBeUndefined();
  });

  it('accepts boundary nota 10', async () => {
    await expect(
      serieService.atualizarAvaliacaoUsuario('s1', 'user@example.com', 'User', 10)
    ).resolves.toBeUndefined();
  });

  it('persists the rating and invalidates cache', async () => {
    await serieService.atualizarAvaliacaoUsuario('s1', 'user@example.com', 'User', 9, 'Excellent!');

    expect(repo.atualizarAvaliacaoUsuario).toHaveBeenCalledWith(
      's1', 'user@example.com', 'User', 9, 'Excellent!'
    );
    expect(cache.remover).toHaveBeenCalled();
  });

  it('throws "Série não encontrada" when series does not exist', async () => {
    repo.buscarPorId.mockResolvedValue(null as any);

    await expect(
      serieService.atualizarAvaliacaoUsuario('missing', 'user@example.com', 'User', 8)
    ).rejects.toThrow('Série não encontrada');
  });
});

// ─── avaliarEpisodio ──────────────────────────────────────────────────────────

describe('avaliarEpisodio', () => {
  beforeEach(() => {
    repo.buscarPorId.mockResolvedValue(serieBase() as any);
    repo.avaliarEpisodio.mockResolvedValue(undefined);
  });

  it('throws when nota is below 0', async () => {
    await expect(
      serieService.avaliarEpisodio('s1', 'user@example.com', 'User', 1, 1, -1)
    ).rejects.toThrow('Nota deve estar entre 0 e 10');
  });

  it('throws when nota is above 10', async () => {
    await expect(
      serieService.avaliarEpisodio('s1', 'user@example.com', 'User', 1, 1, 11)
    ).rejects.toThrow('Nota deve estar entre 0 e 10');
  });

  it('persists the episode rating and invalidates cache', async () => {
    await serieService.avaliarEpisodio('s1', 'user@example.com', 'User', 1, 2, 8, 'Good ep!');

    expect(repo.avaliarEpisodio).toHaveBeenCalledWith(
      's1', 1, 2, 'user@example.com', 'User', 8, 'Good ep!'
    );
    expect(cache.remover).toHaveBeenCalled();
  });
});

// ─── adicionarEpisodio / removerEpisodio ──────────────────────────────────────

describe('adicionarEpisodio', () => {
  beforeEach(() => {
    repo.buscarPorId.mockResolvedValue(serieBase() as any);
    repo.adicionarEpisodio.mockResolvedValue(undefined);
  });

  it('delegates to repository and invalidates cache', async () => {
    const episodio = { numero: 1, titulo: 'Pilot' };

    await serieService.adicionarEpisodio('s1', 'user@example.com', 1, episodio);

    expect(repo.adicionarEpisodio).toHaveBeenCalledWith('s1', 1, episodio);
    expect(cache.remover).toHaveBeenCalled();
  });

  it('throws "Série não encontrada" when series does not exist', async () => {
    repo.buscarPorId.mockResolvedValue(null as any);

    await expect(
      serieService.adicionarEpisodio('missing', 'user@example.com', 1, { numero: 1, titulo: 'Pilot' })
    ).rejects.toThrow('Série não encontrada');
  });
});

describe('removerEpisodio', () => {
  beforeEach(() => {
    repo.buscarPorId.mockResolvedValue(serieBase() as any);
    repo.removerEpisodio.mockResolvedValue(undefined);
  });

  it('delegates to repository and invalidates cache', async () => {
    await serieService.removerEpisodio('s1', 'user@example.com', 1, 1);

    expect(repo.removerEpisodio).toHaveBeenCalledWith('s1', 1, 1);
    expect(cache.remover).toHaveBeenCalled();
  });
});
