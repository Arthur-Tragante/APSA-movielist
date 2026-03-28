import filmeService from '../services/filme.service';
import { MENSAGENS_ERRO } from '../constants/mensagens.constants';

// ─── mocks ──────────────────────────────────────────────────────────────────

jest.mock('../repositories', () => ({
  filmeRepository: {
    buscarTodos: jest.fn(),
    buscarPorId: jest.fn(),
    buscarPorUsuario: jest.fn(),
    criar: jest.fn(),
    atualizar: jest.fn(),
    deletar: jest.fn(),
    atualizarAvaliacaoUsuario: jest.fn(),
    removerAvaliacaoUsuario: jest.fn(),
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

jest.mock('axios');

// Import after mocking so we get the mocked versions
import { filmeRepository } from '../repositories';
import cacheService from '../services/cache.service';

// ─── helpers ────────────────────────────────────────────────────────────────

const repo = filmeRepository as jest.Mocked<typeof filmeRepository>;
const cache = cacheService as jest.Mocked<typeof cacheService>;

const filmeBase = () => ({
  id: 'f1',
  titulo: 'Inception',
  genero: 'Sci-Fi',
  ano: '2010',
  duracao: '148 min',
  notaImdb: '8.8',
  metascore: '74',
  sinopse: 'A thief enters dreams.',
  poster: 'https://example.com/p.jpg',
  usuario: 'user@example.com',
  assistido: false,
  avaliacoes: [],
  avaliacoesUsuarios: [],
});

// We intentionally pass partial DTOs to test validation, so we cast via `any`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dto = (overrides: Record<string, unknown> = {}) =>
  ({
    titulo: 'Inception',
    tituloOriginal: 'Inception',
    genero: 'Sci-Fi',
    ano: '2010',
    duracao: '148 min',
    sinopse: 'A thief enters dreams.',
    poster: 'https://example.com/p.jpg',
    notaImdb: '8.8',
    metascore: '74',
    avaliacoes: [],
    assistido: false,
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
    cache.obter.mockResolvedValue(JSON.stringify(filmeBase()));

    const result = await filmeService.buscarPorId('f1');

    expect(result.titulo).toBe('Inception');
    expect(repo.buscarPorId).not.toHaveBeenCalled();
  });

  it('fetches from repository on cache miss and caches the result', async () => {
    repo.buscarPorId.mockResolvedValue(filmeBase() as any);

    const result = await filmeService.buscarPorId('f1');

    expect(repo.buscarPorId).toHaveBeenCalledWith('f1');
    expect(cache.definir).toHaveBeenCalledWith(
      expect.stringContaining('f1'),
      expect.any(String),
      expect.any(Number)
    );
    expect(result.titulo).toBe('Inception');
  });

  it(`throws "${MENSAGENS_ERRO.FILME_NAO_ENCONTRADO}" when not found`, async () => {
    repo.buscarPorId.mockResolvedValue(null as any);

    await expect(filmeService.buscarPorId('missing')).rejects.toThrow(
      MENSAGENS_ERRO.FILME_NAO_ENCONTRADO
    );
  });
});

// ─── criar / validarDadosFilme ────────────────────────────────────────────────

describe('criar — validation', () => {
  it('throws when titulo is empty', async () => {
    await expect(
      filmeService.criar('user@example.com', dto({ titulo: '' }))
    ).rejects.toThrow('Título é obrigatório');
  });

  it('throws when titulo is only whitespace', async () => {
    await expect(
      filmeService.criar('user@example.com', dto({ titulo: '   ' }))
    ).rejects.toThrow('Título é obrigatório');
  });

  it('throws when duracao is empty', async () => {
    await expect(
      filmeService.criar('user@example.com', dto({ duracao: '' }))
    ).rejects.toThrow('Duração é obrigatória');
  });

  it('throws when genero is empty', async () => {
    await expect(
      filmeService.criar('user@example.com', dto({ genero: '' }))
    ).rejects.toThrow('Gênero é obrigatório');
  });

  it('throws when ano is empty', async () => {
    await expect(
      filmeService.criar('user@example.com', dto({ ano: '' }))
    ).rejects.toThrow('Ano é obrigatório');
  });

  it('throws when ano is below 1800', async () => {
    await expect(
      filmeService.criar('user@example.com', dto({ ano: '1799' }))
    ).rejects.toThrow('Ano inválido');
  });

  it('throws when ano is not a number', async () => {
    await expect(
      filmeService.criar('user@example.com', dto({ ano: 'abcd' }))
    ).rejects.toThrow('Ano inválido');
  });

  it('throws when ano is more than 5 years in the future', async () => {
    const futureYear = String(new Date().getFullYear() + 6);
    await expect(
      filmeService.criar('user@example.com', dto({ ano: futureYear }))
    ).rejects.toThrow('Ano inválido');
  });

  it('calls repository and invalidates cache on valid data', async () => {
    repo.criar.mockResolvedValue('new-id');
    const payload = dto();

    const id = await filmeService.criar('user@example.com', payload);

    expect(repo.criar).toHaveBeenCalledWith('user@example.com', payload);
    expect(cache.remover).toHaveBeenCalled();
    expect(id).toBe('new-id');
  });
});

// ─── atualizar ───────────────────────────────────────────────────────────────

describe('atualizar', () => {
  beforeEach(() => {
    repo.buscarPorId.mockResolvedValue(filmeBase() as any);
    repo.atualizar.mockResolvedValue(undefined);
  });

  it('throws when titulo is an empty string', async () => {
    await expect(
      filmeService.atualizar('f1', 'user@example.com', { titulo: '' })
    ).rejects.toThrow('Título não pode ser vazio');
  });

  it('allows updating other fields without titulo', async () => {
    await expect(
      filmeService.atualizar('f1', 'user@example.com', { assistido: true })
    ).resolves.toBeUndefined();

    expect(repo.atualizar).toHaveBeenCalledWith('f1', { assistido: true });
  });

  it(`throws "${MENSAGENS_ERRO.FILME_NAO_ENCONTRADO}" when movie does not exist`, async () => {
    repo.buscarPorId.mockResolvedValue(null as any);

    await expect(
      filmeService.atualizar('missing', 'user@example.com', { assistido: true })
    ).rejects.toThrow(MENSAGENS_ERRO.FILME_NAO_ENCONTRADO);
  });
});

// ─── avaliarFilme ─────────────────────────────────────────────────────────────

describe('avaliarFilme', () => {
  beforeEach(() => {
    repo.atualizarAvaliacaoUsuario.mockResolvedValue(undefined);
    repo.buscarPorId.mockResolvedValue(filmeBase() as any);
  });

  it(`throws "${MENSAGENS_ERRO.NOTA_FORA_INTERVALO}" when nota is below 0`, async () => {
    await expect(
      filmeService.avaliarFilme('f1', 'user@example.com', 'User', -1)
    ).rejects.toThrow(MENSAGENS_ERRO.NOTA_FORA_INTERVALO);
  });

  it(`throws "${MENSAGENS_ERRO.NOTA_FORA_INTERVALO}" when nota is above 10`, async () => {
    await expect(
      filmeService.avaliarFilme('f1', 'user@example.com', 'User', 11)
    ).rejects.toThrow(MENSAGENS_ERRO.NOTA_FORA_INTERVALO);
  });

  it('throws when nota is not a multiple of 0.5', async () => {
    await expect(
      filmeService.avaliarFilme('f1', 'user@example.com', 'User', 7.3)
    ).rejects.toThrow('Nota deve ser múltiplo de 0.5');
  });

  it('accepts valid boundary nota 0', async () => {
    await expect(
      filmeService.avaliarFilme('f1', 'user@example.com', 'User', 0)
    ).resolves.toBeUndefined();
  });

  it('accepts valid boundary nota 10', async () => {
    await expect(
      filmeService.avaliarFilme('f1', 'user@example.com', 'User', 10)
    ).resolves.toBeUndefined();
  });

  it('accepts half-star nota like 7.5', async () => {
    await expect(
      filmeService.avaliarFilme('f1', 'user@example.com', 'User', 7.5)
    ).resolves.toBeUndefined();
  });

  it('persists the rating and invalidates cache', async () => {
    await filmeService.avaliarFilme('f1', 'user@example.com', 'User', 8, 'Good!');

    expect(repo.atualizarAvaliacaoUsuario).toHaveBeenCalledWith(
      'f1', 'user@example.com', 'User', 8, 'Good!'
    );
    expect(cache.remover).toHaveBeenCalled();
  });
});

// ─── sortearFilmesEnviados ────────────────────────────────────────────────────

describe('sortearFilmesEnviados', () => {
  it('throws when the provided list is empty', async () => {
    await expect(
      filmeService.sortearFilmesEnviados([], '')
    ).rejects.toThrow('Nenhum filme para sortear');
  });

  it('returns a winner that is one of the provided films', async () => {
    const filmes = ['Blade Runner', 'Alien', 'Dune'];
    const result = await filmeService.sortearFilmesEnviados(filmes, '');

    expect(filmes).toContain(result.vencedor);
  });

  it('winner reaches exactly 5 draws', async () => {
    const filmes = ['A', 'B'];
    const result = await filmeService.sortearFilmesEnviados(filmes, '');

    expect(result.totais[result.vencedor]).toBeGreaterThanOrEqual(5);
  });

  it('works with object-shaped film entries', async () => {
    const filmes = [{ titulo: 'Matrix' }, { titulo: 'Interstellar' }];
    const result = await filmeService.sortearFilmesEnviados(filmes, '');

    expect(['Matrix', 'Interstellar']).toContain(result.vencedor);
  });
});
