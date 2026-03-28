import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { UsuarioModel } from '../models/usuario.model';
import { env } from '../config/env.config';
import { enviarEmailRecuperacaoSenha } from '../services/email.service';

const router = Router();

// Funções de hash usando crypto nativo (sem dependência de bcrypt)
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `pbkdf2:${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  if (!stored) return false;
  if (!stored.startsWith('pbkdf2:')) return false;
  const [, salt, storedHash] = stored.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return hash === storedHash;
}

/**
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Email e senha são obrigatórios',
      });
    }

    const usuario = await UsuarioModel.findOne({ email }).lean();
    if (!usuario) {
      return res.status(401).json({
        sucesso: false,
        erro: 'Email ou senha incorretos',
      });
    }

    const senhaValida = verifyPassword(senha, (usuario as any).password || '');
    if (!senhaValida) {
      return res.status(401).json({
        sucesso: false,
        erro: 'Email ou senha incorretos',
      });
    }

    const token = jwt.sign(
      { uid: usuario._id.toString(), email: usuario.email, nome: usuario.nome || usuario.name },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      sucesso: true,
      dados: {
        token,
        usuario: {
          id: usuario._id.toString(),
          nome: usuario.nome || usuario.name || email.split('@')[0],
          email: usuario.email,
        },
      },
    });
  } catch (erro) {
    console.error('Erro no login:', erro);
    return res.status(500).json({ sucesso: false, erro: 'Erro interno no servidor' });
  }
});

/**
 * POST /api/auth/registrar
 */
router.post('/registrar', async (req: Request, res: Response) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Nome, email e senha são obrigatórios',
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({
        sucesso: false,
        erro: 'A senha deve ter pelo menos 6 caracteres',
      });
    }

    const existente = await UsuarioModel.findOne({ email }).lean();
    if (existente) {
      return res.status(409).json({
        sucesso: false,
        erro: 'Já existe um usuário com este email',
      });
    }

    const hashedPassword = hashPassword(senha);
    const novoUsuario = new UsuarioModel({
      nome,
      name: nome,
      email,
      password: hashedPassword,
    } as any);

    await novoUsuario.save();

    const token = jwt.sign(
      { uid: novoUsuario._id.toString(), email, nome },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      sucesso: true,
      dados: {
        token,
        usuario: {
          id: novoUsuario._id.toString(),
          nome,
          email,
        },
      },
    });
  } catch (erro) {
    console.error('Erro no registro:', erro);
    return res.status(500).json({ sucesso: false, erro: 'Erro interno no servidor' });
  }
});

/**
 * POST /api/auth/trocar-senha
 */
router.post('/trocar-senha', async (req: Request, res: Response) => {
  try {
    const { email, senhaAtual, novaSenha } = req.body;

    if (!email || !senhaAtual || !novaSenha) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Email, senha atual e nova senha são obrigatórios',
      });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({
        sucesso: false,
        erro: 'A nova senha deve ter pelo menos 6 caracteres',
      });
    }

    const usuario = await UsuarioModel.findOne({ email }).lean();
    if (!usuario) {
      return res.status(404).json({ sucesso: false, erro: 'Usuário não encontrado' });
    }

    const senhaValida = verifyPassword(senhaAtual, (usuario as any).password || '');
    if (!senhaValida) {
      return res.status(401).json({ sucesso: false, erro: 'Senha atual incorreta' });
    }

    const hashedPassword = hashPassword(novaSenha);
    await UsuarioModel.findByIdAndUpdate(usuario._id, { password: hashedPassword } as any);

    return res.json({ sucesso: true, mensagem: 'Senha alterada com sucesso' });
  } catch (erro) {
    console.error('Erro ao trocar senha:', erro);
    return res.status(500).json({ sucesso: false, erro: 'Erro interno no servidor' });
  }
});

/**
 * POST /api/auth/recuperar-senha
 */
router.post('/recuperar-senha', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ sucesso: false, erro: 'Email é obrigatório' });
    }

    const usuario = await UsuarioModel.findOne({ email }).lean();

    // Responde com sucesso mesmo se o email não existir (evita enumeração de usuários)
    if (!usuario) {
      return res.json({ sucesso: true, mensagem: 'Se o email existir, você receberá as instruções em breve.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await UsuarioModel.findByIdAndUpdate(usuario._id, {
      resetToken: token,
      resetTokenExpiry: expiry,
    } as any);

    const nome = (usuario as any).nome || (usuario as any).name || email.split('@')[0];
    await enviarEmailRecuperacaoSenha(email, nome, token);

    return res.json({ sucesso: true, mensagem: 'Se o email existir, você receberá as instruções em breve.' });
  } catch (erro) {
    console.error('Erro ao enviar email de recuperação:', erro);
    return res.status(500).json({ sucesso: false, erro: 'Erro ao enviar email de recuperação' });
  }
});

/**
 * POST /api/auth/redefinir-senha
 */
router.post('/redefinir-senha', async (req: Request, res: Response) => {
  try {
    const { token, novaSenha } = req.body;

    if (!token || !novaSenha) {
      return res.status(400).json({ sucesso: false, erro: 'Token e nova senha são obrigatórios' });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ sucesso: false, erro: 'A senha deve ter pelo menos 6 caracteres' });
    }

    const usuario = await UsuarioModel.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    }).lean();

    if (!usuario) {
      return res.status(400).json({ sucesso: false, erro: 'Token inválido ou expirado' });
    }

    const hashedPassword = hashPassword(novaSenha);
    await UsuarioModel.findByIdAndUpdate(usuario._id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    } as any);

    return res.json({ sucesso: true, mensagem: 'Senha redefinida com sucesso' });
  } catch (erro) {
    console.error('Erro ao redefinir senha:', erro);
    return res.status(500).json({ sucesso: false, erro: 'Erro interno no servidor' });
  }
});

export default router;
