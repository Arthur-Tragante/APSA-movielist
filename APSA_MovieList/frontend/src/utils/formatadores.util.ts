/**
 * Utilitários de formatação
 */

export const formatarData = (data: string): string => {
  try {
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR');
  } catch {
    return data;
  }
};

export const formatarDuracao = (minutos: string | number): string => {
  const min = typeof minutos === 'string' ? parseInt(minutos, 10) : minutos;
  const horas = Math.floor(min / 60);
  const minutosRestantes = min % 60;

  if (horas > 0) {
    return `${horas}h ${minutosRestantes}min`;
  }

  return `${min}min`;
};

export const formatarNota = (nota: string | number): string => {
  if (!nota || nota === 'N/A') return 'N/A';

  const notaNum = typeof nota === 'string' ? parseFloat(nota) : nota;
  return notaNum.toFixed(1);
};

export const truncarTexto = (texto: string, tamanhoMaximo: number): string => {
  if (texto.length <= tamanhoMaximo) return texto;
  return `${texto.substring(0, tamanhoMaximo)}...`;
};

