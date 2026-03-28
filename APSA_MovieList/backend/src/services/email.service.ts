import nodemailer from 'nodemailer';
import { env } from '../config/env.config';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function enviarEmailRecuperacaoSenha(email: string, nome: string, token: string): Promise<void> {
  const link = `${env.FRONTEND_URL}/redefinir-senha?token=${token}`;

  await transporter.sendMail({
    from: `"Our Horror Story" <${env.EMAIL_FROM || env.SMTP_USER}>`,
    to: email,
    subject: 'Recuperação de senha - Our Horror Story',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #333;">Recuperação de senha</h2>
        <p>Olá, ${nome}!</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <p>Clique no botão abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${link}" style="background-color: #e50914; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-size: 16px;">
            Redefinir senha
          </a>
        </div>
        <p style="color: #666; font-size: 13px;">Se você não solicitou a recuperação de senha, ignore este email. Sua senha não será alterada.</p>
        <p style="color: #999; font-size: 12px;">Ou copie e cole este link no seu navegador:<br/>${link}</p>
      </div>
    `,
  });
}
