import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UsuarioModel } from '../models/usuario.model';
import { env } from '../config/env.config';

const router = Router();
const SALT_ROUNDS = 10;

/**
 * POST /api/auth/login
 * Autentica usuário com email e senha, retorna JWT
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

    const senhaValida = await bcrypt.compare(senha, (usuario as any).password || '');
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
 * Cria novo usuário com email, nome e senha
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

    const hashedPassword = await bcrypt.hash(senha, SALT_ROUNDS);
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
 * Troca a senha do usuário autenticado
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

    const senhaValida = await bcrypt.compare(senhaAtual, (usuario as any).password || '');
    if (!senhaValida) {
      return res.status(401).json({ sucesso: false, erro: 'Senha atual incorreta' });
    }

    const hashedPassword = await bcrypt.hash(novaSenha, SALT_ROUNDS);
    await UsuarioModel.findByIdAndUpdate(usuario._id, { password: hashedPassword } as any);

    return res.json({ sucesso: true, mensagem: 'Senha alterada com sucesso' });
  } catch (erro) {
    console.error('Erro ao trocar senha:', erro);
    return res.status(500).json({ sucesso: false, erro: 'Erro interno no servidor' });
  }
});

export default router;
