/**
 * Mensagens de erro
 */
export const MENSAGENS_ERRO = {
  // Autenticação
  TOKEN_NAO_FORNECIDO: 'Token de autenticação não fornecido',
  TOKEN_INVALIDO: 'Token de autenticação inválido',
  USUARIO_NAO_AUTORIZADO: 'Usuário não autorizado',
  
  // Filmes
  FILME_NAO_ENCONTRADO: 'Filme não encontrado',
  ERRO_CRIAR_FILME: 'Erro ao criar filme',
  ERRO_ATUALIZAR_FILME: 'Erro ao atualizar filme',
  ERRO_DELETAR_FILME: 'Erro ao deletar filme',
  ERRO_BUSCAR_FILMES: 'Erro ao buscar filmes',
  CAMPOS_OBRIGATORIOS: 'Preencha todos os campos obrigatórios',
  
  // APIs Externas
  ERRO_BUSCAR_TMDB: 'Erro ao buscar filme no TMDB',
  ERRO_BUSCAR_OMDB: 'Erro ao buscar ratings no OMDB',
  API_EXTERNA_INDISPONIVEL: 'API externa temporariamente indisponível',
  
  // Avaliações
  AVALIACAO_INVALIDA: 'Avaliação inválida',
  NOTA_FORA_INTERVALO: 'Nota deve estar entre 0 e 10',
  
  // Genérico
  ERRO_INTERNO: 'Erro interno do servidor',
  RECURSO_NAO_ENCONTRADO: 'Recurso não encontrado',
  METODO_NAO_PERMITIDO: 'Método não permitido',
  REQUISICAO_INVALIDA: 'Requisição inválida',
  RATE_LIMIT_EXCEDIDO: 'Muitas requisições. Tente novamente em alguns minutos',
};

/**
 * Mensagens de sucesso
 */
export const MENSAGENS_SUCESSO = {
  FILME_CRIADO: 'Filme criado com sucesso',
  FILME_ATUALIZADO: 'Filme atualizado com sucesso',
  FILME_DELETADO: 'Filme deletado com sucesso',
  AVALIACAO_SALVA: 'Avaliação salva com sucesso',
};

