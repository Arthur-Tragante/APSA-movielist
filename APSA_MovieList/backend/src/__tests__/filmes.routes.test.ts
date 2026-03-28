/**
 * Integration tests for /api/filmes routes.
 *
 * Strategy: mount the real Express app (createApp) so that routing,
 * auth middleware, Joi validation, controller glue, and error handler
 * are all exercised end-to-end. Only the service layer and JWT crypto
 * are mocked — no database or Redis required.
 */

import request from 'supertest';

// ─── mocks (must be declared before any import that triggers the modules) ────

jest.mock('jsonwebtoken', () => ({ verify: jest.fn() }));

jest.mock('../config/env.config', () => ({
  env: {
    JWT_SECRET: 'test-secret',
    MONGODB_ENABLED: true,
    NODE_ENV: 'test',
    CORS_ORIGIN: 'http://localhost:5173',
    RATE_LIMIT_WINDOW_MS: 900000,
    RATE_LIMIT_MAX_REQUESTS: 100,
  },
}));

jest.mock('../services/filme.service', () => ({
  __esModule: true,
  default: {
    buscarTodos: jest.fn(),
    buscarPorId: jest.fn(),
    criar: jest.fn(),
    atualizar: jest.fn(),
    deletar: jest.fn(),
    avaliarFilme: jest.fn(),
    removerAvaliacao: jest.fn(),
    sortearFilmesEnviados: jest.fn(),
  },
}));

// Prevent cache.service from opening a Redis connection during app init
jest.mock('../services/cache.service', () => ({
  __esModule: true,
  default: { obter: jest.fn(), definir: jest.fn(), remover: jest.fn() },
}));

// ─── imports (after mocks) ───────────────────────────────────────────────────

import jwt from 'jsonwebtoken';
import { createApp } from '../app';
import filmeService from '../services/filme.service';

// ─── test setup ──────────────────────────────────────────────────────────────

const app = createApp();
const service = filmeService as jest.Mocked<typeof filmeService>;

/** Signed token used in all authenticated requests */
const AUTH = 'Bearer test-token';

const filmeFixture = {
  id: 'f1',
  titulo: 'Inception',
  tituloOriginal: 'Inception',
  genero: 'Sci-Fi',
  ano: '2010',
  duracao: '148',
  notaImdb: '8.8',
  metascore: '74',
  sinopse: 'A thief enters dreams.',
  poster: '',
  usuario: 'alice@example.com',
  assistido: false,
  avaliacoes: [],
  avaliacoesUsuarios: [],
};

const validBody = {
  titulo: 'Inception',
  tituloOriginal: 'Inception',
  genero: 'Sci-Fi',
  ano: '2010',
  duracao: '148',
  assistido: false,
};

beforeEach(() => {
  jest.clearAllMocks();

  // Default: JWT verification succeeds → auth middleware calls next()
  (jwt.verify as jest.Mock).mockReturnValue({
    uid: 'u1',
    email: 'alice@example.com',
    nome: 'Alice',
  });
});

// ─── auth guard ───────────────────────────────────────────────────────────────

describe('auth guard', () => {
  it('returns 401 when no Authorization header is sent', async () => {
    const res = await request(app).get('/api/filmes');

    expect(res.status).toBe(401);
    expect(res.body.sucesso).toBe(false);
  });

  it('returns 401 when the JWT is invalid', async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid signature');
    });

    const res = await request(app).get('/api/filmes').set('Authorization', AUTH);

    expect(res.status).toBe(401);
    expect(res.body.sucesso).toBe(false);
  });
});

// ─── GET /api/filmes ──────────────────────────────────────────────────────────

describe('GET /api/filmes', () => {
  it('returns 200 with the film list', async () => {
    service.buscarTodos.mockResolvedValue([filmeFixture] as any);

    const res = await request(app).get('/api/filmes').set('Authorization', AUTH);

    expect(res.status).toBe(200);
    expect(res.body.sucesso).toBe(true);
    expect(res.body.dados).toHaveLength(1);
    expect(res.body.dados[0].titulo).toBe('Inception');
  });

  it('returns 200 with empty array when there are no films', async () => {
    service.buscarTodos.mockResolvedValue([]);

    const res = await request(app).get('/api/filmes').set('Authorization', AUTH);

    expect(res.status).toBe(200);
    expect(res.body.dados).toEqual([]);
  });
});

// ─── GET /api/filmes/:id ──────────────────────────────────────────────────────

describe('GET /api/filmes/:id', () => {
  it('returns 200 with the film when found', async () => {
    service.buscarPorId.mockResolvedValue(filmeFixture as any);

    const res = await request(app).get('/api/filmes/f1').set('Authorization', AUTH);

    expect(res.status).toBe(200);
    expect(res.body.dados.id).toBe('f1');
  });

  it('returns 404 when film does not exist', async () => {
    service.buscarPorId.mockRejectedValue(new Error('Filme não encontrado'));

    const res = await request(app).get('/api/filmes/missing').set('Authorization', AUTH);

    expect(res.status).toBe(404);
    expect(res.body.sucesso).toBe(false);
  });
});

