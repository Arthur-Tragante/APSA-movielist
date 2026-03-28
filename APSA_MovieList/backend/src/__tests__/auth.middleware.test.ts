import { Request, Response, NextFunction } from 'express';
import { autenticar } from '../middlewares/auth.middleware';
import { RequisicaoAutenticada } from '../types';

// ─── mocks ──────────────────────────────────────────────────────────────────

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

jest.mock('../models/usuario.model', () => ({
  UsuarioModel: {
    findOne: jest.fn(),
  },
}));

jest.mock('../config/env.config', () => ({
  env: {
    JWT_SECRET: 'test-secret',
    MONGODB_ENABLED: true,
  },
}));

import jwt from 'jsonwebtoken';
import { UsuarioModel } from '../models/usuario.model';

// ─── helpers ────────────────────────────────────────────────────────────────

const mockJwt = jwt as jest.Mocked<typeof jwt>;
const mockModel = UsuarioModel as jest.Mocked<typeof UsuarioModel>;

function makeReq(overrides: Partial<Request> = {}): RequisicaoAutenticada {
  return { headers: {}, ...overrides } as unknown as RequisicaoAutenticada;
}

function makeRes(): Response {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

const next: NextFunction = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── JWT path ────────────────────────────────────────────────────────────────

describe('JWT authentication', () => {
  it('populates req.usuario and calls next() on a valid token', async () => {
    (mockJwt.verify as jest.Mock).mockReturnValue({
      uid: 'u1',
      email: 'alice@example.com',
      nome: 'Alice',
    });

    const req = makeReq({ headers: { authorization: 'Bearer valid.token.here' } });
    const res = makeRes();

    await autenticar(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.usuario).toEqual({ uid: 'u1', email: 'alice@example.com', nome: 'Alice' });
    expect(res.status).not.toHaveBeenCalled();
  });

  it('derives nome from email when the token has no nome field', async () => {
    (mockJwt.verify as jest.Mock).mockReturnValue({
      uid: 'u2',
      email: 'bob@example.com',
    });

    const req = makeReq({ headers: { authorization: 'Bearer valid.token' } });
    const res = makeRes();

    await autenticar(req, res, next);

    expect(req.usuario?.nome).toBe('bob');
  });

  it('returns 401 when the JWT is invalid', async () => {
    (mockJwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid signature');
    });

    const req = makeReq({ headers: { authorization: 'Bearer bad.token' } });
    const res = makeRes();

    await autenticar(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ sucesso: false })
    );
    expect(next).not.toHaveBeenCalled();
  });
});

// ─── no auth ──────────────────────────────────────────────────────────────────

describe('missing authentication', () => {
  it('returns 401 when no auth headers are provided', async () => {
    const req = makeReq({ headers: {} });
    const res = makeRes();

    await autenticar(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

// ─── X-User-Email fallback ────────────────────────────────────────────────────

describe('X-User-Email fallback', () => {
  it('populates req.usuario and calls next() when email is found in DB', async () => {
    (mockModel.findOne as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: { toString: () => 'mongo-id' },
        email: 'carol@example.com',
        nome: 'Carol',
        name: undefined,
      }),
    });

    const req = makeReq({ headers: { 'x-user-email': 'carol@example.com' } });
    const res = makeRes();

    await autenticar(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.usuario).toEqual({
      uid: 'mongo-id',
      email: 'carol@example.com',
      nome: 'Carol',
    });
  });

  it('returns 403 when email is not found in DB', async () => {
    (mockModel.findOne as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    const req = makeReq({ headers: { 'x-user-email': 'unknown@example.com' } });
    const res = makeRes();

    await autenticar(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('falls back to email username when user has no nome or name', async () => {
    (mockModel.findOne as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: { toString: () => 'mongo-id' },
        email: 'dave@example.com',
        nome: undefined,
        name: undefined,
      }),
    });

    const req = makeReq({ headers: { 'x-user-email': 'dave@example.com' } });
    const res = makeRes();

    await autenticar(req, res, next);

    expect(req.usuario?.nome).toBe('dave');
  });
});
