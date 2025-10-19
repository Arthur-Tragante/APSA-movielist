/**
 * Utilitários de validação
 */

export const validarEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validarSenha = (senha: string): boolean => {
  return senha.length >= 6;
};

export const validarCampoObrigatorio = (valor: string): boolean => {
  return valor.trim().length > 0;
};

export const validarAno = (ano: string): boolean => {
  const anoNumero = parseInt(ano, 10);
  const anoAtual = new Date().getFullYear();
  return anoNumero >= 1800 && anoNumero <= anoAtual + 5;
};

export const validarDuracao = (duracao: string): boolean => {
  const duracaoNumero = parseInt(duracao, 10);
  return duracaoNumero > 0 && duracaoNumero <= 1000;
};