// ─── POST /api/filmes ─────────────────────────────────────────────────────────

describe('POST /api/filmes', () => {
  it('returns 201 with the new film id on valid body', async () => {
    service.criar.mockResolvedValue('new-id');

    const res = await request(app)
      .post('/api/filmes')
      .set('Authorization', AUTH)
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.sucesso).toBe(true);
    expect(res.body.dados.id).toBe('new-id');
  });

  it('returns 400 when required field "titulo" is missing', async () => {
    const { titulo, ...withoutTitulo } = validBody;

    const res = await request(app)
      .post('/api/filmes')
      .set('Authorization', AUTH)
      .send(withoutTitulo);

    expect(res.status).toBe(400);
    expect(res.body.sucesso).toBe(false);
  });

  it('returns 400 when "ano" has wrong format', async () => {
    const res = await request(app)
      .post('/api/filmes')
      .set('Authorization', AUTH)
      .send({ ...validBody, ano: 'not-a-year' });

    expect(res.status).toBe(400);
    expect(res.body.sucesso).toBe(false);
  });

  it('returns 400 when "assistido" is missing', async () => {
    const { assistido, ...withoutAssistido } = validBody;

    const res = await request(app)
      .post('/api/filmes')
      .set('Authorization', AUTH)
      .send(withoutAssistido);

    expect(res.status).toBe(400);
    expect(res.body.sucesso).toBe(false);
  });
});

// ─── PUT /api/filmes/:id ──────────────────────────────────────────────────────

describe('PUT /api/filmes/:id', () => {
  it('returns 200 on successful update', async () => {
    service.atualizar.mockResolvedValue(undefined);
    service.buscarPorId.mockResolvedValue(filmeFixture as any);

    const res = await request(app)
      .put('/api/filmes/f1')
      .set('Authorization', AUTH)
      .send({ assistido: true });

    expect(res.status).toBe(200);
    expect(res.body.sucesso).toBe(true);
  });

  it('returns 400 when body is empty (Joi .min(1))', async () => {
    const res = await request(app)
      .put('/api/filmes/f1')
      .set('Authorization', AUTH)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.sucesso).toBe(false);
  });

  it('returns 404 when film does not exist', async () => {
    service.atualizar.mockRejectedValue(new Error('Filme não encontrado'));

    const res = await request(app)
      .put('/api/filmes/missing')
      .set('Authorization', AUTH)
      .send({ assistido: true });

    expect(res.status).toBe(404);
  });
});

// ─── DELETE /api/filmes/:id ───────────────────────────────────────────────────

describe('DELETE /api/filmes/:id', () => {
  it('returns 200 on successful delete', async () => {
    service.deletar.mockResolvedValue(undefined);

    const res = await request(app)
      .delete('/api/filmes/f1')
      .set('Authorization', AUTH);

    expect(res.status).toBe(200);
    expect(res.body.sucesso).toBe(true);
  });

  it('returns 404 when film does not exist', async () => {
    service.deletar.mockRejectedValue(new Error('Filme não encontrado'));

    const res = await request(app)
      .delete('/api/filmes/missing')
      .set('Authorization', AUTH);

    expect(res.status).toBe(404);
  });
});

// ─── POST /api/filmes/:id/avaliar ─────────────────────────────────────────────

describe('POST /api/filmes/:id/avaliar', () => {
  it('returns 200 on valid rating', async () => {
    service.avaliarFilme.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/api/filmes/f1/avaliar')
      .set('Authorization', AUTH)
      .send({ nota: 8.5, comentario: 'Great film!' });

    expect(res.status).toBe(200);
    expect(res.body.sucesso).toBe(true);
  });

  it('returns 400 when nota is above 10 (Joi)', async () => {
    const res = await request(app)
      .post('/api/filmes/f1/avaliar')
      .set('Authorization', AUTH)
      .send({ nota: 11 });

    expect(res.status).toBe(400);
    expect(res.body.sucesso).toBe(false);
  });

  it('returns 400 when nota is missing', async () => {
    const res = await request(app)
      .post('/api/filmes/f1/avaliar')
      .set('Authorization', AUTH)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.sucesso).toBe(false);
  });
});

// ─── DELETE /api/filmes/:id/avaliar ──────────────────────────────────────────

describe('DELETE /api/filmes/:id/avaliar', () => {
  it('returns 200 when rating is removed', async () => {
    service.removerAvaliacao.mockResolvedValue(undefined);

    const res = await request(app)
      .delete('/api/filmes/f1/avaliar')
      .set('Authorization', AUTH);

    expect(res.status).toBe(200);
    expect(res.body.sucesso).toBe(true);
  });
});
